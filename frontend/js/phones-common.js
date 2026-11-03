// phones-common.js
(function () {
  'use strict';
  const words = {
    ms: {
      catalog: 'Telefon Dijual', catalogDesc: 'Cari telefon pilihan anda. Semak ketersediaan melalui WhatsApp.',
      search: 'Carian', brand: 'Jenama', condition: 'Keadaan', sort: 'Susunan', refresh: 'Muat semula', all: 'Semua',
      latest: 'Terbaharu', low: 'Harga rendah ke tinggi', high: 'Harga tinggi ke rendah',
      loading: 'Memuatkan telefon…', empty: 'Tiada telefon untuk dipaparkan.', noMatch: 'Tiada telefon sepadan dengan carian.',
      failed: 'Katalog tidak dapat dimuatkan. Cuba muat semula.', details: 'Lihat Butiran', whatsapp: 'Tanya WhatsApp',
      available: 'Tersedia', reserved: 'Ditempah', sold: 'Terjual', unknown: 'Belum disahkan', newCondition: 'Baharu', used: 'Terpakai', refurbished: 'Dibaik pulih',
      name: 'Nama produk', model: 'Model', ram: 'RAM', storage: 'Storan', variant: 'Varian', colorMs: 'Warna (BM)', colorEn: 'Warna (EN)',
      color: 'Warna', price: 'Harga (RM)', stock: 'Stok', status: 'Status', battery: 'Kesihatan bateri (%)',
      set: 'Kelengkapan', full: 'Set lengkap', phoneOnly: 'Telefon sahaja', accessoriesMs: 'Kandungan set (BM)', accessoriesEn: 'Kandungan set (EN)',
      accessories: 'Kandungan set', warrantyMs: 'Waranti (BM)', warrantyEn: 'Waranti (EN)', warranty: 'Waranti',
      descriptionMs: 'Penerangan (BM)', descriptionEn: 'Penerangan (EN)', description: 'Penerangan', code: 'Kod produk',
      purchaseNote: 'Pertanyaan melalui WhatsApp bukan pengesahan pembelian. Harga dan stok perlu disahkan dengan kedai.',
      manage: 'Pengurusan Telefon', adminNote: 'Butiran dalam Firestore, gambar dalam Cloudinary. Produk baharu disimpan sebagai draf sehingga diterbitkan.',
      access: 'Sahkan akses dengan kata laluan galeri', verify: 'Sahkan akses', new: 'Produk baharu', redmi: 'Isi draf Redmi Note 13',
      publish: 'Terbitkan kepada pelanggan', upload: 'Tambah gambar (JPEG, PNG, WebP; 5 MB setiap gambar; maksimum 6)',
      imageHelp: 'Gambar pertama ialah gambar utama. Buang gambar atau susun semula sebelum simpan.',
      save: 'Simpan produk', cancel: 'Batal suntingan', edit: 'Sunting', delete: 'Padam', remove: 'Buang', first: 'Jadikan utama',
      draft: 'Draf', published: 'Diterbitkan', saved: 'Produk berjaya disimpan.', deleted: 'Produk dipadam.', saving: 'Menyimpan…',
      confirmDelete: 'Padam produk ini dan gambarnya?', imageMissing: 'Gambar belum ditambah', invalidFiles: 'Pilih maksimum 6 gambar JPEG, PNG atau WebP, setiap satu tidak melebihi 5 MB.',
      error: 'Operasi gagal. Semak sesi atau konfigurasi backend.', sessionExpired: 'Sesi tamat. Sila sahkan akses semula.', cleanup: 'Rekod disimpan, tetapi ada gambar yang belum dipadam. Semak log Cloudflare.',
      enquiry: 'Hai, saya berminat dengan', availability: 'Boleh sahkan harga dan ketersediaan?', unsaved: 'Buang perubahan yang belum disimpan?'
    },
    en: {
      catalog: 'Phones for Sale', catalogDesc: 'Find your next phone. Check availability via WhatsApp.', search: 'Search', brand: 'Brand',
      condition: 'Condition', sort: 'Sort', refresh: 'Refresh', all: 'All', latest: 'Newest', low: 'Price: low to high', high: 'Price: high to low',
      loading: 'Loading phones…', empty: 'No phones to display.', noMatch: 'No phones match your search.', failed: 'Unable to load the catalogue. Please refresh.',
      details: 'View Details', whatsapp: 'Ask on WhatsApp', available: 'Available', reserved: 'Reserved', sold: 'Sold', unknown: 'Not confirmed',
      newCondition: 'New', used: 'Used', refurbished: 'Refurbished', name: 'Product name', model: 'Model', ram: 'RAM', storage: 'Storage',
      variant: 'Variant', colorMs: 'Colour (BM)', colorEn: 'Colour (EN)', color: 'Colour', price: 'Price (RM)', stock: 'Stock', status: 'Status',
      battery: 'Battery health (%)', set: 'Package', full: 'Full set', phoneOnly: 'Phone only', accessoriesMs: 'Set contents (BM)', accessoriesEn: 'Set contents (EN)',
      accessories: 'Set contents', warrantyMs: 'Warranty (BM)', warrantyEn: 'Warranty (EN)', warranty: 'Warranty', descriptionMs: 'Description (BM)',
      descriptionEn: 'Description (EN)', description: 'Description', code: 'Product code',
      purchaseNote: 'WhatsApp enquiries are not confirmed purchases. Please confirm prices and stock with the shop.',
      manage: 'Phone Management', adminNote: 'Details are stored in Firestore, images in Cloudinary. New products remain drafts until published.',
      access: 'Verify access with the gallery password', verify: 'Verify access', new: 'New product', redmi: 'Fill Redmi Note 13 draft',
      publish: 'Publish to customers', upload: 'Add images (JPEG, PNG, WebP; 5 MB each; maximum 6)', imageHelp: 'The first image is the cover. Remove or reorder images before saving.',
      save: 'Save product', cancel: 'Cancel edit', edit: 'Edit', delete: 'Delete', remove: 'Remove', first: 'Make cover', draft: 'Draft', published: 'Published',
      saved: 'Product saved.', deleted: 'Product deleted.', saving: 'Saving…', confirmDelete: 'Delete this product and its images?', imageMissing: 'No image added yet',
      invalidFiles: 'Select up to 6 JPEG, PNG or WebP images, no larger than 5 MB each.', error: 'Operation failed. Check your session or backend configuration.',
      sessionExpired: 'Session expired. Please verify access again.', cleanup: 'Record saved, but some images could not be removed. Check Cloudflare logs.',
      enquiry: 'Hi, I am interested in', availability: 'Could you confirm the price and availability?', unsaved: 'Discard unsaved changes?'
    }
  };
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ms';
  const t = key => words[lang()][key] || key;
  const localized = (p, key) => p[key + (lang() === 'en' ? 'En' : 'Ms')] || t('unknown');
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function translate() {
    document.querySelectorAll('[data-phone-text]').forEach(el => { el.textContent = t(el.dataset.phoneText); });
  }
  function options(select, entries) {
    const previous = select.value;
    select.replaceChildren(...entries.map(([value, label]) => { const o = node('option', label); o.value = value; return o; }));
    if (entries.some(([v]) => v === previous)) select.value = previous;
  }
  const price = p => new Intl.NumberFormat(lang() === 'en' ? 'en-MY' : 'ms-MY', { style: 'currency', currency: 'MYR' }).format(p.price);
  const condition = p => t(p.condition === 'new' ? 'newCondition' : p.condition || 'unknown');
  const status = p => t(p.status === 'available' && !p.stock ? 'sold' : p.status || 'unknown');
  function image(p, url) {
    if (!url || !/^https:\/\/res\.cloudinary\.com\//.test(url)) return node('div', t('imageMissing'), 'phone-placeholder');
    const img = node('img'); img.src = url; img.alt = p.name; img.loading = 'lazy';
    img.addEventListener('error', () => img.replaceWith(node('div', t('imageMissing'), 'phone-placeholder')), { once: true });
    return img;
  }
  function whatsapp(p) {
    const a = node('a', t('whatsapp'), 'phone-whatsapp');
    a.href = 'https://wa.me/60122626434?text=' + encodeURIComponent(`${t('enquiry')} *${p.name}* (${p.code})\nRAM ${p.ram} · ${p.storage}\n${price(p)}\n${t('availability')}`);
    a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function card(p) {
    const el = node('article', undefined, 'phone-card');
    el.append(image(p, p.images?.[0]?.url), node('span', status(p), 'phone-badge'), node('h3', p.name),
      node('p', `${p.ram} RAM · ${p.storage} · ${t(p.set || 'unknown')}`), node('p', condition(p)), node('strong', price(p), 'phone-price'));
    return el;
  }
  window.PhoneUI = { t, lang, localized, node, translate, options, price, condition, status, image, whatsapp, card };
  document.addEventListener('DOMContentLoaded', translate);
  new MutationObserver(() => { translate(); window.dispatchEvent(new Event('phones-language')); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
