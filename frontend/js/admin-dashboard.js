// ============================================================
// 🛡️ ADMIN DASHBOARD - Firebase Firestore Edition
// ============================================================
// Fail ini menggantikan skrip inline dalam admin.html.
// Pastikan booking-firebase.js & services-firebase.js dimuat sebelum fail ini.
// admin-dashboard.js

(function() {
  'use strict';

  // URL Backend Cloudflare Worker anda
  const WORKER_URL = "https://sgmfix-admin.taihaulengcai.workers.dev";
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

  // ============================================================
  // ADMIN TAB NAVIGATION
  // ============================================================
  function initAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchAdminTab(tab);
      });
    });
  }

  function switchAdminTab(tab) {
    currentAdminTab = tab;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.remove('bg-gray-200', 'text-gray-700');
        btn.classList.add('bg-blue-600', 'text-white');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      }
    });

    if (tab === 'bookings') {
      bookingPanel?.classList.remove('hidden');
      servicePanel?.classList.add('hidden');
    } else {
      bookingPanel?.classList.add('hidden');
      servicePanel?.classList.remove('hidden');
    }

    // Scroll to top of panels
    const panels = document.getElementById('admin-panels');
    if (panels) panels.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  // FORMAT HELPERS (Booking)
  // ============================================================
  function formatStatusLabel(status, booking) {
    const lang = booking?.lang || document.documentElement.lang || 'ms';
    const t = window.translations?.[lang] || window.translations?.ms || {};
    const labels = {
      pending: t.BookingStatusPending || (lang === 'en' ? 'Pending Confirmation' : 'Menunggu Pengesahan'),
      confirmed: t.BookingStatusConfirmed || (lang === 'en' ? 'Confirmed' : 'Disahkan'),
      rejected: t.BookingStatusRejected || (lang === 'en' ? 'Rejected' : 'Ditolak')
    };
    return labels[status] || status;
  }

  function getAdminTranslations(booking) {
    const lang = booking?.lang || document.documentElement.lang || 'ms';
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
    const lang = booking?.lang || document.documentElement.lang || 'ms';
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

    filtered.forEach(booking => {
      const card = document.createElement('div');
      card.className = 'admin-card p-5';
      card.innerHTML = `
        <div class="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">${getAdminTranslations(booking).BookingCode}</p>
            <p class="text-lg font-bold text-blue-800">${booking.code}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(booking.status)}">
            ${formatStatusLabel(booking.status, booking)}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingName}:</span> <span class="font-semibold">${booking.name}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingPhone}:</span> <span class="font-semibold">${booking.phone}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingDevice}:</span> <span class="font-semibold">${booking.device || '-'}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingService}:</span> <span class="font-semibold">${booking.service}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingDate}:</span> <span class="font-semibold">${booking.date}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingTime}:</span> <span class="font-semibold">${formatTime12Hour(booking.time)}</span></div>
          <div><span class="text-gray-500">${getAdminTranslations(booking).BookingCreatedAt}:</span> <span class="font-semibold">${formatCreatedAt(booking.createdAt)}</span></div>
        </div>

        ${booking.notes ? `
          <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <span class="text-gray-500">${getAdminTranslations(booking).BookingNotes}:</span> ${booking.notes}
          </div>
        ` : ''}

        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button data-id="${booking.id}" data-status="confirmed"
                  class="btn-action flex-1 min-w-[110px] bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-check mr-1"></i> ${getAdminTranslations(booking).BookingStatusConfirmed}
          </button>
          <button data-id="${booking.id}" data-status="rejected"
                  class="btn-action flex-1 min-w-[110px] bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-times mr-1"></i> ${getAdminTranslations(booking).BookingStatusRejected}
          </button>
          <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage(booking)}"
             target="_blank" rel="noopener noreferrer"
             class="btn-action flex-1 min-w-[110px] bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold py-2 px-3 rounded-lg text-center">
            <i class="fab fa-whatsapp mr-1"></i> ${getNotifyButtonText(booking)}
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
    if (!result.success) alert('Gagal kemas kini status: ' + result.error);
  }

  async function deleteBooking(id) {
    const booking = allBookings.find(b => b.id === id);
    if (!booking) return;
    const lang = document.documentElement.lang || 'ms';
    const msg = window.translations?.[lang]?.BookingConfirmDelete || (lang === 'en' ? 'Delete this booking?' : 'Padam tempahan ini?');
    if (!confirm(`${msg}\n${booking.code}`)) return;

    const result = await window.deleteBookingFromFirebase(id);
    if (!result.success) alert('Gagal padam: ' + result.error);
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
              <p class="font-bold text-gray-800">${service.titleMs}</p>
              <p class="text-xs text-gray-500">${service.titleEn}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 rounded-full text-xs font-bold ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${service.active ? 'Aktif' : 'Tidak Aktif'}</span>
            <span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">${service.price || 'N/A'}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
          <div><span class="text-gray-500">BM:</span> ${service.descMs}</div>
          <div><span class="text-gray-500">EN:</span> ${service.descEn}</div>
          <div><span class="text-gray-500">Kategori:</span> <span class="font-semibold">${service.category || '-'}</span></div>
          <div><span class="text-gray-500">Susunan:</span> <span class="font-semibold">${service.order}</span></div>
        </div>
        <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button data-id="${service.id}" data-action="edit"
                  class="btn-action flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button data-id="${service.id}" data-action="toggle"
                  class="btn-action flex-1 min-w-[80px] ${service.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm font-bold py-2 px-3 rounded-lg">
            <i class="fas ${service.active ? 'fa-eye-slash' : 'fa-eye'} mr-1"></i> ${service.active ? 'Sembunyi' : 'Papar'}
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
    serviceFormTitle.textContent = 'Tambah Servis Baharu';
    serviceSubmitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i> Tambah Servis';
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

    serviceFormTitle.textContent = 'Edit Servis';
    serviceSubmitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Simpan Perubahan';
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
    const originalHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';

    let result;
    if (id) {
      result = await window.updateServiceInFirebase(id, data);
    } else {
      result = await window.addServiceToFirebase(data);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;

    if (result.success) {
      resetServiceForm();
    } else {
      alert('Gagal simpan servis: ' + result.error);
    }
  }

  async function toggleService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;
    const result = await window.updateServiceInFirebase(id, { active: !service.active });
    if (!result.success) alert('Gagal kemas kini status: ' + result.error);
  }

  async function deleteService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;
    if (!confirm(`Padam servis ini?\n${service.titleMs}`)) return;
    const result = await window.deleteServiceFromFirebase(id);
    if (!result.success) alert('Gagal padam servis: ' + result.error);
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
    if (!confirm('Reset servis kepada data asal (' + DEFAULT_SERVICES.length + ' servis)? Ini akan menggantikan semua servis sedia ada.')) return;

    // Padam semua servis sedia ada
    for (const s of allServices) {
      await window.deleteServiceFromFirebase(s.id);
    }

    // Import semula default
    const result = await window.importServicesToFirebase(DEFAULT_SERVICES, true);
    if (result.success) {
      alert('Servis asal telah dipulihkan! ' + result.count + ' servis diimport.');
    } else {
      alert('Gagal reset servis: ' + result.error);
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
    const input = document.getElementById('admin-password').value.trim();

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Log Masuk';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyemak...';
    }

    try {
      const response = await fetch(`${WORKER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('sgm_admin_token', data.token);
        sessionStorage.setItem('sgm_admin_logged_in', '1');
        loginError.classList.add('hidden');
        showDashboard();
      } else {
        loginError.classList.remove('hidden');
      }
    } catch (err) {
      console.error("Ralat Login:", err);
      alert("Ralat sambungan ke server. Sila cuba lagi.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('sgm_admin_logged_in');
    sessionStorage.removeItem('sgm_admin_token');
    location.reload();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-gray-200', 'text-gray-700');
      });
      btn.classList.remove('bg-gray-200', 'text-gray-700');
      btn.classList.add('bg-blue-600', 'text-white');
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
        if (!Array.isArray(imported)) throw new Error('Format tidak sah');
        if (!confirm(`Import ${imported.length} servis?`)) return;
        const result = await window.importServicesToFirebase(imported, true);
        if (result.success) {
          alert('Import berjaya! ' + result.count + ' servis diimport.');
        } else {
          alert('Import gagal: ' + result.error);
        }
      } catch (err) {
        alert('Gagal import: ' + err.message);
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
        if (!Array.isArray(imported)) throw new Error('Format tidak sah');
        if (!confirm(`Import ${imported.length} tempahan? Ini akan gabungkan dengan tempahan sedia ada.`)) return;
        const result = await window.importBookingsToFirebase(imported);
        if (result.success) {
          alert('Import berjaya! ' + result.count + ' tempahan diimport.');
        } else {
          alert('Import gagal: ' + result.error);
        }
      } catch (err) {
        alert('Gagal import: ' + err.message);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  function showDashboard() {
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

  // Semak session semasa load
  if (sessionStorage.getItem('sgm_admin_logged_in') === '1') {
    showDashboard();
  }

  // ============================================================
  // ADMIN LANGUAGE TOGGLE
  // ============================================================
  const adminLangToggle = document.getElementById('admin-language-toggle');
  const adminLangText = document.getElementById('admin-lang-text');

  function applyAdminLanguage(lang) {
    document.documentElement.lang = lang;
    if (adminLangText) adminLangText.textContent = lang === 'en' ? 'MS' : 'EN';
    if (typeof applyTranslations === 'function') applyTranslations(lang);
    renderBookings(allBookings);
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
