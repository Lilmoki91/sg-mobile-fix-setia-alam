// navigation.js
export function openMenu() {
  document.getElementById('mobile-menu')?.classList.add('active');
  document.getElementById('mobile-menu-overlay')?.classList.add('active');
  document.body.classList.add('menu-open');
  document.getElementById('bottom-menu-button')?.classList.add('active-menu');
}
export function closeMenu() {
  document.getElementById('mobile-menu')?.classList.remove('active');
  document.getElementById('mobile-menu-overlay')?.classList.remove('active');
  document.body.classList.remove('menu-open');
  document.getElementById('bottom-menu-button')?.classList.remove('active-menu');
}
export function showTab(tabId) {
  if (!document.getElementById(tabId)) return;
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.toggle('active', tab.id === tabId);
    if (tab.id === 'profile-view') tab.style.display = tab.id === tabId ? 'block' : 'none';
  });
  document.querySelectorAll('.mobile-bottom-nav a').forEach(link => {
    link.classList.toggle('active', link.dataset.nav === tabId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
export function initMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  document.getElementById('bottom-menu-button')?.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation();
    menu.classList.contains('active') ? closeMenu() : openMenu();
  });
  document.getElementById('close-menu-btn')?.addEventListener('click', closeMenu);
  document.getElementById('mobile-menu-overlay')?.addEventListener('click', closeMenu);
  menu.querySelectorAll('a.menu-link').forEach(link => {
    link.addEventListener('click', () => setTimeout(closeMenu, 200));
  });
  const url = new URL(window.location.href);
  if (url.searchParams.get('menu') === 'open') {
    setTimeout(() => {
      openMenu(); url.searchParams.delete('menu');
      history.replaceState({}, document.title, url);
    }, 300);
  }
}
export function initBottomNavigation() {
  if (!document.getElementById('main-content')) return;
  if (!document.querySelector('.mobile-bottom-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Navigasi mudah alih');
    const links = [
      ['home', 'home', 'Home'], ['services', 'tools', 'Services'], ['location', 'map-marker-alt', 'Location'],
      ['contact', 'phone', 'Contact'], ['card', 'id-card', 'Card']
    ];
    nav.innerHTML = links.map(([tab, icon, key]) => `<a href="#${tab}-tab" data-nav="${tab}-tab"><i class="fas fa-${icon}"></i><span data-i18n-key="Nav${key}">${key}</span></a>`).join('');
    document.body.appendChild(nav);
  }
  document.querySelectorAll('.mobile-bottom-nav a[data-nav]').forEach(link => {
    link.addEventListener('click', event => { event.preventDefault(); showTab(link.dataset.nav); });
  });
  document.getElementById('booking-appointment-link')?.addEventListener('click', event => {
    event.preventDefault(); showTab('booking-tab');
  });
  document.getElementById('booking-back-btn')?.addEventListener('click', () => showTab('contact-tab'));
  showTab('home-tab');
}
