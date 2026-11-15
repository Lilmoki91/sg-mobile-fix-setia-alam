import { translations } from '../i18n/translations.js';

export function initServiceFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const counter = document.getElementById('visibleCount');
  const searchInput = document.getElementById('service-search');
  const clearBtn = document.getElementById('clear-search');
  const searchStatus = document.getElementById('search-status');
  const scrollContainer = document.getElementById('serviceScrollContainer') || document.getElementById('cardsContainer');
  if (!buttons.length || !scrollContainer) return;

  const getCards = () => scrollContainer.querySelectorAll(':scope > .service-card');

  function filterBySearch(query) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    const cards = getCards();
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const category = (card.dataset.category || '').toLowerCase();
      const matches = title.includes(normalizedQuery) || desc.includes(normalizedQuery) || category.includes(normalizedQuery);

      if (matches) {
        card.classList.remove('hidden');
        card.style.display = '';
        card.classList.add('matched');
        setTimeout(() => card.classList.remove('matched'), 400);
        visibleCount++;
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    if (counter) counter.textContent = visibleCount;
    if (clearBtn) clearBtn.classList.toggle('hidden', !normalizedQuery);
    if (searchStatus) {
      const lang = document.documentElement.lang || 'ms';
      const t = translations[lang] || translations.ms;
      if (!normalizedQuery) searchStatus.textContent = '';
      else if (visibleCount === 0) searchStatus.textContent = t.SearchResultNone || 'Tiada perkhidmatan dijumpai.';
      else searchStatus.textContent = `${visibleCount} ${t.SearchStatus || 'keputusan ditemui untuk'} "${query.trim()}"`;
    }
    if (scrollContainer) scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
  }

  window.reapplyServiceFilter = filterBySearch;

  if (searchInput) {
    searchInput.addEventListener('input', () => filterBySearch(searchInput.value));
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { searchInput.value = ''; filterBySearch(''); }
      if (event.key === 'Enter') { event.preventDefault(); searchInput.blur(); }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterBySearch('');
      searchInput?.focus();
    });
  }

  function updateSearchPlaceholder() {
    const lang = document.documentElement.lang || 'ms';
    const t = translations[lang] || translations.ms;
    if (searchInput) searchInput.placeholder = t.SearchPlaceholder || 'Cari perkhidmatan...';
  }
  updateSearchPlaceholder();

  const languageToggle = document.getElementById('language-toggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      setTimeout(updateSearchPlaceholder, 50);
      if (typeof window.initDynamicServices === 'function') {
        setTimeout(() => window.initDynamicServices(), 100);
      }
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      const cards = getCards();
      let visibleCount = 0;
      buttons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
      if (searchStatus) searchStatus.textContent = '';

      cards.forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/);
        const isVisible = filter === 'all' || categories.includes(filter);
        if (isVisible) {
          card.classList.remove('hidden');
          card.style.display = '';
          visibleCount++;
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });

      if (counter) counter.textContent = visibleCount;
      if (scrollContainer) scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
    });
  });
}
