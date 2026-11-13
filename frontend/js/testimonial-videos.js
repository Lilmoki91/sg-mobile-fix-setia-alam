// testimonial-videos.js — paparan pelanggan menggunakan senarai admin.
(function () {
  'use strict';
  const host = document.getElementById('Testimoni');
  if (!host) return;
  const container = document.getElementById('videoScrollContainer');
  let videos = [], loaded = false, busy = false, failed = false;
  const en = () => document.documentElement.lang === 'en';
  const status = document.createElement('p');
  status.className = 'phone-note';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'phone-tiktok-badge';
  container.before(status);
  status.after(retry);
  function labels() {
    status.textContent = failed
      ? (en() ? 'Unable to load testimonials. Please refresh.' : 'Testimoni tidak dapat dimuatkan. Cuba muat semula.')
      : !loaded
        ? (en() ? 'Loading testimonials…' : 'Memuatkan testimoni…')
        : !videos.length ? (en() ? 'No testimonials to display.' : 'Tiada testimoni untuk dipaparkan.') : '';
    retry.textContent = en() ? 'Refresh' : 'Muat semula';
    retry.hidden = !failed;
    retry.style.display = failed ? 'inline-flex' : 'none';
    retry.disabled = busy;
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true; labels();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/phones/testimonials', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data.videos) || data.videos.length > 30 || data.videos.some(v => !v || typeof v.id !== 'string' || !/^\d{19}$/.test(v.id) || typeof v.titleMs !== 'string' || typeof v.titleEn !== 'string')) throw new Error('Invalid testimonials');
      if (!loaded || JSON.stringify(data.videos) !== JSON.stringify(videos)) {
        videos = data.videos;
        initTestimonials(videos);
      }
      loaded = true; failed = false;
    } catch { failed = true; }
    finally { clearTimeout(timeout); busy = false; labels(); }
  }
  retry.addEventListener('click', refresh);
  window.addEventListener('phones-language', () => {
    if (loaded) initTestimonials(videos);
    labels();
  });
  const home = document.getElementById('home-tab');
  new MutationObserver(() => {
    if (!home.classList.contains('active')) stopTestimonialVideo?.();
    else refresh();
  }).observe(home, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTestimonialVideo?.();
    else if (home.classList.contains('active')) refresh();
  });
  setInterval(() => { if (home.classList.contains('active')) refresh(); }, 60000);
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  labels();
})();
