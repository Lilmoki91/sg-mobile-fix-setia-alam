let galleryObserver = null;
let openLightboxFn = () => {};

export function initGallery(managedImages = null) {
  const container = document.getElementById('gambarScrollContainer');
  const dotsContainer = document.getElementById('galleryDotsContainer');
  if (!container || !dotsContainer) return;

  galleryObserver?.disconnect();
  const images = Array.isArray(managedImages) ? managedImages : [];

  container.replaceChildren();
  dotsContainer.replaceChildren();
  const dotElements = [];

  images.forEach(([src, alt], index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative snap-center flex-shrink-0 cursor-pointer group';
    wrapper.style.cssText = 'width: 250px;';

    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = 'lazy';
    image.className = 'w-full h-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]';
    image.style.cssText = 'background: #f3f4f6;';

    const fsIconBtn = document.createElement('button');
    fsIconBtn.className = 'absolute top-2 right-2 bg-black/60 text-white rounded-lg p-2 transition-all opacity-80 group-hover:opacity-100 shadow-md';
    fsIconBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>`;

    wrapper.appendChild(image);
    wrapper.appendChild(fsIconBtn);
    container.appendChild(wrapper);

    wrapper.addEventListener('click', () => openLightboxFn(src));

    const dot = document.createElement('button');
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? 'w-7 bg-blue-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`;
    dot.setAttribute('aria-label', `Pergi ke gambar ${index + 1}`);
    dot.addEventListener('click', () => wrapper.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    dotsContainer.appendChild(dot);
    dotElements.push({ wrapper, dot });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeIndex = dotElements.findIndex(item => item.wrapper === entry.target);
      dotElements.forEach((item, idx) => {
        item.dot.className = idx === activeIndex
          ? 'h-2 w-5 bg-blue-600 rounded-full transition-all duration-300'
          : 'h-2 w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300';
      });
    });
  }, { root: container, threshold: 0.6 });

  galleryObserver = observer;
  dotElements.forEach(item => observer.observe(item.wrapper));
}

export function initLightboxControls() {
  const modal = document.getElementById('lightbox-modal');
  const modalContainer = document.getElementById('lightbox-container');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const fsBtn = document.getElementById('lightbox-fs');
  if (!modal || !modalImg) return;

  openLightboxFn = (src) => {
    modalImg.src = src;
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };
  window.openLightbox = openLightboxFn;

  function closeLightbox() {
    if (document.fullscreenElement) document.exitFullscreen().catch(err => console.log(err));
    modal.classList.add('hidden');
    modalImg.src = '';
    document.body.classList.remove('overflow-hidden');
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      if (modalContainer.requestFullscreen) modalContainer.requestFullscreen();
      else if (modalContainer.webkitRequestFullscreen) modalContainer.webkitRequestFullscreen();
      if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (fsBtn) fsBtn.addEventListener('click', toggleFullScreen);

  modal.addEventListener('click', (e) => { if (e.target === modal) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeLightbox();
  });
}
