import { translations } from '../i18n/translations.js';

const TESTIMONIAL_API_URL = '/api/phones/testimonials';
const FETCH_TIMEOUT_MS = 45000;
const POLL_INTERVAL_MS = 60000;
const MAX_VIDEOS = 30;
const TIKTOK_ID_REGEX = /^\d{19}$/;

let testimonialObserver = null;
let stopTestimonialVideo = null;
let testimonialsStarted = false;

function getCurrentLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'ms';
}

function translate(key) {
  const lang = getCurrentLang();
  const dict = translations[lang] || translations.ms;
  return dict[key] || key;
}

function isValidVideoItem(video) {
  return Boolean(
    video &&
    typeof video.id === 'string' &&
    TIKTOK_ID_REGEX.test(video.id) &&
    typeof video.titleMs === 'string' &&
    typeof video.titleEn === 'string'
  );
}

function setDotActiveState(dot, isActive) {
  dot.className = isActive
    ? 'h-2.5 w-7 rounded-full bg-blue-600 transition-all duration-300'
    : 'h-2.5 w-2.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300';
}

// Senarai hanya datang daripada Firestore melalui API backend sedia ada.
export function startTestimonials() {
  const container = document.getElementById('videoScrollContainer');
  const home = document.getElementById('home-tab');
  const status = document.getElementById('testimonial-status');
  const retry = document.getElementById('testimonial-retry');

  if (testimonialsStarted || !container || !home || !status || !retry) return;
  testimonialsStarted = true;

  const state = {
    videos: null,
    busy: false,
    failed: false,
    renderedKey: null,
    refreshAgain: false,
  };

  const isEn = () => getCurrentLang() === 'en';
  const isActive = () => home.classList.contains('active') && !document.hidden;

  function syncLabels() {
    if (state.failed) {
      status.textContent = state.videos?.length
        ? (isEn()
          ? 'Unable to update testimonials. Showing the last list loaded from Firebase.'
          : 'Testimoni tidak dapat dikemas kini. Memaparkan senarai terakhir daripada Firebase.')
        : (isEn()
          ? 'Unable to load testimonials. Please try again.'
          : 'Testimoni tidak dapat dimuatkan. Sila cuba semula.');
    } else if (state.videos === null) {
      status.textContent = isEn() ? 'Loading testimonials…' : 'Memuatkan testimoni…';
    } else if (!state.videos.length) {
      status.textContent = isEn() ? 'No testimonials to display.' : 'Tiada testimoni untuk dipaparkan.';
    } else {
      status.textContent = '';
    }

    status.hidden = !status.textContent;
    retry.textContent = state.busy
      ? (isEn() ? 'Loading…' : 'Memuatkan…')
      : (isEn() ? 'Refresh' : 'Muat semula');
    retry.hidden = !state.failed;
    retry.style.display = state.failed ? 'inline-flex' : 'none';
    retry.disabled = state.busy;
    container.setAttribute('aria-busy', String(state.busy));
  }

  function renderIfNeeded() {
    if (state.videos === null) return;
    const key = JSON.stringify([getCurrentLang(), state.videos]);
    if (key === state.renderedKey) return;
    initTestimonials(state.videos);
    state.renderedKey = key;
  }

  async function refresh() {
    if (state.busy || document.hidden) return;
    state.busy = true;
    syncLabels();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(TESTIMONIAL_API_URL, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (
        !Array.isArray(data?.videos) ||
        data.videos.length > MAX_VIDEOS ||
        data.videos.some((video) => !isValidVideoItem(video))
      ) {
        throw new Error('Invalid testimonials payload');
      }

      state.videos = data.videos;
      state.failed = false;
      renderIfNeeded();
    } catch (error) {
      state.failed = true;
      console.warn('[testimonials] Testimoni Firebase gagal dimuatkan:', error);
    } finally {
      clearTimeout(timeoutId);
      state.busy = false;
      syncLabels();

      if (state.refreshAgain) {
        state.refreshAgain = false;
        if (isActive()) refresh();
      }
    }
  }

  const stopVideo = () => stopTestimonialVideo?.();

  retry.addEventListener('click', refresh);

  const langObserver = new MutationObserver(() => {
    try {
      renderIfNeeded();
    } catch (error) {
      state.failed = true;
      console.error('[testimonials] Paparan bahasa gagal:', error);
    }
    syncLabels();
  });
  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });

  const homeObserver = new MutationObserver(() => {
    if (isActive()) refresh();
    else stopVideo();
  });
  homeObserver.observe(home, {
    attributes: true,
    attributeFilter: ['class'],
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVideo();
    else if (isActive()) refresh();
  });

  document.addEventListener('sgm-auth-changed', (event) => {
    if (!event.detail) {
      stopVideo();
      return;
    }
    if (state.busy) state.refreshAgain = true;
    else if (isActive()) refresh();
  });

  window.addEventListener('online', () => {
    if (isActive()) refresh();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted && isActive()) refresh();
  });

  setInterval(() => {
    if (isActive()) refresh();
  }, POLL_INTERVAL_MS);

  syncLabels();
  refresh();
}

