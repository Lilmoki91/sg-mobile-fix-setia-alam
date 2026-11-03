// admin-i18.js
(function () {
  'use strict';
  const words = {
    'Kembali': 'Back', 'Panel Admin': 'Admin Panel', 'Admin Panel': 'Admin Panel',
    'Kata Laluan': 'Password', 'Masukkan kata laluan': 'Enter password', 'Log Masuk': 'Log In', 'Kata laluan salah.': 'Incorrect password.',
    'Tempahan': 'Bookings', 'Servis': 'Services', 'Waktu Operasi': 'Operating Hours', 'Gambar Kedai': 'Shop Gallery',
    'Pengurusan Servis': 'Service Management', 'Import ke Firebase': 'Import to Firebase', 'Reset Default': 'Reset to Defaults',
    'Eksport': 'Export', 'Import': 'Import',
    'Tambah, edit atau padam servis. Perubahan akan dipaparkan secara langsung di halaman utama.': 'Add, edit or delete services. Changes appear live on the main page.',
    'Tambah Servis Baharu': 'Add New Service', 'Edit Servis': 'Edit Service', 'Tambah Servis': 'Add Service',
    'Tajuk (BM)': 'Title (BM)', 'Tajuk (EN)': 'Title (EN)', 'Penerangan (BM)': 'Description (BM)', 'Penerangan (EN)': 'Description (EN)',
    'Harga (RM)': 'Price (RM)', 'Jenis Ikon': 'Icon Type', 'Kategori': 'Category', 'Susunan': 'Order', 'Mesej WhatsApp': 'WhatsApp Message',
    'Bateri': 'Battery', 'Kamera': 'Camera', 'Casing': 'Casing', 'Charging': 'Charging', 'Diagnostik': 'Diagnostics',
    'Speaker': 'Speaker', 'Power Button': 'Power Button', 'Screen': 'Screen', 'Software': 'Software', 'Tablet': 'Tablet',
    'Water Damage': 'Water Damage', 'Button': 'Button', 'Backglass': 'Back Glass', 'iWatch': 'iWatch', 'Face ID': 'Face ID',
    'Motherboard': 'Motherboard', 'Screen Color': 'Screen Colour', 'Genuine Part': 'Genuine Part',
    'Aktif': 'Active', 'Tidak Aktif': 'Inactive', 'Original Part': 'Original Part', 'Batal': 'Cancel', 'Simpan Perubahan': 'Save Changes',
    'Tiada servis untuk ditunjukkan.': 'No services to display.', 'Edit': 'Edit', 'Sembunyi': 'Hide', 'Papar': 'Show', 'Padam': 'Delete',
    'Tetapan Waktu Operasi': 'Operating Hours Settings',
    'Waktu Malaysia (Asia/Kuala_Lumpur). Masa yang sama digunakan pada hari terpilih; slot appointment setiap 30 minit, sebelum masa tutup. Tidak menyokong operasi merentas tengah malam.': 'Malaysia time (Asia/Kuala_Lumpur). The same hours apply to selected days; appointment slots are every 30 minutes, before closing time. Overnight hours are not supported.',
    'Sahkan akses menggunakan kata laluan galeri': 'Verify access using the gallery password', 'Sahkan akses tetapan': 'Verify settings access',
    'Masa buka': 'Opening time', 'Masa tutup': 'Closing time', 'Hari operasi': 'Operating days',
    'Pengurusan Gambar Kedai': 'Shop Gallery Management',
    'Gambar disimpan di Cloudinary. Upload pertama mengaktifkan galeri baharu menggantikan gambar asal. JPEG, PNG atau WebP, maksimum 5 MB.': 'Images are stored in Cloudinary. The first upload activates the new gallery, replacing the original images. JPEG, PNG or WebP, maximum 5 MB.',
    'Sahkan kata laluan galeri': 'Verify gallery password', 'Sahkan akses galeri': 'Verify gallery access',
    'Tajuk / teks alternatif gambar': 'Image title / alternative text', 'Gambar (wajib untuk gambar baharu)': 'Image (required for new images)',
    'Pratonton gambar': 'Image preview', 'Paparkan gambar': 'Show image', 'Simpan gambar': 'Save image',
    'Simpan perubahan': 'Save changes', 'Kosongkan / Batal edit': 'Clear / Cancel edit', 'Muat semula': 'Refresh',
    'Tiada gambar Cloudinary. Tambah gambar pertama untuk mengaktifkan galeri baharu.': 'No Cloudinary images. Add the first image to activate the new gallery.',
    'Dipaparkan': 'Visible', 'Disembunyikan': 'Hidden', 'Akses galeri disahkan.': 'Gallery access verified.',
    'Pilih JPEG, PNG atau WebP maksimum 5 MB.': 'Select a JPEG, PNG or WebP image up to 5 MB.', 'Sila pilih gambar.': 'Please select an image.',
    'Menyimpan gambar…': 'Saving image…', 'Menyimpan…': 'Saving…', 'Menyimpan...': 'Saving...', 'Menyemak...': 'Checking...',
    'Gambar berjaya disimpan. Galeri pelanggan dikemas kini dalam kira-kira 1–2 minit.': 'Image saved. The customer gallery updates in approximately 1–2 minutes.',
    'Galeri dikemas kini.': 'Gallery updated.', 'Pages Functions belum tersedia. Semak konfigurasi Cloudflare.': 'Pages Functions are unavailable. Check the Cloudflare configuration.',
    'Backend Pages Functions belum tersedia. Semak konfigurasi Cloudflare.': 'Pages Functions backend is unavailable. Check the Cloudflare configuration.',
    'Permintaan gagal.': 'Request failed.', 'Tetapan waktu tidak sah.': 'Invalid operating hours settings.',
    'Pilih hari dan pastikan masa tutup selepas masa buka.': 'Select days and ensure closing time is after opening time.',
    'Tiada slot booking untuk tetapan ini.': 'No booking slots for these settings.', 'Sila sahkan akses tetapan.': 'Please verify settings access.',
    'Tetapan semasa dimuatkan.': 'Current settings loaded.', 'Belum ada tetapan. Sila isi masa dan hari operasi kemudian simpan.': 'No settings yet. Enter operating hours and days, then save.',
    'Pilih hari operasi dan pastikan masa tutup selepas masa buka.': 'Select operating days and ensure closing time is after opening time.',
    'Waktu operasi disimpan. Paparan pelanggan dan slot baharu dikemas kini dalam kira-kira 1–2 minit.': 'Operating hours saved. The customer display and new slots update in approximately 1–2 minutes.',
    'Gagal kemas kini status: ': 'Failed to update status: ', 'Gagal padam: ': 'Failed to delete: ', 'Gagal simpan servis: ': 'Failed to save service: ',
    'Padam servis ini?': 'Delete this service?', 'Gagal padam servis: ': 'Failed to delete service: ', 'Gagal reset servis: ': 'Failed to reset services: ',
    'Format tidak sah': 'Invalid format', 'Import gagal: ': 'Import failed: ', 'Gagal import: ': 'Failed to import: ',
    'Ralat sambungan ke server. Sila cuba lagi.': 'Server connection error. Please try again.',
    'Semua': 'All', 'Tiada tempahan untuk ditunjukkan.': 'No bookings to display.'
  };
  // Technical names stay unchanged; Malay labels are used where a translation is meaningful.
  const malay = { 'Admin Panel': 'Panel Admin', 'Reset Default': 'Tetapkan Semula', 'Casing': 'Sarung', 'Charging': 'Pengecasan',
    'Speaker': 'Pembesar Suara', 'Power Button': 'Butang Kuasa', 'Screen': 'Skrin', 'Software': 'Perisian',
    'Water Damage': 'Kerosakan Air', 'Button': 'Butang', 'Backglass': 'Kaca Belakang', 'Motherboard': 'Papan Induk',
    'Screen Color': 'Warna Skrin', 'Genuine Part': 'Alat Ganti Asli', 'Original Part': 'Alat Ganti Asli', 'Edit': 'Sunting' };
  const t = (ms, en) => document.documentElement.lang === 'en' ? (en ?? words[ms] ?? ms) : (malay[ms] ?? ms);
  const bindings = [];
  function bind(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      // Existing translations and phone labels have their own translators.
      if (node.parentElement.closest('[data-i18n-key], [data-phone-text], script, style')) continue;
      const key = node.textContent.trim();
      if (Object.hasOwn(words, key)) bindings.push({ node, key, prefix: node.textContent.match(/^\s*/)[0], suffix: node.textContent.match(/\s*$/)[0] });
    }
  }
  bind(document.getElementById('login-screen'));
  bind(document.getElementById('admin-dashboard'));
  function translate() {
    bindings.forEach(({ node, key, prefix, suffix }) => { if (node.isConnected) node.textContent = prefix + t(key) + suffix; });
    const password = document.getElementById('admin-password');
    if (password) password.placeholder = t('Masukkan kata laluan');
    const preview = document.getElementById('gallery-preview');
    if (preview) preview.alt = t('Pratonton gambar');
    const all = document.querySelector('[data-filter="all"] span');
    if (all) all.textContent = t('Semua');
    const empty = document.querySelector('#admin-empty p');
    if (empty) empty.textContent = t('Tiada tempahan untuk ditunjukkan.');
    document.title = t('Panel Admin') + ' - SG Mobile Fix Setia Alam';
  }
  window.AdminI18n = { t, translate };
  new MutationObserver(() => {
    translate();
    window.dispatchEvent(new Event('admin-language'));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('DOMContentLoaded', translate);
})();
