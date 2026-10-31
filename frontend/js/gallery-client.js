// gallery-client.js
// Galeri asal kekal jika backend belum dikonfigurasi atau sambungan gagal.
(function () {
  'use strict';
  let lastData = '';
  let loading = false;
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    try {
      const response = await fetch('/api/gallery/images', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.configured || !Array.isArray(data.images)) return;
      const images = data.images.filter(image => {
        try { return new URL(image.url).protocol === 'https:'; } catch { return false; }
      }).map(image => [image.url, image.title]);
      const serialized = JSON.stringify(images);
      if (serialized !== lastData) {
        initGallery(images);
        lastData = serialized;
      }
    } catch (error) {
      console.warn('Galeri Cloudinary belum tersedia:', error.message);
    } finally { loading = false; }
  }
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    setInterval(refresh, 60000);
  });
  document.addEventListener('visibilitychange', refresh);
})();
