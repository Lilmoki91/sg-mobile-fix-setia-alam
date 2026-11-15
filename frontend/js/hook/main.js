/**
 * main.js — Entry Point ESM
 * Lokasi: js/hook/main.js
 * Semua modul ESM dalam js/hook/esm/
 */

// ===== CORE =====
import { escapeHtml, showToast } from './esm/core/utils.js';

// ===== I18N =====
import { initTranslation } from './esm/i18n/index.js';

// ===== FEATURES =====
import { initTheme, applyTheme } from './esm/features/theme.js';
import { initLanguage } from './esm/features/language.js';
import { initMenu } from './esm/features/menu.js';
import { initBottomNavigation, showTab } from './esm/features/nav.js';
import { initServiceFilters } from './esm/features/filters.js';
import { initGallery, initLightboxControls } from './esm/features/gallery.js';
import { initTestimonials } from './esm/features/testimonials.js';
import { shareCard, saveCard } from './esm/features/card.js';
import { initShareButton, initShareSocial, initShareLocation } from './esm/features/share.js';
import { initFacebookOverlay } from './esm/features/facebook-overlay.js';
import { initSocialDots } from './esm/features/social-dots.js';
import { initServiceWorker, initPwaInstall } from './esm/features/pwa.js';

// ===== BRIDGE ke window.* (untuk fail legacy) =====
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.shareCard = shareCard;
window.saveCard = saveCard;
window.initTestimonials = initTestimonials;
window.initGallery = initGallery;
window.applyTheme = applyTheme;
window.showTab = showTab;

// Fallback initBooking
function initBooking() {}

// ===== FUNGSI UNTUK TARIK SERVIS (DENGAN RETRY) =====
function loadServicesWithRetry(retries = 5) {
  if (typeof window.initDynamicServices === 'function') {
    // Jika fail services-ui.js sudah sedia, jalankan
    window.initDynamicServices();
    console.log("✅ Servis berjaya dimuatkan dari Firebase.");
  } else if (retries > 0) {
    // Jika belum sedia, tunggu 300ms dan cuba lagi
    console.warn(`⏳ Menunggu services-ui.js siap... (Baki cubaan: ${retries})`);
    setTimeout(() => loadServicesWithRetry(retries - 1), 300);
  } else {
    console.error("❌ Gagal: window.initDynamicServices tidak dijumpai dalam fail legacy!");
  }
}

// ===== GUNA 'LOAD' BUKAN 'DOMContentLoaded' =====
window.addEventListener('load', () => {
  
  // 1. Init UI ESM
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();
  initTranslation();
  initShareLocation();
  initLightboxControls();
  initSocialDots();
  initServiceWorker();
  initPwaInstall();
  initBooking();

  // 2. Jalankan tarik servis (Firebase)
  loadServicesWithRetry();

  // 3. Jalankan Chatbot jika ada
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
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 300);
  }

  // 6. Set Tahun Semasa
  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // 7. Dedahkan fungsi untuk membolehkan Admin refresh data tanpa reload page
  window.refreshMainServices = loadServicesWithRetry;
});
