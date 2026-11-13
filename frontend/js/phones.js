// phones.js
// Utiliti bersama pelanggan/admin, diikuti modul jualan pelanggan.
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
      enquiry: 'Hai, saya berminat dengan', availability: 'Boleh sahkan harga dan ketersediaan?', unsaved: 'Buang perubahan yang belum disimpan?',
      videosTitle: 'Video Telefon di Kedai', videosDesc: 'Lihat telefon jualan SG Mobile Fix dengan lebih dekat. Sahkan harga dan stok terkini melalui WhatsApp.',
      video1: 'Video telefon 1', video2: 'Video telefon 2', video3: 'Video telefon 3', openTikTok: 'Tak dapat main? Buka di TikTok',
      scrollDesktop: 'Gunakan mouse wheel atau scroll horizontal', scrollMobile: 'Scroll ke kiri atau kanan untuk melihat lebih banyak',
      goVideo: 'Pergi ke video telefon', moduleLoading: 'Memuatkan bahagian jualan telefon…', moduleFailed: 'Bahagian jualan tidak dapat dimuatkan. Cuba muat semula.'
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
      enquiry: 'Hi, I am interested in', availability: 'Could you confirm the price and availability?', unsaved: 'Discard unsaved changes?',
      videosTitle: 'Phones for Sale — Videos', videosDesc: 'Take a closer look at phones sold at SG Mobile Fix. Confirm current prices and stock via WhatsApp.',
      video1: 'Phone video 1', video2: 'Phone video 2', video3: 'Phone video 3', openTikTok: "Can't play? Open on TikTok",
      scrollDesktop: 'Use mouse wheel or horizontal scroll', scrollMobile: 'Scroll left or right to see more',
      goVideo: 'Go to phone video', moduleLoading: 'Loading the phone sales section…', moduleFailed: 'Unable to load the sales section. Please refresh.'
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
  // Kontrak ini dikekalkan untuk phones-admin.js.
  window.PhoneUI = { t, lang, localized, node, translate, options, price, condition, status, image, whatsapp, card };
  document.addEventListener('DOMContentLoaded', translate);
  new MutationObserver(() => { translate(); window.dispatchEvent(new Event('phones-language')); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

(function () {
  'use strict';
  const U = window.PhoneUI, $ = id => document.getElementById(id);
  const host = $('phones-tab');
  // Admin hanya menggunakan utiliti bersama; jangan muat fragmen pelanggan.
  if (!host || !host.hasAttribute('data-phones-module')) return;
  const fragmentUrl = new URL('phones.html', document.currentScript?.src || document.baseURI);
  async function fetchContent(url, format) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response[format]();
    } finally { clearTimeout(timeout); }
  }
  const videos = [
    ['7705292294714428690', 'video1'],
    ['7704535984691547399', 'video2'],
    ['7706824674767949064', 'video3']
  ];
  let ready = false, modulePromise = null;
  let products = [], loaded = false, failed = false, loading = false, selectedId = null;
  let dialog, videoItems = [], activeVideo = null;

  function moduleState(key, retry = false) {
    const box = U.node('div', undefined, 'phone-module-state');
    const text = U.node('p', U.t(key)); text.dataset.phoneText = key;
    text.setAttribute('role', 'status'); box.append(text);
    if (retry) {
      const button = U.node('button', U.t('refresh')); button.type = 'button'; button.dataset.phoneText = 'refresh';
      button.addEventListener('click', () => { ensureModule().then(ok => { if (ok) refresh(); }); }); box.append(button);
    }
    host.replaceChildren(box);
  }
  function ensureModule() {
    if (ready) return Promise.resolve(true);
    if (modulePromise) return modulePromise;
    modulePromise = Promise.resolve().then(async () => {
      host.setAttribute('aria-busy', 'true');
      try {
        // Gunakan HTML sedia ada; fetch hanya untuk shell lama yang masih kosong.
        if (!host.querySelector('#phones-grid') || !host.querySelector('#phone-detail')) {
          moduleState('moduleLoading');
          const template = document.createElement('template');
          template.innerHTML = await fetchContent(fragmentUrl, 'text');
          if (!template.content.querySelector('#phones-grid') || !template.content.querySelector('#phone-detail')) throw new Error('invalid phones fragment');
          host.replaceChildren(template.content);
        }
        initClient(); ready = true; updateLanguage();
        return true;
      } catch (error) {
        ready = false;
        console.warn('Modul jualan tidak dapat dimuatkan:', error);
        moduleState('moduleFailed', true); return false;
      } finally { host.removeAttribute('aria-busy'); modulePromise = null; }
    });
    return modulePromise;
  }
  function filters() {
    U.options($('phones-brand'), [['', U.t('all')], ...[...new Set(products.map(p => p.brand))].sort().map(b => [b, b])]);
    U.options($('phones-condition'), [['', U.t('all')], ['new', U.t('newCondition')], ['used', U.t('used')], ['refurbished', U.t('refurbished')]]);
    U.options($('phones-sort'), [['latest', U.t('latest')], ['low', U.t('low')], ['high', U.t('high')]]);
    $('phones-search').placeholder = U.t('search');
  }
  function render() {
    const query = $('phones-search').value.trim().toLocaleLowerCase();
    const matches = products.filter(p => (!query || [p.name, p.brand, p.model, p.ram, p.storage, p.code].join(' ').toLocaleLowerCase().includes(query)) &&
      (!$('phones-brand').value || p.brand === $('phones-brand').value) && (!$('phones-condition').value || p.condition === $('phones-condition').value));
    const sort = $('phones-sort').value;
    matches.sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : String(b.createdAt).localeCompare(String(a.createdAt)));
    $('phones-state').textContent = failed ? U.t('failed') : !loaded ? U.t('loading') : !products.length ? U.t('empty') : !matches.length ? U.t('noMatch') : `${matches.length} ${U.t('catalog')}`;
    $('phones-grid').replaceChildren(...matches.map(p => {
      const card = U.card(p), actions = U.node('div', undefined, 'phone-actions'), button = U.node('button', U.t('details'));
      button.type = 'button'; button.addEventListener('click', () => { selectedId = p.id; detail(p); dialog.showModal(); });
      actions.append(button);
      if (p.status === 'available' && p.stock > 0) actions.append(U.whatsapp(p));
      card.append(actions); return card;
    }));
    if (dialog.open) {
      const selected = products.find(p => p.id === selectedId);
      if (selected) detail(selected); else dialog.close();
    }
  }
  function detail(p) {
    const content = $('phone-detail-content'), gallery = U.node('div', undefined, 'phone-detail-gallery');
    if (p.images?.length) gallery.append(...p.images.map(i => U.image(p, i.url))); else gallery.append(U.image(p));
    const title = U.node('h2', p.name); title.id = 'phone-detail-title';
    const dl = U.node('dl', undefined, 'phone-specs');
    const rows = [['code', p.code], ['brand', p.brand], ['model', p.model], ['ram', p.ram], ['storage', p.storage],
      ['variant', p.variant || U.t('unknown')], ['condition', U.condition(p)], ['color', U.localized(p, 'color')],
      ['set', U.t(p.set)], ['accessories', U.localized(p, 'accessories')], ['warranty', U.localized(p, 'warranty')],
      ['battery', p.battery === null ? U.t('unknown') : p.battery + '%'], ['stock', p.stock === null ? U.t('unknown') : p.stock], ['status', U.status(p)]];
    rows.forEach(([key, value]) => dl.append(U.node('dt', U.t(key)), U.node('dd', String(value))));
    content.replaceChildren(gallery, title, U.node('strong', U.price(p), 'phone-price'), dl, U.node('p', U.localized(p, 'description'), 'phone-description'));
    if (p.status === 'available' && p.stock > 0) content.append(U.whatsapp(p));
    content.append(U.node('p', U.t('purchaseNote'), 'phone-note'));
  }
  async function refresh() {
    if (!ready || loading || document.hidden) return;
    loading = true; $('phones-retry').disabled = true;
    $('phones-state').textContent = U.t('loading');
    try {
      const data = await fetchContent('/api/phones/products', 'json');
      if (!Array.isArray(data.products)) throw new Error('catalog');
      products = data.products; loaded = true; failed = false; filters();
    } catch { failed = true; }
    finally { loading = false; $('phones-retry').disabled = false; render(); }
  }
  function initVideos() {
    const container = $('phoneVideoScrollContainer'), dots = $('phoneVideoDotsContainer');
    videos.forEach(([id, key], index) => {
      const card = U.node('div', undefined, 'phone-video-card');
      const frame = U.node('div', undefined, 'phone-video-frame');
      const poster = U.node('button', undefined, 'phone-video-poster'); poster.type = 'button';
      const logo = U.node('i', undefined, 'fab fa-tiktok'); logo.setAttribute('aria-hidden', 'true');
      const play = U.node('span', '▶', 'phone-video-play'); play.setAttribute('aria-hidden', 'true');
      const title = U.node('span', U.t(key)); title.dataset.phoneText = key;
      poster.append(logo, play, title); frame.append(poster);
      poster.addEventListener('click', () => {
        window.__tiktokStop?.();
        const iframe = U.node('iframe');
        iframe.src = `https://www.tiktok.com/player/v1/${id}?autoplay=1&controls=1&description=0&music_info=0&rel=0`;
        iframe.title = U.t(key); iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
        iframe.setAttribute('allowfullscreen', ''); iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.replaceChildren(iframe); activeVideo = { iframe, key };
        const stop = () => {
          frame.replaceChildren(poster); activeVideo = null;
          if (window.__tiktokStop === stop) window.__tiktokStop = null;
        };
        window.__tiktokStop = stop;
      });
      const fallback = U.node('a', U.t('openTikTok'), 'phone-video-fallback'); fallback.dataset.phoneText = 'openTikTok';
      fallback.href = `https://www.tiktok.com/@sgmobilesetiaalam/video/${id}`; fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
      card.append(frame, fallback); container.append(card);
      const dot = U.node('button'); dot.type = 'button'; dots.append(dot);
      dot.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
      videoItems.push({ card, dot, index, title, key });
    });
    function mark(index) {
      videoItems.forEach(item => {
        item.dot.classList.toggle('is-active', item.index === index);
        item.dot.setAttribute('aria-pressed', String(item.index === index));
      });
    }
    mark(0);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) mark(videoItems.findIndex(item => item.card === visible[0].target));
      }, { root: container, threshold: 0.6 });
      videoItems.forEach(item => observer.observe(item.card));
    }
    new MutationObserver(() => {
      if (!host.classList.contains('active')) {
        if (activeVideo) window.__tiktokStop?.();
        if (dialog.open) dialog.close();
      }
    }).observe(host, { attributes: true, attributeFilter: ['class'] });
  }
  function updateLanguage() {
    U.translate();
    if (!ready) return;
    filters(); render();
    videoItems.forEach(({ dot, index, title, key }) => {
      dot.setAttribute('aria-label', `${U.t('goVideo')} ${index + 1}`);
      title.textContent = U.t(key);
    });
    if (activeVideo) activeVideo.iframe.title = U.t(activeVideo.key);
    // Waktu operasi kekal menggunakan sistem bersama laman utama.
    host.querySelectorAll('[data-i18n-key="OperatingHours"]').forEach(el => {
      el.textContent = window.shopHours ? window.shopHours.text(U.lang()) : '';
      el.parentElement.hidden = !window.shopHours?.configured;
      el.parentElement.style.display = window.shopHours?.configured ? '' : 'none';
    });
  }
  function initClient() {
    dialog = $('phone-detail');
    $('phone-detail-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
    ['phones-search', 'phones-brand', 'phones-condition', 'phones-sort'].forEach(id => $(id).addEventListener(id === 'phones-search' ? 'input' : 'change', render));
    $('phones-retry').addEventListener('click', refresh);
    initVideos();
    setInterval(() => { if (host.classList.contains('active')) refresh(); }, 60000);
  }
  $('phones-menu-action')?.addEventListener('click', async event => {
    event.preventDefault(); window.showTab?.('phones-tab'); window.closeMenu?.();
    document.querySelectorAll('.mobile-bottom-nav a').forEach(a => a.classList.remove('active'));
    if (await ensureModule()) { if (!loaded || failed) refresh(); }
  });
  window.addEventListener('phones-language', updateLanguage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && activeVideo) window.__tiktokStop?.();
    if (host.classList.contains('active')) refresh();
  });
  async function activate() {
    if (await ensureModule()) {
      if (host.classList.contains('active') && (!loaded || failed)) refresh();
    }
  }
  new MutationObserver(() => {
    if (host.classList.contains('active')) activate();
  }).observe(host, { attributes: true, attributeFilter: ['class'] });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate, { once: true });
  } else {
    activate();
  }
})();
