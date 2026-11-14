// Terjemahan UI admin sahaja; data pelanggan dan nilai borang tidak diubah.
(function () {
  'use strict';
  const words = {
    'Panel Admin': 'Admin Panel',
    'Kembali': 'Back',
    'Kata Laluan': 'Password',
    'Masukkan kata laluan': 'Enter your password',
    'Log Masuk': 'Log In',
    'Sedang log masuk': 'Logging in',
    'Sila login untuk meneruskan.': 'Please log in to continue.',
    'Kata laluan salah.': 'Incorrect password.',
    'Sesi tamat. Sila login semula.': 'Your session has expired. Please log in again.',
    'Sesi 24 jam telah tamat. Sila login semula.': 'Your 24-hour session has expired. Please log in again.',
    'Sila login semula.': 'Please log in again.',
    'Menyemak sesi selamat…': 'Checking your secure session…',
    'Sambungan lambat atau terputus. Sesi anda masih disimpan. Sila cuba semula.': 'The connection is slow or disconnected. Your session is still saved. Please try again.',
    'Terlalu banyak percubaan. Tunggu 15 minit.': 'Too many attempts. Please wait 15 minutes.',
    'Pages Functions belum tersedia. Sistem ini memerlukan deployment Cloudflare dan konfigurasi Firebase/Turnstile.': 'Pages Functions are not available. This system requires a Cloudflare deployment and Firebase/Turnstile configuration.',
    'GALLERY_KV diperlukan untuk had percubaan admin.': 'GALLERY_KV is required to limit admin login attempts.',
    'Tetapkan ADMIN_PASSWORD sekurang-kurangnya 16 aksara.': 'Set ADMIN_PASSWORD to at least 16 characters.',
    'Konfigurasi identiti admin tidak sah.': 'Invalid admin identity configuration.',
    'Service account belum ditetapkan.': 'The service account has not been configured.',
    'Rekod sudah berubah. Cuba lagi.': 'The record has changed. Please try again.',
    'Operasi database gagal.': 'The database operation failed.',
    'Origin tidak dibenarkan.': 'This origin is not allowed.',
    'JSON diperlukan.': 'JSON is required.',
    'Body diperlukan.': 'A request body is required.',
    'Permintaan terlalu besar.': 'The request is too large.',
    'JSON tidak sah.': 'Invalid JSON.',
    'Endpoint atau kaedah tidak dibenarkan.': 'The endpoint or method is not allowed.',
    'Ralat backend. Semak log Cloudflare.': 'Backend error. Check the Cloudflare logs.',
    'Pengurusan Servis': 'Service Management',
    'Import ke Firebase': 'Import to Firebase',
    'Reset Default': 'Reset to Defaults',
    'Eksport': 'Export',
    'Import': 'Import',
    'Tambah, edit atau padam servis. Perubahan akan dipaparkan secara langsung di halaman utama.': 'Add, edit or delete services. Changes will appear live on the homepage.',
    'Tambah Servis Baharu': 'Add New Service',
    'Edit Servis': 'Edit Service',
    'Tambah Servis': 'Add Service',
    'Simpan Perubahan': 'Save Changes',
    'Simpan perubahan': 'Save changes',
    'Tajuk (BM)': 'Title (BM)',
    'Tajuk (EN)': 'Title (EN)',
    'Penerangan (BM)': 'Description (BM)',
    'Penerangan (EN)': 'Description (EN)',
    'Harga (RM)': 'Price (RM)',
    'Jenis Ikon': 'Icon Type',
    'Kategori': 'Category',
    'Susunan': 'Order',
    'Mesej WhatsApp': 'WhatsApp Message',
    'Aktif': 'Active',
    'Tidak Aktif': 'Inactive',
    'Original Part': 'Original Part',
    'Batal': 'Cancel',
    'Edit': 'Edit',
    'Sembunyi': 'Hide',
    'Papar': 'Show',
    'Padam': 'Delete',
    'Dipaparkan': 'Visible',
    'Disembunyikan': 'Hidden',
    'Bateri': 'Battery',
    'Kamera': 'Camera',
    'Diagnostik': 'Diagnostics',
    'Tiada servis untuk ditunjukkan.': 'No services to display.',
    'Menyimpan...': 'Saving...',
    'Menyimpan…': 'Saving…',
    'Gagal kemas kini status:': 'Failed to update status:',
    'Gagal padam:': 'Failed to delete:',
    'Gagal simpan servis:': 'Failed to save service:',
    'Gagal padam servis:': 'Failed to delete service:',
    'Gagal reset servis:': 'Failed to reset services:',
    'Padam servis ini?': 'Delete this service?',
    'Format tidak sah': 'Invalid format',
    'Import gagal:': 'Import failed:',
    'Gagal import:': 'Failed to import:',
    'Ralat sambungan ke server. Sila cuba lagi.': 'Server connection error. Please try again.',
    'Skrip pengesahan gagal dimuatkan. Muat semula halaman dan cuba lagi.': 'The authentication script could not be loaded. Refresh the page and try again.',
    'Tetapan Waktu Operasi': 'Operating Hours Settings',
    'Waktu Malaysia (Asia/Kuala_Lumpur). Masa yang sama digunakan pada hari terpilih; slot appointment setiap 30 minit, sebelum masa tutup. Tidak menyokong operasi merentas tengah malam.': 'Malaysia time (Asia/Kuala_Lumpur). The same hours apply to selected days; appointments are available every 30 minutes before closing. Overnight opening hours are not supported.',
    'Sahkan akses menggunakan kata laluan galeri': 'Verify access using the gallery password',
    'Sahkan akses tetapan': 'Verify settings access',
    'Masa buka': 'Opening time',
    'Masa tutup': 'Closing time',
    'Hari operasi': 'Operating days',
    'Pilih hari dan pastikan masa tutup selepas masa buka.': 'Select days and ensure the closing time is after the opening time.',
    'Pilih hari operasi dan pastikan masa tutup selepas masa buka.': 'Select operating days and ensure the closing time is after the opening time.',
    'Tiada slot booking untuk tetapan ini.': 'No booking slots for these settings.',
    'Sila sahkan akses tetapan.': 'Please verify access to settings.',
    'Tetapan semasa dimuatkan.': 'Current settings loaded.',
    'Belum ada tetapan. Sila isi masa dan hari operasi kemudian simpan.': 'No settings yet. Enter operating hours and days, then save.',
    'Tetapan waktu tidak sah.': 'Invalid operating hours settings.',
    'Waktu operasi disimpan. Paparan pelanggan dan slot baharu dikemas kini dalam kira-kira 1–2 minit.': 'Operating hours saved. The customer view and new slots will update in approximately 1–2 minutes.',
    'Pengurusan Gambar Kedai': 'Shop Gallery Management',
    'Gambar disimpan di Cloudinary. Upload pertama mengaktifkan galeri baharu menggantikan gambar asal. JPEG, PNG atau WebP, maksimum 5 MB.': 'Images are stored in Cloudinary. The first upload activates a new gallery replacing the original images. JPEG, PNG or WebP, maximum 5 MB.',
    'Sahkan kata laluan galeri': 'Verify gallery password',
    'Sahkan akses galeri': 'Verify gallery access',
    'Tajuk / teks alternatif gambar': 'Image title / alternative text',
    'Gambar (wajib untuk gambar baharu)': 'Image (required for new images)',
    'Pratonton gambar': 'Image preview',
    'Paparkan gambar': 'Show image',
    'Simpan gambar': 'Save image',
    'Kosongkan / Batal edit': 'Clear / Cancel edit',
    'Muat semula': 'Refresh',
    'Akses galeri disahkan.': 'Gallery access verified.',
    'Pilih JPEG, PNG atau WebP maksimum 5 MB.': 'Choose a JPEG, PNG or WebP image no larger than 5 MB.',
    'Sila pilih gambar.': 'Please select an image.',
    'Menyimpan gambar…': 'Saving image…',
    'Gambar berjaya disimpan. Galeri pelanggan dikemas kini dalam kira-kira 1–2 minit.': 'Image saved. The customer gallery will update in approximately 1–2 minutes.',
    'Galeri dikemas kini.': 'Gallery updated.',
    'Pages Functions belum tersedia. Semak konfigurasi Cloudflare.': 'Pages Functions are not available. Check the Cloudflare configuration.',
    'Backend Pages Functions belum tersedia. Semak konfigurasi Cloudflare.': 'The Pages Functions backend is not available. Check the Cloudflare configuration.',
    'Permintaan gagal.': 'Request failed.'
  };

  function t(ms, en) {
    if (document.documentElement.lang !== 'en') return ms;
    if (en !== undefined) return en;
    const key = String(ms ?? '').trim();
    return Object.prototype.hasOwnProperty.call(words, key)
      ? String(ms).replace(key, () => words[key]) : ms;
  }

  // Capture only template text before other modules render records. Updating text
  // nodes preserves icons, checkbox controls, listeners and unsaved form values.
  const bindings = [];
  const excluded = '[data-i18n-key], [data-phone-text], textarea, script, #service-form-title, #service-submit-btn, #gallery-save, #login-form button';
  document.querySelectorAll('#login-screen, #admin-service-panel, #admin-hours-panel, #admin-gallery-panel').forEach(root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement.closest(excluded) && Object.prototype.hasOwnProperty.call(words, node.data.trim())) {
        bindings.push({ node, ms: node.data });
      }
    }
  });
  const attributes = [
    ['admin-password', 'placeholder', 'Masukkan kata laluan'],
    ['gallery-preview', 'alt', 'Pratonton gambar']
  ];
  // The booking filter must say “All”, not the homepage's “All Services”.
  window.translations = window.translations || {};
  ['ms', 'en'].forEach(lang => {
    window.translations[lang] = window.translations[lang] || {};
    window.translations[lang].AdminFilterAll = lang === 'en' ? 'All' : 'Semua';
  });
  function translate() {
    const header = document.querySelector('#admin-header h1');
    if (header) header.textContent = t('Panel Admin');
    document.title = `${t('Panel Admin')} - SG Mobile Fix Setia Alam`;
    bindings.forEach(({ node, ms }) => { if (node.isConnected) node.data = t(ms); });
    attributes.forEach(([id, attribute, ms]) => document.getElementById(id)?.setAttribute(attribute, t(ms)));
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    if (loginButton && !loginButton.disabled) loginButton.textContent = t('Log Masuk');
    if (loginButton?.getAttribute('aria-busy') === 'true') {
      loginButton.setAttribute('aria-label', t('Sedang log masuk'));
    }
    // Session messages may arrive before this script or remain visible during a language change.
    const loginMessage = document.getElementById('login-error');
    if (loginMessage) {
      const current = loginMessage.textContent;
      const source = Object.prototype.hasOwnProperty.call(words, current)
        ? current : Object.keys(words).find(key => words[key] === current);
      if (source) loginMessage.textContent = t(source);
    }
  }
  window.AdminI18n = { t, translate };
})();
