import { translations } from '../i18n/translations.js';

let testimonialObserver = null;
let stopTestimonialVideo = null;

// 🔥 KOTAK DEBUG (Untuk tunjuk status di skrin)
function showStatus(title, msg, isError = false) {
  const old = document.getElementById('debug-testimoni');
  if (old) old.remove();
  
  const div = document.createElement('div');
  div.id = 'debug-testimoni';
  div.style.cssText = `position:fixed;bottom:80px;left:10px;right:10px;padding:12px;z-index:99999;border-radius:8px;font-size:12px;font-family:monospace;white-space:pre-wrap;box-shadow:0 4px 6px rgba(0,0,0,0.5); ${isError ? 'background:#ffebee;color:#c62828;border:2px solid #c62828;' : 'background:#e8f5e9;color:#2e7d32;border:2px solid #2e7d32;'}`;
  div.innerHTML = `<b>${title}</b><br>${msg}`;
  document.body.appendChild(div);
  
  setTimeout(() => { if(div) div.remove(); }, 8000);
}

async function fetchVideos() {
  if (!window.db) return { success: false, msg: "window.db tiada (Firebase tak siap)." };

  // Cuba pelbagai nama collection yang mungkin digunakan oleh Admin Panel anda
  const possibleCollections = ['testimonials', 'testimonial_videos', 'videos', 'video_testimoni'];
  
  for (const colName of possibleCollections) {
    try {
      const snapshot = await window.db.collection(colName).get();
      if (!snapshot.empty) {
        const videos = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          // Ambil video jika ia tidak disorokkan (published/active)
          if (data.published !== false && data.active !== false && data.hidden !== true) {
            videos.push({
              id: data.videoId || data.tiktokId || data.url || doc.id,
              titleMs: data.titleMs || data.title || "Testimoni",
              titleEn: data.titleEn || data.title || "Testimonial",
              order: data.order || 99
            });
          }
        });
        
        if (videos.length > 0) {
          videos.sort((a, b) => a.order - b.order);
          showStatus("✅ BERJAYA!", `Jumpa ${videos.length} video dalam collection '${colName}'.`, false);
          return { success: true, videos };
        }
      }
    } catch (e) {
      // Abaikan jika collection tiada, cuba yang seterusnya
    }
  }
  
  showStatus("⚠️ DATA TIDAK DIJUMPAI", "Firebase berjaya dihubungi, tetapi tiada video aktif dalam collection 'testimonials', 'videos', atau 'testimonial_videos'.", true);
  return { success: false, videos: [] };
}

export async function initTestimonials() {
  const container = document.getElementById('videoScrollContainer');
  const dotsContainer = document.getElementById('videoDotsContainer');
  if (!container || !dotsContainer) return;

  testimonialObserver?.disconnect();
  stopTestimonialVideo?.();

  // Tunggu Firebase sedia
  let attempts = 0;
  while (!window.db && attempts < 20) {
    await new Promise(r => setTimeout(r, 200));
    attempts++;
  }

  const result = await fetchVideos();
  if (!result.success || result.videos.length === 0) return;

  const videos = result.videos.map(v => [
    v.id, 
    document.documentElement.lang === 'en' ? v.titleEn : v.titleMs
  ]);

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
      iframe.src = `https://www.tiktok.com/player/v1/${id}?autoplay=1&controls=1&description=0&music_info=0&rel=0`;
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
    dot.setAttribute('aria-label', `Pergi ke testimoni ${index + 1}`);
    dot.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    dotsContainer.appendChild(dot);
    dotElements.push({ card, dot });
  });

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
