// ============================================================
// 🛡️ ADMIN DASHBOARD - Firebase Firestore Edition
// ============================================================
// Fail ini menggantikan skrip inline dalam admin.html.
// Pastikan booking-firebase.js & services-firebase.js dimuat sebelum fail ini.
// admin-dashboard.js

(function() {
  'use strict';

  // Kuasa admin disahkan oleh cookie backend + Firebase custom session.
  const SHOP_PHONE = '60122626434';

  const loginScreen = document.getElementById('login-screen');
  const adminDashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  // Booking panel
  const bookingPanel = document.getElementById('admin-booking-panel');
  const bookingList = document.getElementById('admin-booking-list');
  const emptyState = document.getElementById('admin-empty');
  const filterBtns = document.querySelectorAll('.filter-admin-btn');

  // Service panel
  const servicePanel = document.getElementById('admin-service-panel');
  const serviceList = document.getElementById('admin-service-list');
  const serviceEmpty = document.getElementById('admin-service-empty');
  const serviceForm = document.getElementById('service-form');
  const serviceFormTitle = document.getElementById('service-form-title');
  const serviceSubmitBtn = document.getElementById('service-submit-btn');
  const serviceCancelBtn = document.getElementById('service-cancel-btn');

  let currentFilter = 'all';
  let allBookings = [];
  let allServices = [];
  let currentAdminTab = 'bookings';
  // Translation helpers must never prevent authentication if an optional script is missing.
  const t = (ms, en) => window.AdminI18n?.t?.(ms, en) ?? (document.documentElement.lang === 'en' ? (en || ms) : ms);

  function updateServiceLabels() {
    const editing = !!document.getElementById('service-id').value;
    serviceFormTitle.textContent = t(editing ? 'Edit Servis' : 'Tambah Servis Baharu');
    if (!serviceSubmitBtn.disabled) {
      serviceSubmitBtn.innerHTML = `<i class="fas ${editing ? 'fa-save' : 'fa-plus'} mr-2"></i> ${t(editing ? 'Simpan Perubahan' : 'Tambah Servis')}`;
    } else {
      serviceSubmitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${t('Menyimpan...')}`;
    }
  }

  function getTranslation(key, fallbackEn, fallbackMs) {
    const lang = document.documentElement.lang || 'ms';
    const val = window.translations?.[lang]?.[key];
    if (val) return val;
    if (lang === 'en' && fallbackEn) return fallbackEn;
    if (fallbackMs) return fallbackMs;
    return '';
  }

  // Helper storage (reused from script.js)
  function getStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // ignore storage errors
    }
  }

  // Theme uses the same preference and styling as the main page.
  const adminThemeToggle = document.getElementById('admin-theme-toggle');
  function updateAdminThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const en = document.documentElement.lang === 'en';
    const label = dark ? (en ? 'Light Mode' : 'Mod Cerah') : (en ? 'Dark Mode' : 'Mod Gelap');
    document.getElementById('admin-theme-text').textContent = label;
    document.getElementById('admin-theme-icon').className = `fas ${dark ? 'fa-sun' : 'fa-moon'}`;
    adminThemeToggle.setAttribute('aria-pressed', String(dark));
    adminThemeToggle.setAttribute('aria-label', en ? 'Dark mode' : 'Mod gelap');
    adminThemeToggle.title = label;
  }

  applyTheme(document.documentElement.dataset.theme || 'light');
  updateAdminThemeButton();
  adminThemeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStorage('theme', next);
    updateAdminThemeButton();
  });
  document.addEventListener('admin-language', updateAdminThemeButton);

  // ============================================================
  // ADMIN TAB NAVIGATION
  // ============================================================
  const sidebar = document.getElementById('admin-sidebar');
  const sidebarOverlay = document.getElementById('admin-sidebar-overlay');
  const menuToggle = document.getElementById('admin-menu-toggle');
  const menuClose = document.getElementById('admin-menu-close');
  let menuReturnFocus = null;

  function setAdminMenu(open) {
    if (!sidebar) return;
    if (open) menuReturnFocus = document.activeElement;
    sidebar.classList.toggle('is-open', open);
    sidebar.inert = !open;
    sidebar.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    if (sidebarOverlay) sidebarOverlay.hidden = !open;
    document.body.classList.toggle('admin-menu-open', open);
    document.getElementById('admin-header').inert = open;
    document.getElementById('admin-main').inert = open;
    if (open) menuClose?.focus();
    else if (menuReturnFocus) {
      menuReturnFocus.focus();
      menuReturnFocus = null;
    }
  }

  menuToggle?.addEventListener('click', () => setAdminMenu(true));
  menuClose?.addEventListener('click', () => setAdminMenu(false));
  sidebarOverlay?.addEventListener('click', () => setAdminMenu(false));
  document.addEventListener('keydown', (event) => {
    if (!sidebar?.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setAdminMenu(false);
    }
    if (event.key === 'Tab') {
      const buttons = sidebar.querySelectorAll('button:not(:disabled)');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function initAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchAdminTab(tab);
        setAdminMenu(false);
      });
    });
  }

  function switchAdminTab(tab) {
    currentAdminTab = tab;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.setAttribute('aria-current', 'page');
        btn.classList.remove('bg-gray-200', 'text-gray-700');
        btn.classList.add('bg-blue-600', 'text-white');
      } else {
        btn.removeAttribute('aria-current');
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      }
    });

    bookingPanel?.classList.toggle('hidden', tab !== 'bookings');
    servicePanel?.classList.toggle('hidden', tab !== 'services');
    document.getElementById('admin-gallery-panel')?.classList.toggle('hidden', tab !== 'gallery');
    if (tab === 'gallery') window.refreshAdminGallery?.();
    document.getElementById('admin-hours-panel')?.classList.toggle('hidden', tab !== 'hours');
    if (tab === 'hours') window.refreshAdminHours?.();
    document.getElementById('admin-phones-panel')?.classList.toggle('hidden', tab !== 'phones');
    if (tab === 'phones') window.refreshAdminPhones?.();
    document.getElementById('admin-phone-videos-panel')?.classList.toggle('hidden', tab !== 'phone-videos');
    if (tab === 'phone-videos') window.PhoneVideosAdmin?.refresh();
    document.getElementById('admin-testimonial-videos-panel')?.classList.toggle('hidden', tab !== 'testimonial-videos');
    if (tab === 'testimonial-videos') window.TestimonialVideosAdmin?.refresh();

    // Scroll to top of panels
    const panels = document.getElementById('admin-panels');
    if (panels) panels.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  // FORMAT HELPERS (Booking)
  // ============================================================
  function formatStatusLabel(status, booking) {
    const lang = (booking ? booking.lang : document.documentElement.lang) || 'ms';
    const t = window.translations?.[lang] || window.translations?.ms || {};
    const labels = {
      pending: t.BookingStatusPending || (lang === 'en' ? 'Pending Confirmation' : 'Menunggu Pengesahan'),
      confirmed: t.BookingStatusConfirmed || (lang === 'en' ? 'Confirmed' : 'Disahkan'),
      rejected: t.BookingStatusRejected || (lang === 'en' ? 'Rejected' : 'Ditolak')
    };
    return labels[status] || status;
  }

  function getAdminTranslations(booking) {
    const lang = (booking ? booking.lang : document.documentElement.lang) || 'ms';
    const t = window.translations?.[lang] || window.translations?.ms || {};
    return {
      BookingTitle: t.BookingTitle || (lang === 'en' ? 'Appointment Booking' : 'Tempahan Appointment'),
      BookingCode: t.BookingCode || (lang === 'en' ? 'Booking Code' : 'Kod Tempahan'),
      BookingName: t.BookingName || (lang === 'en' ? 'Name' : 'Nama'),
      BookingPhone: t.BookingPhone || (lang === 'en' ? 'Phone Number' : 'No. Telefon'),
      BookingDevice: t.BookingDevice || (lang === 'en' ? 'Device Model' : 'Model Peranti'),
      BookingService: t.BookingService || (lang === 'en' ? 'Service Type' : 'Jenis Servis'),
      BookingDate: t.BookingDate || (lang === 'en' ? 'Appointment Date' : 'Tarikh Tempahan'),
      BookingTime: t.BookingTime || (lang === 'en' ? 'Appointment Time' : 'Masa Tempahan'),
      BookingCreatedAt: t.BookingCreatedAt || (lang === 'en' ? 'Registration Time' : 'Waktu Pendaftaran'),
      BookingNotes: t.BookingNotes || (lang === 'en' ? 'Additional Notes' : 'Nota Tambahan'),
      WhatsAppBookingPending: t.WhatsAppBookingPending || (lang === 'en'
        ? 'Hello 👋, I would like to check the status of my booking *{code}* which is still pending confirmation.'
        : 'Hello 👋, saya ingin menanya status tempahan saya *{code}* yang masih menunggu pengesahan.'),
      WhatsAppBookingConfirmed: t.WhatsAppBookingConfirmed || (lang === 'en'
        ? 'Hello 👋, thank you for confirming my booking *{code}*. I will come according to the scheduled date and time.'
        : 'Hello 👋, terima kasih mengesahkan tempahan saya *{code}*. Saya akan datang mengikut tarikh dan masa yang ditetapkan.'),
      WhatsAppBookingRejected: t.WhatsAppBookingRejected || (lang === 'en'
        ? 'Hello 👋, I would like to ask why my booking *{code}* was rejected.'
        : 'Hello 👋, saya ingin menanya kenapa tempahan saya *{code}* telah ditolak.'),
      BookingStatusPending: t.BookingStatusPending || (lang === 'en' ? 'Pending Confirmation' : 'Menunggu Pengesahan'),
      BookingStatusConfirmed: t.BookingStatusConfirmed || (lang === 'en' ? 'Confirmed' : 'Disahkan'),
      BookingStatusRejected: t.BookingStatusRejected || (lang === 'en' ? 'Rejected' : 'Ditolak')
    };
  }

  function getStatusClass(status) {
    return {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      rejected: 'status-rejected'
    }[status] || 'bg-gray-100 text-gray-800';
  }

  function formatTime12Hour(timeStr) {
    if (!timeStr) return '-';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function formatCreatedAt(isoOrTimestamp) {
    if (!isoOrTimestamp) return '-';
    let date;
    if (typeof isoOrTimestamp === 'object' && isoOrTimestamp.seconds) {
      date = new Date(isoOrTimestamp.seconds * 1000);
    } else if (isoOrTimestamp.toDate) {
      date = isoOrTimestamp.toDate();
    } else {
      date = new Date(isoOrTimestamp);
    }
    if (isNaN(date.getTime())) return '-';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const h24 = date.getHours();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${h12}:${min} ${ampm}`;
  }

  function formatWhatsAppMessage(booking) {
    const t = getAdminTranslations(booking);
    const lang = booking?.lang || 'ms';
    const statusLabel = formatStatusLabel(booking.status, booking);
    const greeting = lang === 'en' ? 'Hi' : 'Salam';
    const statusLine = lang === 'en'
      ? `Your booking status *${booking.code}* is: *${statusLabel}*`
      : `Status tempahan anda *${booking.code}* adalah: *${statusLabel}*`;
    const serviceLabel = lang === 'en' ? 'Service' : 'Servis';
    const statusMessage = booking.status === 'confirmed'
      ? (lang === 'en' ? 'Thank you. We look forward to your visit.' : 'Terima kasih. Kami tunggu kedatangan anda.')
      : booking.status === 'rejected'
        ? (lang === 'en' ? 'Sorry, the slot is not available. Please choose another date/time.' : 'Maaf, slot tidak tersedia. Sila pilih tarikh/masa lain.')
        : (lang === 'en' ? 'We will update the status soon.' : 'Kami akan memaklumkan status segera.');

    return encodeURIComponent(
      `*SG Mobile Fix Setia Alam*\n\n` +
      `${greeting} ${booking.name},\n\n` +
      `${statusLine}\n\n` +
      `${serviceLabel}: ${booking.service}\n` +
      `${t.BookingDate}: ${booking.date}\n` +
      `${t.BookingTime}: ${formatTime12Hour(booking.time)}\n\n` +
      statusMessage
    );
  }

  function getNotifyButtonText(booking) {
    const lang = (booking ? booking.lang : document.documentElement.lang) || 'ms';
    return lang === 'en' ? 'Notify' : 'Maklumkan';
  }

  function renderStats(bookings) {
    document.getElementById('stat-total').textContent = bookings.length;
    document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('stat-confirmed').textContent = bookings.filter(b => b.status === 'confirmed').length;
    document.getElementById('stat-rejected').textContent = bookings.filter(b => b.status === 'rejected').length;
  }

  // ============================================================
  // RENDER BOOKINGS
  // ============================================================
  function renderBookings(bookings) {
    allBookings = bookings || [];
    renderStats(allBookings);

    const filtered = currentFilter === 'all'
      ? allBookings
      : allBookings.filter(b => b.status === currentFilter);

    bookingList.innerHTML = '';

    if (!filtered.length) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    filtered.sort((a, b) => {
      const da = new Date(a.date + 'T' + a.time);
      const db = new Date(b.date + 'T' + b.time);
      return da - db;
    });

    filtered.forEach(rawBooking => {
      const booking = { ...rawBooking };
      ['id', 'code', 'name', 'phone', 'device', 'service', 'date', 'time', 'notes'].forEach(k => { booking[k] = window.escapeHtml(booking[k]); });
      const card = document.createElement('div');
      card.className = 'admin-card p-5';
      card.innerHTML = `
        <div class="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">${getAdminTranslations().BookingCode}</p>
            <p class="text-lg font-bold text-blue-800">${booking.code}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(booking.status)}">
            ${formatStatusLabel(booking.status)}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div><span class="text-gray-500">${getAdminTranslations().BookingName}:</span> <span class="font-semibold">${booking.name}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingPhone}:</span> <span class="font-semibold">${booking.phone}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingDevice}:</span> <span class="font-semibold">${booking.device || '-'}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingService}:</span> <span class="font-semibold">${booking.service}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingDate}:</span> <span class="font-semibold">${booking.date}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingTime}:</span> <span class="font-semibold">${formatTime12Hour(booking.time)}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations().BookingCreatedAt}:</span> <span class="font-semibold">${formatCreatedAt(booking.createdAt)}</span></div>
        </div>

        ${booking.notes ? `
          <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <span class="text-gray-500">${getAdminTranslations().BookingNotes}:</span> ${booking.notes}
          </div>
        ` : ''}

        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button data-id="${booking.id}" data-status="confirmed"
                  class="btn-action flex-1 min-w-[110px] bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-check mr-1"></i> ${getAdminTranslations().BookingStatusConfirmed}
          </button>
          <button data-id="${booking.id}" data-status="rejected"
                  class="btn-action flex-1 min-w-[110px] bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-times mr-1"></i> ${getAdminTranslations().BookingStatusRejected}
          </button>
          <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage(booking)}"
             target="_blank" rel="noopener noreferrer"
             class="btn-action flex-1 min-w-[110px] bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold py-2 px-3 rounded-lg text-center">
            <i class="fab fa-whatsapp mr-1"></i> ${getNotifyButtonText()}
          </a>
          <button data-id="${booking.id}" data-action="delete"
                  class="btn-action min-w-[50px] bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      bookingList.appendChild(card);
    });
  }

  // ============================================================
  // TINDAKAN BOOKING
  // ============================================================
  async function updateStatus(id, status) {
    const result = await window.updateBookingStatusInFirebase(id, status);
    if (!result.success) alert(t('Gagal kemas kini status: ') + result.error);
  }

  async function deleteBooking(id) {
    const booking = allBookings.find(b => b.id === id);
    if (!booking) return;
    const lang = document.documentElement.lang || 'ms';
    const msg = window.translations?.[lang]?.BookingConfirmDelete || (lang === 'en' ? 'Delete this booking?' : 'Padam tempahan ini?');
    if (!confirm(`${msg}\n${booking.code}`)) return;

    const result = await window.deleteBookingFromFirebase(id);
    if (!result.success) alert(t('Gagal padam: ') + result.error);
  }

  // ============================================================
  // SERVICE MANAGEMENT
  // ============================================================
 const iconMap = {
  battery: 'fas fa-battery-full',
  camera: 'fas fa-camera',
  casing: 'fas fa-mobile-alt',
  charging: 'fas fa-plug',
  diagnostic: 'fas fa-search',
  speaker: 'fas fa-volume-up',
  power: 'fas fa-power-off',
  screen: 'fas fa-mobile',
  software: 'fas fa-code',
  tablet: 'fas fa-tablet-alt',
  water: 'fas fa-tint',
  button: 'fab fa-apple',
  backglass: 'fas fa-layer-group',
  watch: 'fas fa-clock',
  faceid: 'fas fa-user-circle',
  motherboard: 'fas fa-microchip',
  screencolor: 'fas fa-exclamation-triangle',
  genuine: 'fab fa-apple'
};

  const colorMap = {
    battery: 'from-blue-500 to-blue-700',
    camera: 'from-purple-500 to-purple-700',
    casing: 'from-gray-500 to-gray-700',
    charging: 'from-violet-500 to-violet-700',
    diagnostic: 'from-red-500 to-red-700',
    speaker: 'from-cyan-500 to-cyan-700',
    power: 'from-orange-500 to-orange-700',
    screen: 'from-indigo-500 to-indigo-700',
    software: 'from-emerald-500 to-emerald-700',
    tablet: 'from-rose-500 to-rose-700',
    water: 'from-sky-500 to-sky-700',
    button: 'from-pink-500 to-pink-700',
    backglass: 'from-slate-500 to-slate-700',
    watch: 'from-teal-500 to-teal-700',
    faceid: 'from-fuchsia-500 to-fuchsia-700',
    motherboard: 'from-amber-500 to-amber-700',
    screencolor: 'from-lime-500 to-lime-700',
    genuine: 'from-yellow-500 to-yellow-700'
  };

  function getIconClass(type) {
    return iconMap[(type || '').toLowerCase()] || 'fa-tools';
  }

  function getGradientClass(type) {
    return colorMap[(type || '').toLowerCase()] || 'from-blue-500 to-blue-700';
  }

  function renderServices(services) {
    allServices = services || [];

    serviceList.innerHTML = '';

    if (!allServices.length) {
      serviceEmpty.classList.remove('hidden');
      return;
    }
    serviceEmpty.classList.add('hidden');

    allServices.forEach(service => {
      const card = document.createElement('div');
      card.className = `admin-card p-5 border-l-4 ${service.active ? 'border-blue-500' : 'border-gray-300 opacity-60'}`;
      const gradient = getGradientClass(service.type);
      const icon = getIconClass(service.type);

      card.innerHTML = `
        <div class="flex flex-wrap justify-between items-start gap-3 mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white">
              <i class="${icon}"></i>
            </div>
            <div>
              <p class="font-bold text-gray-800">${document.documentElement.lang === 'en' ? service.titleEn : service.titleMs}</p>
              <p class="text-xs text-gray-500">${document.documentElement.lang === 'en' ? service.titleMs : service.titleEn}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 rounded-full text-xs font-bold ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${t(service.active ? 'Aktif' : 'Tidak Aktif')}</span>
            <span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">${service.price || 'N/A'}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
          <div><span class="text-gray-500">BM:</span> ${service.descMs}</div>
          <div><span class="text-gray-500">EN:</span> ${service.descEn}</div>
          <div><span class="text-gray-500">${t('Kategori')}:</span> <span class="font-semibold">${service.category || '-'}</span></div>
          <div><span class="text-gray-500">${t('Susunan')}:</span> <span class="font-semibold">${service.order}</span></div>
        </div>
        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button data-id="${service.id}" data-action="edit"
                  class="btn-action flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-edit mr-1"></i> ${t('Edit')}
          </button>
          <button data-id="${service.id}" data-action="toggle"
                  class="btn-action flex-1 min-w-[80px] ${service.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas ${service.active ? 'fa-eye-slash' : 'fa-eye'} mr-1"></i> ${t(service.active ? 'Sembunyi' : 'Papar')}
          </button>
          <button data-id="${service.id}" data-action="delete"
                  class="btn-action min-w-[50px] bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      serviceList.appendChild(card);
    });
  }

  function resetServiceForm() {
    serviceForm.reset();
    document.getElementById('service-id').value = '';
    updateServiceLabels();
    serviceCancelBtn.classList.add('hidden');
  }

  function editService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    document.getElementById('service-id').value = service.id;
    document.getElementById('service-title-ms').value = service.titleMs || '';
    document.getElementById('service-title-en').value = service.titleEn || '';
    document.getElementById('service-desc-ms').value = service.descMs || '';
    document.getElementById('service-desc-en').value = service.descEn || '';
    document.getElementById('service-price').value = service.price || '';
    document.getElementById('service-type').value = service.type || 'battery';
    document.getElementById('service-category').value = service.category || '';
    document.getElementById('service-order').value = typeof service.order === 'number' ? service.order : 0;
    document.getElementById('service-whatsapp').value = service.whatsapp || '';
    document.getElementById('service-active').checked = service.active !== false;
    document.getElementById('service-original').checked = service.isOriginal === true;

    updateServiceLabels();
    serviceCancelBtn.classList.remove('hidden');
    window.scrollTo({ top: serviceForm.offsetTop - 100, behavior: 'smooth' });
  }

  async function saveService(e) {
    e.preventDefault();

    const id = document.getElementById('service-id').value.trim();
    const data = {
      titleMs: document.getElementById('service-title-ms').value.trim(),
      titleEn: document.getElementById('service-title-en').value.trim(),
      descMs: document.getElementById('service-desc-ms').value.trim(),
      descEn: document.getElementById('service-desc-en').value.trim(),
      price: document.getElementById('service-price').value.trim(),
      type: document.getElementById('service-type').value,
      category: document.getElementById('service-category').value.trim(),
      order: parseInt(document.getElementById('service-order').value, 10) || 0,
      whatsapp: document.getElementById('service-whatsapp').value.trim(),
      active: document.getElementById('service-active').checked,
      isOriginal: document.getElementById('service-original').checked
    };

    const submitBtn = serviceSubmitBtn;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${t('Menyimpan...')}`;

    let result;
    if (id) {
      result = await window.updateServiceInFirebase(id, data);
    } else {
      result = await window.addServiceToFirebase(data);
    }

    submitBtn.disabled = false;
    updateServiceLabels();

    if (result.success) {
      resetServiceForm();
    } else {
      alert(t('Gagal simpan servis: ') + result.error);
    }
  }

  async function toggleService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;
    const result = await window.updateServiceInFirebase(id, { active: !service.active });
    if (!result.success) alert(t('Gagal kemas kini status: ') + result.error);
  }

  async function deleteService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;
    if (!confirm(`${t('Padam servis ini?')}\n${document.documentElement.lang === 'en' ? service.titleEn : service.titleMs}`)) return;
    const result = await window.deleteServiceFromFirebase(id);
    if (!result.success) alert(t('Gagal padam servis: ') + result.error);
  }

  // ============================================================
  // DEFAULT SERVICES SEEDER
  // ============================================================
  const DEFAULT_SERVICES = [
    { titleMs: "Penggantian Bateri", titleEn: "Battery Replacement", descMs: "Bateri Lithium-ion iPhone. Kecekapan tinggi, hayat panjang.", descEn: "iPhone Lithium-ion battery. High efficiency, long lifespan.", price: "RM 150", type: "battery", category: "iphone android tablet", order: 1, whatsapp: "👋 hai saya ingin *TUKAR BATERI PHONE*", active: true },
    { titleMs: "Pembaikan Kamera", titleEn: "Camera Repair", descMs: "Baiki kamera iPhone rosak. Kualiti gambar rendah atau tak berfungsi.", descEn: "Repair damaged iPhone camera. Low picture quality or not functioning.", price: "RM 120", type: "camera", category: "iphone android tablet", order: 2, whatsapp: "👋 hai ingin *BAIKI KAMERA PHONE*", active: true },
    { titleMs: "Pembaikan Casing Phone", titleEn: "Phone Casing Repair", descMs: "Baiki casing iPhone rosak akibat jatuh, hentakan, atau penggunaan kasar.", descEn: "Repair damaged iPhone casing from drops, impacts, or rough use.", price: "RM 150", type: "casing", category: "iphone android tablet", order: 3, whatsapp: "👋 saya ingin *TUKAR CASING PHONE*", active: true },
    { titleMs: "Port Pengecasan", titleEn: "Charging Port", descMs: "Port pengecasan iPhone rosak? Masalah tak boleh charge? Kami sedia bantu.", descEn: "iPhone charging port damaged? Can't charge? We're ready to help.", price: "RM 150", type: "charging", category: "iphone android tablet", order: 4, whatsapp: "👋 hai saya ingin baiki *PORT PENGECAS HANDPHONE*", active: true },
    { titleMs: "Imbasan Diagnostik", titleEn: "Diagnostic Scan", descMs: "Diagnosa masalah peranti dengan perisian khusus. Semua isu dikesan.", descEn: "Diagnose device problems with specialized software. All issues detected.", price: "RM 80", type: "diagnostic", category: "iphone android tablet", order: 5, whatsapp: "👋 hai saya ingin servis *DIAGNOSTIK PHONE*", active: true },
    { titleMs: "Mikrofon/Pembesar Suara", titleEn: "Microphone/Speaker", descMs: "Baiki mikrofon atau pembesar suara rosak. Audio jelas, komunikasi lancar.", descEn: "Repair damaged microphone or speaker. Clear audio, smooth communication.", price: "RM 150", type: "speaker", category: "iphone android tablet", order: 6, whatsapp: "👋 hai saya ingin baiki audio SPEAKER / MIKROFON HANDPHONE", active: true },
    { titleMs: "Butang Kuasa Suis On/Off", titleEn: "Power Button On/Off Switch", descMs: "Baiki pita fleksibel butang kuasa suis on/off iPhone & Android.", descEn: "Repair flexible ribbon of iPhone & Android power button on/off switch.", price: "RM 80", type: "power", category: "iphone android tablet", order: 7, whatsapp: "👋 saya ingin baiki *BUTANG KUASA HANDPHONE*", active: true },
    { titleMs: "Pembaikan Skrin", titleEn: "Screen Repair", descMs: "Skrin retak, tak responsif, berkelip? Kami ganti skrin iPhone berkualiti.", descEn: "Cracked, unresponsive, or flickering screen? We replace with quality iPhone screens.", price: "RM 150", type: "screen", category: "iphone android tablet", order: 8, whatsapp: "👋 hai saya ingin *BAIK PULIH SKRIN HANDPHONE*", active: true },
    { titleMs: "Masalah Perisian", titleEn: "Software Issues", descMs: "iPhone lambat, apps crash, OS error? Kami selesaikan masalah perisian SOFTWARE.", descEn: "iPhone slow, apps crash, OS error? We solve SOFTWARE problems.", price: "RM 80", type: "software", category: "iphone android tablet", order: 9, whatsapp: "👋 hai saya ingin baiki *MASALAH PERISIAN SOFTWARE HANDPHONE*", active: true },
    { titleMs: "Pembaikan Tablet", titleEn: "Tablet Repair", descMs: "Semua jenis pembaikan tablet: skrin, bateri, port, speaker, perisian.", descEn: "All types of tablet repairs: screen, battery, port, speaker, software.", price: "RM 200", type: "tablet", category: "tablet", order: 10, whatsapp: "👋 hai saya ingin servis *PEMBAIKAN TABLET*", active: true },
    { titleMs: "Kerosakan Air", titleEn: "Water Damage", descMs: "Handphone terdedah air? Baik pulih kecemasan cegah karat dan kerosakan kekal.", descEn: "Phone exposed to water? Emergency repair to prevent rust and permanent damage.", price: "N/A", type: "water", category: "iphone android tablet", order: 11, whatsapp: "👋 hai saya ingin *baik pulih handphone oleh KEROSAKAN AIR* - WATER RESISTANCE", active: true },
    { titleMs: "Button iPhone Original", titleEn: "Original iPhone Button", descMs: "Button Genuine Apple Part. 1 jam siap, pengesahan dalam setting iPhone.", descEn: "Genuine Apple Part Button. 1 hour completion, verification in iPhone settings.", price: "RM 180", type: "button", category: "aksesori iphone", order: 12, whatsapp: "👋 hai ingin servis *BUTTON IPHONE ORIGINAL*", isOriginal: true, active: true },
    { titleMs: "Backglass iPhone", titleEn: "iPhone Backglass", descMs: "Tukar backglass guna mesin laser. 2 jam siap, semua model & warna ada.", descEn: "Replace backglass using laser machine. 2 hours completion, all models & colors available.", price: "RM 350", type: "backglass", category: "iphone", order: 13, whatsapp: "👋 hai saya ingin servis *BACKGLASS IPHONE*", active: true },
    { titleMs: "Apple iWatch Repair", titleEn: "Apple iWatch Repair", descMs: "Baiki Apple iWatch: skrin, bateri, komponen. Semua model disokong.", descEn: "Repair Apple iWatch: screen, battery, components. All models supported.", price: "RM 450", type: "watch", category: "aksesori", order: 14, whatsapp: "👋 hai saya ingin servis *APPLE IWATCH REPAIR*", active: true },
    { titleMs: "Face ID iPhone", titleEn: "iPhone Face ID", descMs: "Face ID iPhone rosak? Sistem pengenalan muka tak berfungsi? Kami baiki.", descEn: "iPhone Face ID damaged? Face recognition system not working? We repair it.", price: "RM 350", type: "faceid", category: "iphone", order: 15, whatsapp: "👋 hai saya ingin servis *FACE ID IPHONE*", active: true },
    { titleMs: "Motherboard iPhone", titleEn: "iPhone Motherboard", descMs: "Diagnosa & baiki motherboard iPhone. Komponen IC micro diperiksa rapi.", descEn: "Diagnose & repair iPhone motherboard. Micro IC components carefully inspected.", price: "RM 250", type: "motherboard", category: "iphone", order: 16, whatsapp: "👋 hai saya ingin servis *MOTHERBOARD IPHONE*", active: true },
    { titleMs: "Green/White/Purple Screen", titleEn: "Green/White/Purple Screen", descMs: "Common issue iPhone 13 Pro/Pro Max. Masalah skrin warna aneh? Kami selesaikan.", descEn: "Common issue iPhone 13 Pro/Pro Max. Strange color screen problem? We solve it.", price: "RM 450", type: "screencolor", category: "iphone", order: 17, whatsapp: "👋 hai saya ingin servis masalah *SKRIN HANDPHONE BERWARNA ANEH*", active: true },
    { titleMs: "Genuine Apple Part", titleEn: "Genuine Apple Part", descMs: "Alat ganti Apple Parts original: kamera, bateri, skrin, body. Ready stock.", descEn: "Original Apple Parts: camera, battery, screen, body. Ready stock.", price: "RM 429", type: "genuine", category: "aksesori iphone", order: 18, whatsapp: "👋 saya ingin alat ganti *GENUINE APPLE PART ORIGINAL*", isOriginal: true, active: true }
  ];

  async function seedDefaultServices() {
    if (!confirm(t(`Reset servis kepada data asal (${DEFAULT_SERVICES.length} servis)? Ini akan menggantikan semua servis sedia ada.`, `Reset to defaults (${DEFAULT_SERVICES.length} services)? This will replace all existing services.`))) return;

    // Padam semua servis sedia ada
    for (const s of allServices) {
      await window.deleteServiceFromFirebase(s.id);
    }

    // Import semula default
    const result = await window.importServicesToFirebase(DEFAULT_SERVICES, true);
    if (result.success) {
      alert(t(`Servis asal telah dipulihkan! ${result.count} servis diimport.`, `Default services restored! ${result.count} services imported.`));
    } else {
      alert(t('Gagal reset servis: ') + result.error);
    }
  }

  async function importDefaultServicesIfEmpty() {
    try {
      const result = await window.getServicesFromFirebase();
      if (result.success && (!result.services || result.services.length === 0)) {
        console.log('Koleksi servis kosong. Memuat data asal ke Firebase...');
        const importResult = await window.importServicesToFirebase(DEFAULT_SERVICES, true);
        if (importResult.success) {
          console.log('Berjaya muat ' + importResult.count + ' servis ke Firebase.');
        } else {
          console.error('Gagal muat servis asal:', importResult.error);
        }
      }
    } catch (err) {
      console.error('Gagal semak/muat servis asal:', err);
    }
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  // LOGIN BAHARU (Guna Cloudflare Worker)
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('admin-password').value;

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn?.disabled) return;
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Log Masuk';
    loginError.classList.add('hidden');

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.setAttribute('aria-label', t('Sedang log masuk', 'Logging in'));
        submitBtn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;min-height:1.5em"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i></span>';
      }
      if (!window.sgmAuth?.adminLogin) throw new Error('Skrip pengesahan gagal dimuatkan. Muat semula halaman dan cuba lagi.');
      await window.sgmAuth.adminLogin(input);
      document.getElementById('admin-password').value = '';
      loginError.classList.add('hidden');
      showDashboard();
    } catch (err) {
      console.error("Ralat Login:", err);
      loginError.textContent = t(err.message || 'Ralat sambungan ke server. Sila cuba lagi.');
      loginError.classList.remove('hidden');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.removeAttribute('aria-label');
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    try { await window.sgmAuth.logout(); location.reload(); }
    catch (error) { alert(error.message); }
  });

  function updateBookingFilterButtons() {
    filterBtns.forEach(btn => {
      const selected = btn.dataset.filter === currentFilter;
      btn.classList.toggle('active', selected);
      btn.classList.toggle('bg-blue-600', selected);
      btn.classList.toggle('text-white', selected);
      btn.classList.toggle('bg-gray-200', !selected);
      btn.classList.toggle('text-gray-700', !selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
  }

  updateBookingFilterButtons();

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      updateBookingFilterButtons();
      renderBookings(allBookings);
    });
  });

  bookingList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const status = btn.dataset.status;
    const action = btn.dataset.action;

    if (status) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      updateStatus(id, status).then(() => {
        btn.disabled = false;
      });
    }
    if (action === 'delete') deleteBooking(id);
  });

  // Service events
  serviceForm?.addEventListener('submit', saveService);
  serviceCancelBtn?.addEventListener('click', resetServiceForm);

  serviceList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit') editService(id);
    if (action === 'toggle') toggleService(id);
    if (action === 'delete') deleteService(id);
  });

  document.getElementById('seed-services-btn')?.addEventListener('click', seedDefaultServices);
  document.getElementById('import-default-services-btn')?.addEventListener('click', importDefaultServicesIfEmpty);

  // Service export/import
  const exportServicesBtn = document.getElementById('export-services-btn');
  const importServicesBtn = document.getElementById('import-services-btn');
  const importServicesFile = document.getElementById('import-services-file');

  exportServicesBtn?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(allServices, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sgm-services-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importServicesBtn?.addEventListener('click', () => importServicesFile?.click());

  importServicesFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) throw new Error(t('Format tidak sah'));
        if (!confirm(t(`Import ${imported.length} servis?`, `Import ${imported.length} services?`))) return;
        const result = await window.importServicesToFirebase(imported, true);
        if (result.success) {
          alert(t(`Import berjaya! ${result.count} servis diimport.`, `Import successful! ${result.count} services imported.`));
        } else {
          alert(t('Import gagal: ') + result.error);
        }
      } catch (err) {
        alert(t('Gagal import: ') + err.message);
      }
    };
    reader.readAsText(file);
    importServicesFile.value = '';
  });

  // ============================================================
  // IMPORT / EXPORT JSON BOOKINGS
  // ============================================================
  const exportBtn = document.getElementById('export-json-btn');
  const importBtn = document.getElementById('import-json-btn');
  const importFile = document.getElementById('import-json-file');

  exportBtn?.addEventListener('click', () => {
    const bookings = allBookings;
    const blob = new Blob([JSON.stringify(bookings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sgm-bookings-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importBtn?.addEventListener('click', () => importFile?.click());

  importFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) throw new Error(t('Format tidak sah'));
        if (!confirm(t(`Import ${imported.length} tempahan? Ini akan gabungkan dengan tempahan sedia ada.`, `Import ${imported.length} bookings? These will be merged with existing bookings.`))) return;
        const result = await window.importBookingsToFirebase(imported);
        if (result.success) {
          alert(t(`Import berjaya! ${result.count} tempahan diimport.`, `Import successful! ${result.count} bookings imported.`));
        } else {
          alert(t('Import gagal: ') + result.error);
        }
      } catch (err) {
        alert(t('Gagal import: ') + err.message);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  let dashboardStarted = false;
  function showDashboard() {
    if (window.sgmAuth.current?.role !== 'admin') return;
    if (dashboardStarted) {
      loginScreen?.classList.add('hidden'); adminDashboard?.classList.remove('hidden');
      return;
    }
    dashboardStarted = true;
    loginScreen?.classList.add('hidden');
    adminDashboard?.classList.remove('hidden');

    initAdminTabs();
    switchAdminTab('bookings');

    // Pasang real-time listener tempahan
    if (typeof window.startBookingListener === 'function') {
      window.startBookingListener(renderBookings);
    } else {
      window.getBookingsFromFirebase().then(result => {
        if (result.success) renderBookings(result.bookings);
      }).catch(err => console.error('Gagal muat tempahan:', err));
    }

    // Pasang real-time listener servis
    if (typeof window.startServicesListener === 'function') {
      window.startServicesListener(renderServices);
    } else {
      window.getServicesFromFirebase().then(result => {
        if (result.success) renderServices(result.services);
      }).catch(err => console.error('Gagal muat servis:', err));
    }
  }

  // Flags browser tidak pernah memberi kuasa admin.
  window.sgmAuth.ready.then(s => { if (s?.role === 'admin') showDashboard(); });
  document.addEventListener('sgm-auth-changed', event => {
    if (!event.detail) {
      loginScreen?.classList.remove('hidden');
      adminDashboard?.classList.add('hidden');
      allBookings = []; allServices = [];
      bookingList?.replaceChildren(); serviceList?.replaceChildren();
    }
  });

  // ============================================================
  // ADMIN LANGUAGE TOGGLE
  // ============================================================
  const adminLangToggle = document.getElementById('admin-language-toggle');
  const adminLangText = document.getElementById('admin-lang-text');

  function updateAdminMenuLanguage(lang) {
    const en = lang === 'en';
    const labels = {
      bookings: ['Tempahan', 'Bookings'],
      services: ['Servis', 'Services'],
      hours: ['Waktu Operasi', 'Operating Hours'],
      phones: ['Telefon Dijual', 'Phones for Sale'],
      'phone-videos': ['Video Telefon Dijual', 'Phone Sales Videos'],
      'testimonial-videos': ['Video Testimoni', 'Testimonial Videos'],
      gallery: ['Gambar Kedai', 'Shop Gallery']
    };

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      const label = labels[btn.dataset.tab];
      const text = btn.querySelector('span');
      if (label && text) text.textContent = label[en ? 1 : 0];
    });
    const title = document.getElementById('admin-sidebar-title');
    if (title) title.textContent = en ? 'Admin Panel' : 'Panel Admin';
    document.getElementById('admin-tab-nav')?.setAttribute('aria-label', en ? 'Admin menu' : 'Menu admin');
  }

  function applyAdminLanguage(lang) {
    lang = lang === 'en' ? 'en' : 'ms';
    document.documentElement.lang = lang;
    if (adminLangText) adminLangText.textContent = 'MS / EN';
    adminLangToggle?.setAttribute('aria-label', lang === 'en' ? 'Switch language to Malay' : 'Tukar bahasa kepada Inggeris');
    menuToggle?.setAttribute('aria-label', lang === 'en' ? 'Open menu' : 'Buka menu');
    menuClose?.setAttribute('aria-label', lang === 'en' ? 'Close menu' : 'Tutup menu');
    if (typeof applyTranslations === 'function') applyTranslations(lang);
    window.AdminI18n?.translate?.();
    updateAdminMenuLanguage(lang);
    updateAdminThemeButton();
    renderBookings(allBookings);
    renderServices(allServices);
    updateServiceLabels();
    // Bubble to window so gallery/hours listeners also refresh without resetting forms.
    document.dispatchEvent(new CustomEvent('admin-language', { detail: { lang }, bubbles: true }));
  }

  // Initialize language on admin page load
  const initialAdminLang = getStorage('language') || 'ms';
  applyAdminLanguage(initialAdminLang);

  adminLangToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    const nextLang = document.documentElement.lang === 'ms' ? 'en' : 'ms';
    setStorage('language', nextLang);
    applyAdminLanguage(nextLang);
  });

  // Legacy listener (jika admin.html ada toggle lama)
  document.getElementById('language-toggle')?.addEventListener('click', () => {
    const nextLang = document.documentElement.lang === 'ms' ? 'en' : 'ms';
    setStorage('language', nextLang);
    applyAdminLanguage(nextLang);
  });
})();
