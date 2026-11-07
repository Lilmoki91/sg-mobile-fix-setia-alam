// Galeri menggunakan rekod API; kegagalan muat tidak memadam gambar yang sudah dipaparkan.
(function () {
  'use strict';
  let lastData = '', loading = false, state, retry;
  const t = (ms, en) => document.documentElement.lang === 'en' ? en : ms;
  function status(text, failed = false) {
    if (!state) return;
    state.textContent = text;
    state.hidden = !text;
    retry.hidden = !failed;
  }
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    if (retry) retry.disabled = true;
    if (!lastData) status(t('Memuatkan gambar kedai…', 'Loading shop images…'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/gallery/images', { cache: 'no-store', signal: controller.signal });
      let data;
      try { data = await response.json(); }
      catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error(t('Respons galeri tidak sah. Semak deployment Pages Functions.', 'Invalid gallery response. Check the Pages Functions deployment.'));
      }
      if (!response.ok) throw new Error(data?.error || `Gallery API: HTTP ${response.status}`);
      if (!Array.isArray(data?.images)) throw new Error(t('Senarai gambar API tidak sah.', 'Invalid API image list.'));
      // Jangan abaikan gambar sah hanya kerana flag configured hilang.
      const images = data.images.filter(image => {
        try { return typeof image?.url === 'string' && new URL(image.url).protocol === 'https:'; }
        catch { return false; }
      }).map(image => [image.url, image.title || t('Gambar kedai', 'Shop image')]);
      if (images.length !== data.images.length) throw new Error(t('URL gambar galeri tidak sah. Semak rekod galeri.', 'Invalid gallery image URL. Check gallery records.'));
      if (typeof window.initGallery !== 'function') throw new Error(t('Paparan galeri belum sedia. Semak script.js.', 'Gallery renderer is not ready. Check script.js.'));
      const serialized = JSON.stringify(images);
      if (serialized !== lastData) {
        window.initGallery(images);
        lastData = serialized;
      }
      status(images.length ? '' : t('Tiada gambar kedai untuk dipaparkan.', 'No shop images to display.'));
    } catch (error) {
      console.warn('Galeri gagal dimuatkan:', error.message);
      status(error.name === 'AbortError'
        ? t('Galeri belum membalas. Cuba muat semula.', 'Gallery request timed out. Try again.')
        : error instanceof TypeError
          ? t('Gagal menghubungi galeri. Semak sambungan internet.', 'Cannot reach the gallery. Check your connection.')
          : error.message, true);
    } finally {
      clearTimeout(timeout);
      loading = false;
      if (retry) retry.disabled = false;
    }
  }
  function start() {
    const container = document.getElementById('gambarScrollContainer');
    if (!container) return;
    state = document.createElement('p');
    state.className = 'text-sm text-gray-500 my-3';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-live', 'polite');
    retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Muat semula / Retry';
    retry.className = 'px-4 py-2 rounded-xl bg-blue-600 text-white';
    retry.hidden = true;
    retry.addEventListener('click', refresh);
    container.after(state, retry);
    refresh();
    setInterval(refresh, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('online', refresh);
})();
