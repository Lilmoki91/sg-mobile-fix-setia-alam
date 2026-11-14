// testimonials-ui.js
import { createScrollDots } from './scroll-dots.js';
let disconnect = () => {};
let activeStop = null;
export function stopTestimonialVideo() { activeStop?.(); }

export function initTestimonials(videos = []) {
  const container = document.getElementById('videoScrollContainer');
  const dots = document.getElementById('videoDotsContainer');
  if (!container || !dots) return;
  disconnect(); stopTestimonialVideo(); container.replaceChildren();
  const en = document.documentElement.lang === 'en';
  const items = videos.map(video => {
    const title = en ? video.titleEn : video.titleMs;
    const card = document.createElement('div');
    card.className = 'snap-center flex-shrink-0';
    card.style.cssText = 'flex:0 0 auto; width:100%; max-width:420px;';
    const frame = document.createElement('div');
    frame.style.cssText = 'position:relative;width:100%;height:0;padding-top:177.78%;background:#000;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.15);';
    const poster = document.createElement('button'); poster.type = 'button';
    poster.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:0;margin:0;padding:16px;cursor:pointer;color:white;background:linear-gradient(160deg,#0f172a,#1e293b 55%,#000);-webkit-tap-highlight-color:transparent;';
    poster.innerHTML = '<i class="fab fa-tiktok" style="font-size:40px" aria-hidden="true"></i><span style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.95);color:black;display:flex;align-items:center;justify-content:center;font-size:28px;padding-left:5px;box-shadow:0 6px 20px rgba(0,0,0,.4)"><i class="fas fa-play" aria-hidden="true"></i></span><span style="font-size:14px;font-weight:600"></span>';
    poster.lastElementChild.textContent = title;
    frame.appendChild(poster);
    poster.addEventListener('click', () => {
      window.__tiktokStop?.();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.tiktok.com/player/v1/${video.id}?autoplay=1&controls=1&description=0&music_info=0&rel=0`;
      iframe.title = title; iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', ''); iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;border:none;border-radius:16px;';
      frame.replaceChildren(iframe);
      const stop = () => {
        frame.replaceChildren(poster);
        if (window.__tiktokStop === stop) window.__tiktokStop = null;
        if (activeStop === stop) activeStop = null;
      };
      activeStop = stop; window.__tiktokStop = stop;
    });
    const fallback = document.createElement('a');
    fallback.href = `https://www.tiktok.com/@sgmobilesetiaalam/video/${video.id}`;
    fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
    fallback.style.cssText = 'display:inline-block;margin-top:10px;font-size:13px;font-weight:600;color:#0ea5e9;text-decoration:underline;';
    fallback.dataset.i18nKey = 'VideoOpenTikTok';
    fallback.textContent = window.translations[en ? 'en' : 'ms'].VideoOpenTikTok;
    card.append(frame, fallback); container.appendChild(card); return card;
  });
  disconnect = createScrollDots(container, dots, items, index => `${en ? 'Go to testimonial' : 'Pergi ke testimoni'} ${index + 1}`);
}
