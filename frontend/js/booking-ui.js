// ============================================================
// 📱 BOOKING UI LOGIC - Guna Firebase
// ============================================================
// Fail ini menggantikan fungsi initBooking dalam script.js.
// Pastikan booking-firebase.js dimuat sebelum fail ini.
// booking-ui.js

(function() {
  'use strict';

  let bookingCache = [];

  function initBookingUI() {
    const form = document.getElementById('booking-form');
    const serviceSelect = document.getElementById('booking-service');
    const timeSelect = document.getElementById('booking-time');
    const dateInput = document.getElementById('booking-date');
    const listContainer = document.getElementById('booking-list');

    if (!form || !serviceSelect || !timeSelect || !dateInput || !listContainer) return;

    const services = {
      ms: [
        { value: "Penggantian Bateri", label: "Penggantian Bateri" },
        { value: "Pembaikan Skrin", label: "Pembaikan Skrin" },
        { value: "Pembaikan Kamera", label: "Pembaikan Kamera" },
        { value: "Port Pengecasan", label: "Port Pengecasan" },
        { value: "Kerosakan Air", label: "Kerosakan Air" },
        { value: "Backglass iPhone", label: "Backglass iPhone" },
        { value: "Face ID iPhone", label: "Face ID iPhone" },
        { value: "Motherboard iPhone", label: "Motherboard iPhone" },
        { value: "Apple iWatch Repair", label: "Apple iWatch Repair" },
        { value: "Diagnostik", label: "Imbasan Diagnostik" },
        { value: "Lain-lain", label: "Lain-lain" }
      ],
      en: [
        { value: "Battery Replacement", label: "Battery Replacement" },
        { value: "Screen Repair", label: "Screen Repair" },
        { value: "Camera Repair", label: "Camera Repair" },
        { value: "Charging Port", label: "Charging Port" },
        { value: "Water Damage", label: "Water Damage" },
        { value: "iPhone Backglass", label: "iPhone Backglass" },
        { value: "iPhone Face ID", label: "iPhone Face ID" },
        { value: "iPhone Motherboard", label: "iPhone Motherboard" },
        { value: "Apple iWatch Repair", label: "Apple iWatch Repair" },
        { value: "Diagnostic", label: "Diagnostic Scan" },
        { value: "Others", label: "Others" }
      ]
    };

    const times = [];
    for (let h = 10; h < 20; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`);
      times.push(`${String(h).padStart(2, '0')}:30`);
    }
    times.push("20:00");

    function populateOptions() {
      const lang = document.documentElement.lang || 'ms';
      const currentService = serviceSelect.value;
      const currentTime = timeSelect.value;

      serviceSelect.innerHTML = `                    <option value="" disabled selected data-i18n-key="BookingService">${window.translations[lang]?.BookingService || 'Jenis Servis'}</option>`;
      services[lang]?.forEach(s => {
        const option = document.createElement('option');
        option.value = s.value;
        option.textContent = s.label;
        serviceSelect.appendChild(option);
      });
      if (currentService) serviceSelect.value = currentService;

                        timeSelect.innerHTML = `<option value="" disabled selected data-i18n-key="BookingTime">${window.translations[lang]?.BookingTime || 'Masa'}</option>`;
      times.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = formatTime12Hour(t);
        timeSelect.appendChild(option);
      });
      if (currentTime) timeSelect.value = currentTime;
    }

    function setMinDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    function generateCode() {
      const date = new Date();
      const ts = date.getTime().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).toUpperCase().slice(-3);
      return `SGM-${ts}${random}`;
    }

  function getStatusWhatsAppMessage(booking) {
    const lang = document.documentElement.lang || 'ms';
    const t = window.translations[lang] || window.translations.ms;
    const key = booking.status === 'confirmed'
      ? 'WhatsAppBookingConfirmed'
      : (booking.status === 'rejected'
        ? 'WhatsAppBookingRejected'
        : 'WhatsAppBookingPending');
    const template = t[key] || t.WhatsAppBookingPending || '';
    return template.replace(/\{code\}/g, booking.code);
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

    const lang = document.documentElement.lang || 'ms';
    const monthNames = {
      ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[lang === 'en' ? 'en' : 'ms'][date.getMonth()];
    const year = date.getFullYear();

    let h = date.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const hh = String(h).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hh}:${mm} ${ampm}`;
  }

  function isOlderThan12Hours(isoOrTimestamp) {
    if (!isoOrTimestamp) return false;
    let date;
    if (typeof isoOrTimestamp === 'object' && isoOrTimestamp.seconds) {
      date = new Date(isoOrTimestamp.seconds * 1000);
    } else if (isoOrTimestamp.toDate) {
      date = isoOrTimestamp.toDate();
    } else {
      date = new Date(isoOrTimestamp);
    }
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return (now.getTime() - date.getTime()) > (12 * 60 * 60 * 1000);
  }

  async function cleanupExpiredBookings(bookings) {
    const lang = document.documentElement.lang || 'ms';
    const t = window.translations[lang] || window.translations.ms;
    for (const booking of bookings) {
      if (booking.createdAt && isOlderThan12Hours(booking.createdAt)) {
        const result = await window.deleteBookingFromFirebase(booking.id);
        if (result.success) {
          const message = (t.BookingAutoDeleted || '').replace(/\{code\}/g, booking.code);
          console.log(message);
        }
      }
    }
  }

  function formatBookingWhatsApp(booking) {
    const lang = document.documentElement.lang || 'ms';
    const t = window.translations[lang] || window.translations.ms;
    const phoneLabel = lang === 'en' ? 'Phone Number' : 'No. Telefon';
    return `*${t.BookingTitle || 'Tempahan Appointment'}*\n\n` +
           `*${t.BookingCode || 'Kod Tempahan'}:* ${booking.code}\n` +
           `*${t.BookingName || 'Nama'}:* ${booking.name}\n` +
           `*${phoneLabel}:* ${booking.phone}\n` +
           `*${t.BookingDevice || 'Model Peranti'}:* ${booking.device}\n` +
           `*${t.BookingService || 'Jenis Servis'}:* ${booking.service}\n` +
           `*${t.BookingDate || 'Tarikh'}:* ${booking.date}\n` +
           `*${t.BookingTime || 'Masa'}:* ${booking.time}\n` +
           (booking.notes ? `*${t.BookingNotes || 'Nota Tambahan'}:* ${booking.notes}\n` : '');
  }

  function formatTime12Hour(timeStr) {
    if (!timeStr) return '-';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

    function getStatusClass(status) {
      return {
        pending: 'bg-amber-100 text-amber-800',
        confirmed: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      }[status] || 'bg-gray-100 text-gray-800';
    }

    function renderBookings(bookings) {
      bookingCache = bookings || [];

      if (!bookingCache.length) {
        listContainer.innerHTML = `<p class="text-gray-500 text-sm text-center py-4" data-i18n-key="BookingNoAppointments">${window.translations[document.documentElement.lang || 'ms']?.BookingNoAppointments}</p>`;
        return;
      }

      listContainer.innerHTML = '';
      const lang = document.documentElement.lang || 'ms';
      const t = window.translations[lang] || window.translations.ms;

      bookingCache.forEach((booking) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 rounded-xl p-4 border border-gray-100';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">${t.BookingCode}</p>
              <p class="text-lg font-bold text-blue-800">${booking.code}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(booking.status)}">
              ${booking.status === 'pending' ? t.BookingStatusPending : (booking.status === 'confirmed' ? 'Disahkan' : 'Ditolak')}
            </span>
          </div>
          <div class="space-y-1 text-sm mb-3">
            <p><span class="text-gray-500">${t.BookingName}:</span> <span class="font-semibold">${booking.name}</span></p>
            <p><span class="text-gray-500">${lang === 'en' ? 'Phone Number' : 'No. Telefon'}:</span> <span class="font-semibold">${booking.phone}</span></p>
            <p><span class="text-gray-500">${t.BookingDevice}:</span> <span class="font-semibold">${booking.device || '-'}</span></p>
            <p><span class="text-gray-500">${t.BookingService}:</span> <span class="font-semibold">${booking.service}</span></p>
            <p><span class="text-gray-500">${t.BookingDate}:</span> <span class="font-semibold">${booking.date}</span></p>
            <p><span class="text-gray-500">${t.BookingTime}:</span> <span class="font-semibold">${formatTime12Hour(booking.time)}</span></p>
            <p><span class="text-gray-500">${t.BookingCreatedAt || 'Masa Pendaftaran'}:</span> <span class="font-semibold">${formatCreatedAt(booking.createdAt)}</span></p>
          </div>
          ${booking.notes ? `<p class="text-sm text-gray-600 bg-white rounded-lg p-2 mb-3"><span class="text-gray-500">${t.BookingNotes}:</span> ${booking.notes}</p>` : ''}
          <div class="flex gap-2">
            <a href="https://wa.me/60122626434?text=${encodeURIComponent(getStatusWhatsAppMessage(booking))}" target="_blank" rel="noopener noreferrer"
               class="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-lg text-center transition">
              <i class="fab fa-whatsapp mr-1"></i> ${t.WhatsApp || 'WhatsApp'}
            </a>
            ${booking.status === 'confirmed' ? '' : `
            <button data-id="${booking.id}" class="delete-booking-btn bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold py-2 px-3 rounded-lg transition">
              <i class="fas fa-trash"></i> ${t.BookingDelete}
            </button>
            `}
          </div>
        `;
        listContainer.appendChild(card);
      });

      // Event listener untuk delete (hanya padam butang yang wujud)
      listContainer.querySelectorAll('.delete-booking-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const booking = bookingCache.find(b => b.id === id);
          if (!booking) return;

          const t = window.translations[document.documentElement.lang || 'ms'] || window.translations.ms;
          if (!confirm(`${t.BookingConfirmDelete}\n${booking.code}`)) return;

          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          const result = await window.deleteBookingFromFirebase(id);
          if (!result.success) {
            alert('Gagal padam: ' + result.error);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-trash"></i> ' + t.BookingDelete;
          }
        });
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = document.documentElement.lang || 'ms';
      const t = window.translations[lang] || window.translations.ms;

      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const device = document.getElementById('booking-device').value.trim();
      const service = serviceSelect.value;
      const date = dateInput.value;
      const time = timeSelect.value;
      const notes = document.getElementById('booking-notes').value.trim();

      if (!name || !phone || !device || !service || !date || !time) {
        showToast(t.BookingRequired);
        return;
      }

      const booking = {
        code: generateCode(),
        name, phone, device, service, date, time, notes
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...';

      const result = await window.addBookingToFirebase(booking);

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      if (result.success) {
        showToast(t.BookingSavedFirebase || t.BookingSaved);
        form.reset();
        populateOptions();
        setMinDate();

        // Buka WhatsApp dengan maklumat tempahan
        const whatsappUrl = `https://wa.me/60122626434?text=${encodeURIComponent(formatBookingWhatsApp(booking))}`;
        window.open(whatsappUrl, '_blank');
      } else {
        const errMsg = t.BookingErrorFirebase || `Gagal simpan ke Firebase: ${result.error || 'Ralat tidak diketahui'}`;
        showToast(errMsg);
      }
    });

    // Pasang real-time listener
    if (typeof window.startBookingListener === 'function') {
      window.startBookingListener((bookings) => {
        cleanupExpiredBookings(bookings);
        renderBookings(bookings);
      });
    } else {
      // Fallback
      window.getBookingsFromFirebase().then(result => {
        if (result.success) {
          cleanupExpiredBookings(result.bookings);
          renderBookings(result.bookings);
        }
      }).catch(err => {
        console.error('Gagal dapatkan tempahan:', err);
      });
    }

    // Update paparan bila bahasa ditukar
    document.getElementById('language-toggle')?.addEventListener('click', () => {
      setTimeout(() => {
        populateOptions();
        renderBookings(bookingCache);
      }, 150);
    });

    populateOptions();
    setMinDate();
  }

  // Gantikan initBooking asal jika ada
  window.initBooking = initBookingUI;
})();
