// scroll-dots.js
export function createScrollDots(container, dotsContainer, items, label) {
  dotsContainer.replaceChildren();
  const dots = items.map((item, index) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.setAttribute('aria-label', label(index));
    dot.addEventListener('click', () => item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    dotsContainer.appendChild(dot); return dot;
  });
  function mark(active) {
    dots.forEach((dot, index) => {
      dot.className = `h-2 rounded-full transition-all duration-300 ${index === active ? 'w-5 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`;
      dot.setAttribute('aria-pressed', String(index === active));
    });
  }
  mark(0);
  if (!('IntersectionObserver' in window)) return () => {};
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) mark(items.indexOf(visible[0].target));
  }, { root: container, threshold: 0.6 });
  items.forEach(item => observer.observe(item));
  return () => observer.disconnect();
}
