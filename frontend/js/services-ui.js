// ============================================================
// 📱 SERVICE CARDS UI - Guna Firebase
// ============================================================
// Fail ini menggantikan kad servis statik di index.html dengan
// kad yang dijana secara dinamik daripada Firebase Firestore.
// services-ui.js

(function() {
  'use strict';

  // Cache servis terkini
  let servicesCache = [];

  // 🔥 Ikon servis ikut jenis (DAH DITAMBAH 'fas' UNTUK PAPAR ICON)
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
    genuine: 'fab fa-apple',
    default: 'fas fa-tools'
  };

  const colorMap = {
    battery: 'from-blue-600 to-blue-800 border-blue-700 hover:border-blue-400',
    camera: 'from-purple-600 to-purple-800 border-purple-700 hover:border-purple-400',
    casing: 'from-gray-600 to-gray-800 border-gray-700 hover:border-gray-400',
    charging: 'from-violet-600 to-violet-800 border-violet-700 hover:border-violet-400',
    diagnostic: 'from-red-600 to-red-800 border-red-700 hover:border-red-400',
    speaker: 'from-cyan-600 to-cyan-800 border-cyan-700 hover:border-cyan-400',
    power: 'from-orange-600 to-orange-800 border-orange-700 hover:border-orange-400',
    screen: 'from-indigo-600 to-indigo-800 border-indigo-700 hover:border-indigo-400',
    software: 'from-emerald-600 to-emerald-800 border-emerald-700 hover:border-emerald-400',
    tablet: 'from-rose-600 to-rose-800 border-rose-700 hover:border-rose-400',
    water: 'from-sky-600 to-sky-800 border-sky-700 hover:border-sky-400',
    button: 'from-pink-600 to-pink-800 border-pink-700 hover:border-pink-400',
    backglass: 'from-slate-600 to-slate-800 border-slate-700 hover:border-slate-400',
    watch: 'from-teal-600 to-teal-800 border-teal-700 hover:border-teal-400',
    faceid: 'from-fuchsia-600 to-fuchsia-800 border-fuchsia-700 hover:border-fuchsia-400',
    motherboard: 'from-amber-600 to-amber-800 border-amber-700 hover:border-amber-400',
    screencolor: 'from-lime-600 to-lime-800 border-lime-700 hover:border-lime-400',
    genuine: 'from-yellow-600 to-yellow-800 border-yellow-700 hover:border-yellow-400'
  };

  function getIconClass(type) {
    return iconMap[(type || '').toLowerCase()] || iconMap.default;
  }

  function getGradientClass(type) {
    return colorMap[(type || '').toLowerCase()] || 'from-blue-600 to-blue-800 border-blue-700 hover:border-blue-400';
  }

  function getWhatsAppId(index) {
    return `whatsapp-service-${index}`;
  }

  function formatPrice(price) {
    if (price === null || price === undefined || price === '') return 'N/A';
    if (typeof price === 'number') return `RM ${price}`;
    return String(price);
  }

  function renderTags(service, lang) {
    const tags = [];
    const categories = (service.category || '').split(/\s+/).filter(Boolean);

    categories.forEach(cat => {
      if (cat === 'iphone') tags.push({ icon: 'fab fa-apple', bg: 'bg-gray-900' });
      if (cat === 'android') tags.push({ icon: 'fab fa-android', bg: 'bg-green-700' });
      if (cat === 'tablet') tags.push({ icon: 'fas fa-tablet-alt', bg: 'bg-purple-700' });
    });

    if (service.isOriginal) tags.push({ icon: 'fas fa-check-circle', bg: 'bg-amber-700', text: 'Original' });

    if (!tags.length) return '';

    return `<div class="flex flex-wrap gap-1 justify-end">${tags.map(t => `<span class="${t.bg} text-white px-2 py-1 rounded text-xs whitespace-nowrap"><i class="${t.icon}"></i>${t.text ? ' ' + t.text : ''}</span>`).join('')}</div>`;
  }

  function createServiceCard(service, index) {
    const lang = document.documentElement.lang || 'ms';
    const title = lang === 'en' ? (service.titleEn || service.titleMs) : (service.titleMs || service.titleEn);
    const desc = lang === 'en' ? (service.descEn || service.descMs) : (service.descMs || service.descEn);
    const gradient = getGradientClass(service.type);
    const icon = getIconClass(service.type);
    const price = formatPrice(service.price);
    const whatsAppMsg = encodeURIComponent(service.whatsapp || '👋 hi saya ingin tanya tentang servis ini');
    const whatsappHref = `https://wa.me/60122626434?text=${whatsAppMsg}`;
    const whatsappId = getWhatsAppId(index);
    const t = window.translations[lang] || window.translations.ms;

    const card = document.createElement('div');
    card.className = `service-card flex-shrink-0 w-80 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 snap-start`;
    card.dataset.category = service.category || '';
    card.dataset.title = (title || '').toLowerCase();
    card.dataset.desc = (desc || '').toLowerCase();
    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start mb-3">
          <div class="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
            <i class="${icon} text-white text-xl"></i>
          </div>
          <span class="bg-black/20 text-white px-3 py-1 rounded-full text-sm font-bold">${price}</span>
        </div>
        <h3 class="text-lg font-bold text-white mb-2 service-card-title">${title || ''}</h3>
        <p class="text-white/90 text-sm mb-4 service-card-desc">${desc || ''}</p>
        <div class="flex items-center justify-between gap-2">
          <a href="${whatsappHref}" id="${whatsappId}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold transition hover:scale-105">
            <i class="fab fa-whatsapp mr-2"></i> <span>${t.WhatsApp || 'WhatsApp'}</span>
          </a>
          ${renderTags(service, lang)}
        </div>
      </div>
    `;
    return card;
  }

  function renderServices(services) {
    const container = document.getElementById('cardsContainer');
    const counter = document.getElementById('visibleCount');
    if (!container) return;

    servicesCache = services || [];

    // Padam semua kad servis lama
    container.innerHTML = '';

    // Hanya tunjukkan servis aktif
    const activeServices = servicesCache.filter(s => s.active !== false);

    activeServices.forEach((service, index) => {
      const card = createServiceCard(service, index);
      container.appendChild(card);
    });

    // Kemas kini penunjuk jumlah
    if (counter) counter.textContent = activeServices.length;

    // Trigger semula filter semasa jika ada
    if (typeof window.reapplyServiceFilter === 'function') {
      window.reapplyServiceFilter();
    }
  }

  function initDynamicServices() {
    // Pasang real-time listener
    if (typeof window.startServicesListener === 'function') {
      window.startServicesListener((services) => {
        renderServices(services);
      });
    } else {
      // Fallback
      window.getServicesFromFirebase().then(result => {
        if (result.success) renderServices(result.services);
      }).catch(err => console.error('Gagal muat servis:', err));
    }
  }

  // Pendedahan global
  window.initDynamicServices = initDynamicServices;
  window.servicesCache = servicesCache;
})();
