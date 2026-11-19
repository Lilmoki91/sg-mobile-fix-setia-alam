// nav.js
export function initBottomNavigation() {
  if (!document.querySelector('.mobile-bottom-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Navigasi mudah alih');
    nav.innerHTML = `
      <a href="#" class="active" data-nav="home-tab"><i class="fas fa-home"></i><span data-i18n-key="NavHome">Home</span></a>
      <a href="#" data-nav="services-tab"><i class="fas fa-tools"></i><span data-i18n-key="NavServices">Servis</span></a>
      <a href="#" data-nav="location-tab"><i class="fas fa-map-marker-alt"></i><span data-i18n-key="NavLocation">Lokasi</span></a>
      <a href="#" data-nav="contact-tab"><i class="fas fa-phone"></i><span class="booking-notification-dot" aria-hidden="true" hidden></span><span data-i18n-key="NavContact">Contact</span><span id="booking-nav-notification-text" class="sr-only"></span></a>
      <a href="#" data-nav="card-tab"><i class="fas fa-id-card"></i><span data-i18n-key="NavCard">Kad</span></a>
    `;
    document.body.appendChild(nav);
  }

  showTab('home-tab');

  document.querySelectorAll('.mobile-bottom-nav a[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab(link.dataset.nav);
      document.querySelectorAll('.mobile-bottom-nav a').forEach(item => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const appointmentLink = document.getElementById('booking-appointment-link');
  if (appointmentLink) {
    appointmentLink.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('booking-tab');
      document.querySelectorAll('.mobile-bottom-nav a').forEach(item => item.classList.remove('active'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const bookingBackBtn = document.getElementById('booking-back-btn');
  if (bookingBackBtn) {
    bookingBackBtn.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('contact-tab');
      const contactNav = document.querySelector('.mobile-bottom-nav a[data-nav="contact-tab"]');
      document.querySelectorAll('.mobile-bottom-nav a').forEach(item => item.classList.remove('active'));
      if (contactNav) contactNav.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

export function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.toggle('active', tab.id === tabId);
    if (tab.id === 'profile-view') tab.style.display = tab.id === tabId ? 'block' : 'none';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