function createTestimonialCard(video, index, isEn) {
  const title = isEn ? video.titleEn : video.titleMs;
  const videoUrl = `https://www.tiktok.com/@sgmobilesetiaalam/video/${video.id}`;

  const card = document.createElement('div');
  card.className = 'snap-center flex-shrink-0';
  card.style.cssText = 'flex: 0 0 auto; width: 100%; max-width: 420px;';

  const frame = document.createElement('div');
  frame.style.cssText =
    'position:relative;width:100%;height:0;padding-top:177.78%;background:#000;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.15);';

  const poster = document.createElement('button');
  poster.type = 'button';
  poster.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:0;margin:0;padding:16px;cursor:pointer;color:#fff;background:linear-gradient(160deg,#0f172a 0%,#1e293b 55%,#000 100%);-webkit-tap-highlight-color:transparent;';

  const icon = document.createElement('i');
  icon.className = 'fab fa-tiktok';
  icon.style.fontSize = '40px';
  icon.setAttribute('aria-hidden', 'true');

  const playBadge = document.createElement('span');
  playBadge.style.cssText =
    'width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.95);color:#000;display:flex;align-items:center;justify-content:center;font-size:28px;padding-left:5px;box-shadow:0 6px 20px rgba(0,0,0,.4);';
  playBadge.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';

  const titleLabel = document.createElement('span');
  titleLabel.style.cssText = 'font-size:14px;font-weight:600;';
  titleLabel.textContent = title;

  poster.append(icon, playBadge, titleLabel);
  frame.appendChild(poster);

  // -----------------------------------------------------------------
    poster.addEventListener('click', () => {
    if (typeof window.__tiktokStop === 'function') {
      window.__tiktokStop();
    }

    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      description: '0',
      music_info: '0',
      rel: '0',
    });

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.tiktok.com/player/v1/${video.id}?${params.toString()}`;
    iframe.title = title;
    iframe.loading = 'eager';
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.cssText =
      'position:absolute;inset:0;display:block;width:100%;height:100%;border:none;border-radius:16px;';

    frame.replaceChildren(iframe);

    const stop = () => {
      frame.replaceChildren(poster);
      if (window.__tiktokStop === stop) window.__tiktokStop = null;
      if (stopTestimonialVideo === stop) stopTestimonialVideo = null;
    };

    stopTestimonialVideo = stop;
    window.__tiktokStop = stop;
  });

  // ------------------------------------------------------------------
  const fallback = document.createElement('a');
  fallback.href = videoUrl;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.style.cssText =
    'display:inline-block;margin-top:10px;font-size:13px;font-weight:600;color:#0ea5e9;text-decoration:underline;';
  fallback.setAttribute('data-i18n-key', 'VideoOpenTikTok');
  fallback.textContent = translate('VideoOpenTikTok');

  card.append(frame, fallback);

  const dot = document.createElement('button');
  dot.type = 'button';
  setDotActiveState(dot, index === 0);
  dot.setAttribute(
    'aria-label',
    `${isEn ? 'Go to testimonial' : 'Pergi ke testimoni'} ${index + 1}`
  );
  dot.addEventListener('click', () => {
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  return { card, dot };
}

export function initTestimonials(managedVideos = []) {
  const container = document.getElementById('videoScrollContainer');
  const dotsContainer = document.getElementById('videoDotsContainer');
  if (!container || !dotsContainer) return;

  testimonialObserver?.disconnect();
  stopTestimonialVideo?.();

  container.replaceChildren();
  dotsContainer.replaceChildren();

  const isEn = getCurrentLang() === 'en';
  const dotElements = [];

  managedVideos.forEach((video, index) => {
    const { card, dot } = createTestimonialCard(video, index, isEn);
    container.appendChild(card);
    dotsContainer.appendChild(dot);
    dotElements.push({ card, dot });
  });

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeIndex = dotElements.findIndex((item) => item.card === entry.target);
        dotElements.forEach((item, idx) => {
          setDotActiveState(item.dot, idx === activeIndex);
        });
      });
    },
    { root: container, threshold: 0.6 }
  );

  testimonialObserver = observer;
  dotElements.forEach((item) => observer.observe(item.card));
}
