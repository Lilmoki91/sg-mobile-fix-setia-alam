// service-filters.js
export function initServiceFilters() {
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const container = document.getElementById('serviceScrollContainer') || document.getElementById('cardsContainer');
  const search = document.getElementById('service-search');
  const clear = document.getElementById('clear-search');
  const counter = document.getElementById('visibleCount');
  const status = document.getElementById('search-status');
  if (!buttons.length || !container) return;
  let selected = 'all';
  function apply(query = search?.value || '') {
    const normalized = String(query).trim().toLowerCase();
    let count = 0;
    container.querySelectorAll(':scope > .service-card').forEach(card => {
      const categories = (card.dataset.category || '').toLowerCase();
      const content = [card.querySelector('h3')?.textContent, card.querySelector('p')?.textContent, categories].join(' ').toLowerCase();
      const visible = (selected === 'all' || categories.split(/\s+/).includes(selected)) && (!normalized || content.includes(normalized));
      card.classList.toggle('hidden', !visible);
      card.style.display = visible ? '' : 'none';
      if (visible) count++;
    });
    if (counter) counter.textContent = count;
    clear?.classList.toggle('hidden', !normalized);
    const t = window.translations[document.documentElement.lang] || window.translations.ms;
    if (search) search.placeholder = t.SearchPlaceholder;
    if (status) status.textContent = !normalized ? '' : !count ? t.SearchResultNone : `${count} ${t.SearchStatus} "${String(query).trim()}"`;
    container.scrollTo({ left: 0, behavior: 'smooth' });
  }
  window.reapplyServiceFilter = apply;
  search?.addEventListener('input', () => apply());
  search?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { search.value = ''; apply(); }
    if (event.key === 'Enter') { event.preventDefault(); search.blur(); }
  });
  clear?.addEventListener('click', () => { if (search) search.value = ''; apply(); search?.focus(); });
  buttons.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    buttons.forEach(item => item.classList.toggle('active', item === button));
    if (search) search.value = '';
    apply();
  }));
  document.getElementById('language-toggle')?.addEventListener('click', () => {
    setTimeout(() => {
      // Bahasa berubah: render cache tanpa memasang listener Firebase baharu.
      window.refreshServiceLanguage?.(); apply();
    }, 0);
  });
  apply();
}
