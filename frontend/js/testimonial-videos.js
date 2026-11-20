// Testimoni dimuatkan secara bebas daripada bootstrap modul lain.
(function () {
  'use strict';
  const container = document.getElementById('videoScrollContainer');
  const home = document.getElementById('home-tab');
  if (!container || !home) return;
  const rendererUrl = new URL('./hook/esm/features/testimonials.js?v=2', document.currentScript.src).href;
  const defaults = ['7640849215236705544', '7637524923703037202', '7668308481039977735']
    .map((id, index) => ({ id, titleMs: `Testimoni ${index + 1}`, titleEn: `Testimonial ${index + 1}` }));
  const status = document.getElementById('testimonial-status');
  const retry = document.getElementById('testimonial-retry');
  let videos = null, loaded = false, busy = false, failed = false;
  let rendererPromise, renderedKey, refreshAgain = false;
  const en = () => document.documentElement.lang === 'en';
  const active = () => home.classList.contains('active') && !document.hidden;

  function labels() {
    status.textContent = failed
      ? (videos?.length
        ? (en() ? 'Unable to update testimonials. Showing the available list.' : 'Senarai terkini tidak dapat dimuatkan. Memaparkan senarai testimoni yang tersedia.')
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

  function getRenderer() {
    if (!rendererPromise) {
      rendererPromise = import(rendererUrl).catch(error => {
        rendererPromise = null;
        throw error;
      });
    }
    return rendererPromise;
  }

  async function render() {
    if (videos === null) return;
    const renderer = await getRenderer();
    const key = JSON.stringify([document.documentElement.lang, videos]);
    if (key === renderedKey) return;
    renderer.initTestimonials(videos);
    // Jangan tandakan berjaya sebelum kad benar-benar dibina.
    renderedKey = key;
  }

  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    labels();
    try {
      await getRenderer();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch('/api/phones/testimonials', {
          credentials: 'same-origin', cache: 'no-store', signal: controller.signal
        });
        if (!response.ok) {
          const error = new Error('HTTP ' + response.status);
          error.status = response.status;
          throw error;
        }
        const data = await response.json();
        if (!Array.isArray(data.videos) || data.videos.length > 30 || data.videos.some(v =>
          !v || typeof v.id !== 'string' || !/^\d{19}$/.test(v.id) ||
          typeof v.titleMs !== 'string' || typeof v.titleEn !== 'string'
        )) throw new Error('Invalid testimonials');
        videos = data.videos;
        loaded = true;
        failed = false;
      } catch (error) {
        failed = true;
        // ID asal daripada konfigurasi backend; senarai kosong admin tetap dihormati.
        if (!loaded && ![401, 403].includes(error.status)) videos = defaults;
        console.warn('[testimonials] Senarai tidak dapat dikemas kini:', error);
      } finally {
        clearTimeout(timeout);
      }
      await render();
    } catch (error) {
      failed = true;
      console.error('[testimonials] Renderer gagal dimuatkan:', error);
    } finally {
      busy = false;
      labels();
      if (refreshAgain) {
        refreshAgain = false;
        if (active()) refresh();
      }
    }
  }

  function stopVideo() {
    if (container.querySelector('iframe')) window.__tiktokStop?.();
  }
  retry.addEventListener('click', refresh);
  new MutationObserver(() => {
    render().catch(error => {
      failed = true;
      console.error('[testimonials] Paparan bahasa gagal:', error);
      labels();
    });
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
})();
