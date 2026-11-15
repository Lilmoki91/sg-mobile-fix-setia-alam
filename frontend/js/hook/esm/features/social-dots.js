export function initSocialDots() {
  const container = document.getElementById('socialScrollContainer');
  const dotsContainer = document.getElementById('socialDotsContainer');
  if (!container || !dotsContainer) return;

  const items = container.querySelectorAll('.social-item');
  if (!items.length) return;

  dotsContainer.replaceChildren();
  const dotElements = [];

  items.forEach((item, index) => {
    const dot = document.createElement('button');
    dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === 0 ? 'w-7 bg-blue-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`;
    dot.setAttribute('aria-label', `Pergi ke item sosial ${index + 1}`);
    dot.addEventListener('click', () => item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    dotsContainer.appendChild(dot);
    dotElements.push({ item, dot });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeIndex = dotElements.findIndex(el => el.item === entry.target);
      dotElements.forEach((el, idx) => {
        el.dot.className = idx === activeIndex
          ? 'h-2 w-5 bg-blue-600 rounded-full transition-all duration-300'
          : 'h-2 w-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-300';
      });
    });
  }, { root: container, threshold: 0.6 });

  dotElements.forEach(el => observer.observe(el.item));
}
