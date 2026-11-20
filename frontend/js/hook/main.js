/**
 * main.js — Entry Point ESM (Final - Fix Booking UI)
 */

import { escapeHtml, showToast } from './esm/core/utils.js';
import { initTranslation } from './esm/i18n/index.js';
import { initTheme, applyTheme } from './esm/features/theme.js';
import { initLanguage } from './esm/features/language.js';
import { initMenu } from './esm/features/menu.js';
import { initBottomNavigation, showTab } from './esm/features/nav.js';
import { initServiceFilters } from './esm/features/filter.js';
import { initGallery, initLightboxControls } from './esm/features/gallery.js';
import { initTestimonials } from './esm/features/testimonials.js';
import { shareCard, saveCard } from './esm/features/card.js';
import { initShareButton, initShareSocial, initShareLocation } from './esm/features/share.js';
import { initFacebookOverlay } from './esm/features/facebook-overlay.js';
import { initSocialDots } from './esm/features/social-dot.js';
import { initServiceWorker, initPwaInstall } from './esm/features/pwa.js';
import { initBookingAI } from './esm/features/booking-ai.js';

// 🔥 TAMBAH INI: Supaya fail legacy boleh guna terjemahan
import { translations } from './esm/i18n/translations.js';

// ===== BRIDGE ke window.* (untuk fail legacy) =====
window.translations = translations; // 🔥 DEDAHKAN TRANSLATIONS
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.shareCard = shareCard;
window.saveCard = saveCard;
window.initTestimonials = initTestimonials;
window.initGallery = initGallery;
window.applyTheme = applyTheme;
window.showTab = showTab;

// Jalankan init dengan selamat: satu ralat tidak akan hentikan init lain
const safe = (name, fn) => {
  try {
    const result = fn();
    if (result && typeof result.catch === 'function') {
      result.catch(err => console.error(`[init] ${name} gagal:`, err));
    }
  } catch (err) {
    console.error(`[init] ${name} gagal:`, err);
  }
};

const start = () => {
  // 1. Init UI ESM
  safe('menu', initMenu);
  safe('shareButton', initShareButton);
  safe('theme', initTheme);
  safe('language', initLanguage);
  safe('bottomNav', initBottomNavigation);
  safe('serviceFilters', initServiceFilters);
  safe('translation', initTranslation);
  safe('shareLocation', initShareLocation);
  safe('lightbox', initLightboxControls);
  safe('socialDots', initSocialDots);
  safe('serviceWorker', initServiceWorker);
  safe('pwaInstall', initPwaInstall);

  // Panggil initBooking dari window (fail legacy booking-ui.js)
  safe('booking', () => {
    if (typeof window.initBooking === 'function') window.initBooking();
  });
  safe('bookingAI', initBookingAI);

  // 2. Panggil data Firebase (Beri masa 500ms untuk pastikan legacy JS sedia)
  setTimeout(() => {
    if (typeof window.initDynamicServices === 'function') {
      window.initDynamicServices();
    }
  }, 500);

  // 3. Chatbot
  if (typeof window.initChatbot === 'function') {
    window.initChatbot();
  }

  // 4. Facebook Overlay
  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  // 5. Auto buka side menu
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      window.openMenu?.();
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }, 300);
  }

  // 6. Set Tahun
  const currentYear = document.getElementById('current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
};

// Modul dimuat selepas DOM mungkin sudah siap, jadi semak readyState
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
