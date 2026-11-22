import { translations } from '../i18n/translations.js';

let testimonialObserver = null;
let stopTestimonialVideo = null;
let testimonialsStarted = false;

// Senarai hanya datang daripada Firestore melalui API backend sedia ada.
export function startTestimonials() {
  const container = document.getElementById('videoScrollContainer');
  const home = document.getElementById('home-tab');
  const status = document.getElementById('testimonial-status');
  const retry = document.getElementById('testimonial-retry');
  if (testimonialsStarted || !container || !home || !status || !retry) return;
  testimonialsStarted = true;

  let videos = null, busy = false, failed = false;
  let renderedKey, refreshAgain = false;
  const en = () => document.documentElement.lang === 'en';
  const active = () => home.classList.contains('active') && !document.hidden;

  function labels() {
    status.textContent = failed
      ? (videos?.length
        ? (en() ? 'Unable to update testimonials. Showing the last list loaded from Firebase.' : 'Testimoni tidak dapat dikemas kini. Memaparkan senarai terakhir daripada Firebase.')
        : (en() ? 'Unable to load testimonials. Please try again.' : 'Testimoni tidak dapat dimuatkan. Sila cuba semula.'))
      : videos === null
        ? (en() ? 'Loading testimonials…' : 'Memuatkan testimoni…')
        : !videos.length ? (en() ? 'No testimonials to display.' : 'Tiada testimoni untuk dipaparkan.') : '';
    status.hidden = !status.textContent;
    retry.textContent = busy ? (en() ? 'Loading…' : 'Memuatkan…') : (en() ? 'Refresh' : 'Muat semula');
    retry.hidden = !failed;
    retry.style.display = failed ? 'inline-flex' : 'none';
    retry.disabled = busy;
    container.setAttribute('aria-busy', String(busy));
  }

  function render() {
    if (videos === null) return;
    const key = JSON.stringify([document.documentElement.lang, videos]);
    if (key === renderedKey) return;
    initTestimonials(videos);
    renderedKey = key;
  }

  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    labels();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/phones/testimonials', {
        credentials: 'same-origin', cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data?.videos) || data.videos.length > 30 || data.videos.some(v =>
        !v || typeof v.id !== 'string' || !/^\d{19}$/.test(v.id) ||
        typeof v.titleMs !== 'string' || typeof v.titleEn !== 'string'
      )) throw new Error('Invalid testimonials');
      videos = data.videos;
      render();
      failed = false;
    } catch (error) {
      failed = true;
      console.warn('[testimonials] Testimoni Firebase gagal dimuatkan:', error);
    } finally {
      clearTimeout(timeout);
      busy = false;
      labels();
      if (refreshAgain) {
        refreshAgain = false;
        if (active()) refresh();
      }
    }
  }

  const stopVideo = () => stopTestimonialVideo?.();
  retry.addEventListener('click', refresh);
  new MutationObserver(() => {
    try { render(); }
    catch (error) {
      failed = true;
      console.error('[testimonials] Paparan bahasa gagal:', error);
    }
    labels();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new MutationObserver(() => {
    if (active()) refresh();
    else stopVideo();
  }).observe(home, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVideo();
    else if (active()) refresh();
  });
  document.addEventListener('sgm-auth-changed', event => {
    if (!event.detail) { stopVideo(); return; }
    if (busy) refreshAgain = true;
    else if (active()) refresh();
  });
  window.addEventListener('online', () => { if (active()) refresh(); });
  window.addEventListener('pageshow', event => { if (event.persisted && active()) refresh(); });
  setInterval(() => { if (active()) refresh(); }, 60000);
  labels();
  refresh();
}

export function initTestimonials(managedVideos = []) {
  const container = document.getElementById('videoScrollContainer');
  const dotsContainer = document.getElementById('videoDotsContainer');
  if (!container || !dotsContainer) return;

  testimonialObserver?.disconnect();
  stopTestimonialVideo?.();
  const videos = managedVideos.map(v => [v.id, document.documentElement.lang === 'en' ? v.titleEn : v.titleMs]);

  const tr = (key) => {
    const lang = document.documentElement.lang || 'ms';
    const dict = translations[lang] || translations.ms;
    return dict[key] || key;
  };

  container.replaceChildren();
  dotsContainer.replaceChildren();
  const dotElements = [];

  videos.forEach(([id, titleKey], index) => {
    const videoUrl = `https://www.tiktok.com/@sgmobilesetiaalam/video/${id}`;
    const card = document.createElement('div');
    card.className = 'snap-center flex-shrink-0';
    card.style.cssText = 'flex: 0 0 auto; width: 100%; max-width: 420px;';

    const frame = document.createElement('div');
    frame.style.cssText = 'position:relative;width:100%;height:0;padding-top:177.78%;background:#000;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.15);';

    const poster = document.createElement('button');
    poster.type = 'button';
    poster.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:0;margin:0;padding:16px;cursor:pointer;color:#fff;background:linear-gradient(160deg,#0f172a 0%,#1e293b 55%,#000 100%);-webkit-tap-highlight-color:transparent;';
    poster.innerHTML = `
      <i class="fab fa-tiktok" style="font-size:40px;" aria-hidden="true"></i>
      <span style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.95);color:#000;display:flex;align-items:center;justify-content:center;font-size:28px;padding-left:5px;box-shadow:0 6px 20px rgba(0,0,0,.4);"><i class="fas fa-play" aria-hidden="true"></i></span>
      <span style="font-size:14px;font-weight:600;"></span>
    `;
    poster.lastElementChild.textContent = titleKey;
    frame.appendChild(poster);

    poster.addEventListener('click', () => {
      if (typeof window.__tiktokStop === 'function') window.__tiktokStop();
      const iframe = document.createElement('iframe');
      // iframe.src = `https://www.tiktok.com/player/v1/${id}?autoplay=1&controls=1&description=0&music_info=0&rel=0`;
      iframe.src = `https://www.tiktok.com/embed/v2/${id}`;
      iframe.title = titleKey;
      iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;border:none;border-radius:16px;';
      frame.replaceChildren(iframe);
      const stop = () => {
        frame.replaceChildren(poster);
        if (window.__tiktokStop === stop) window.__tiktokStop = null;
        if (stopTestimonialVideo === stop) stopTestimonialVideo = null;
      };
      stopTestimonialVideo = stop;
      window.__tiktokStop = stop;
    });

    const fallback = document.createElement('a');
    fallback.href = videoUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.style.cssText = 'display:inline-block;margin-top:10px;font-size:13px;font-weight:600;color:#0ea5e9;text-decoration:underline;';
    fallback.setAttribute('data-i18n-key', 'VideoOpenTikTok');
    fallback.textContent = tr('VideoOpenTikTok');

    card.append(frame, fallback);
    container.appendChild(card);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? 'w-7 bg-blue-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`;
    dot.setAttribute('aria-label', `${document.documentElement.lang === 'en' ? 'Go to testimonial' : 'Pergi ke testimoni'} ${index + 1}`);
    dot.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    dotsContainer.appendChild(dot);
    dotElements.push({ card, dot });
  });

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeIndex = dotElements.findIndex(item => item.card === entry.target);
      dotElements.forEach((item, idx) => {
        item.dot.className = idx === activeIndex
          ? 'h-2 w-5 bg-blue-600 rounded-full transition-all duration-300'
          : 'h-2 w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300';
      });
    });
  }, { root: container, threshold: 0.6 });

  testimonialObserver = observer;
  dotElements.forEach(item => observer.observe(item.card));
}
