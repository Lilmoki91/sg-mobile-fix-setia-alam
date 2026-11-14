// gellery-ui.js
import { createScrollDots } from './scroll-dots.js';
let disconnectGallery = () => {};

export function initGallery(managedImages = []) {
  const container = document.getElementById('gambarScrollContainer');
  const dots = document.getElementById('galleryDotsContainer');
  if (!container || !dots) return;
  disconnectGallery(); container.replaceChildren();
  const images = Array.isArray(managedImages) ? managedImages : [];
  const items = images.map(([src, alt]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative snap-center flex-shrink-0 cursor-pointer group';
    wrapper.style.width = '250px';
    const image = document.createElement('img');
    image.src = src; image.alt = alt; image.loading = 'lazy';
    image.className = 'w-full h-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]';
    image.style.background = '#f3f4f6';
    const button = document.createElement('button');
    button.type = 'button'; button.setAttribute('aria-label', alt || 'Buka gambar');
    button.className = 'absolute top-2 right-2 bg-black/60 text-white rounded-lg p-2 transition-all opacity-80 group-hover:opacity-100 shadow-md';
    button.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
    wrapper.append(image, button);
    wrapper.addEventListener('click', () => openLightbox(src));
    container.appendChild(wrapper); return wrapper;
  });
  disconnectGallery = createScrollDots(container, dots, items, index => `Pergi ke gambar ${index + 1}`);
}

export function openLightbox(src) {
  const modal = document.getElementById('lightbox-modal');
  const image = document.getElementById('lightbox-img');
  if (!modal || !image) return;
  image.src = src; modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}
export function initLightboxControls() {
  const modal = document.getElementById('lightbox-modal');
  const container = document.getElementById('lightbox-container');
  const image = document.getElementById('lightbox-img');
  const fullscreen = document.getElementById('lightbox-fs');
  if (!modal || !image) return;
  function close() {
    if (document.fullscreenElement) document.exitFullscreen()?.catch(console.warn);
    modal.classList.add('hidden'); image.src = '';
    document.body.classList.remove('overflow-hidden');
  }
  document.getElementById('lightbox-close')?.addEventListener('click', close);
  fullscreen?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (container?.requestFullscreen) await container.requestFullscreen();
      else container?.webkitRequestFullscreen?.();
    } catch (error) { console.warn('Fullscreen:', error); }
  });
  document.addEventListener('fullscreenchange', () => {
    if (fullscreen) fullscreen.innerHTML = `<i class="fas fa-${document.fullscreenElement ? 'compress' : 'expand'}"></i>`;
  });
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
}

export function initSocialDots() {
  const container = document.getElementById('socialScrollContainer');
  const dots = document.getElementById('socialDotsContainer');
  if (container && dots) createScrollDots(container, dots, [...container.querySelectorAll('.social-item')], index => `Pergi ke item sosial ${index + 1}`);
}
