// ============================================================
// 🛡️ ADMIN DASHBOARD - Firebase Firestore Edition
// ============================================================
// Fail ini menggantikan skrip inline dalam admin.html.
// Pastikan booking-firebase.js dimuat sebelum fail ini.
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
  const bookingList = document.getElementById('admin-booking-list');
  const emptyState = document.getElementById('admin-empty');
  const filterBtns = document.querySelectorAll('.filter-admin-btn');

  let currentFilter = 'all';
  let allBookings = [];

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
  // FORMAT HELPERS
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
  // RENDER
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
  // TINDAKAN
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
  // EVENT LISTENERS
  // ============================================================
  
  // LOGIN BAHARU (Guna Cloudflare Worker)
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('admin-password').value.trim();
    
    // UI Loading state (Pilihan)
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Log Masuk';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyemak...';
    }

    try {
      // Hantar password ke Cloudflare Worker untuk disemak
      const response = await fetch(`${WORKER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input })
      });

      const data = await response.json();

      if (data.success) {
        // Simpan token keselamatan dari Worker
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
    sessionStorage.removeItem('sgm_admin_token'); // Padam token bila logout
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

  // ============================================================
  // IMPORT / EXPORT JSON
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

    // Pasang real-time listener
    if (typeof window.startBookingListener === 'function') {
      window.startBookingListener(renderBookings);
    } else {
      window.getBookingsFromFirebase().then(result => {
        if (result.success) renderBookings(result.bookings);
      }).catch(err => console.error('Gagal muat tempahan:', err));
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
