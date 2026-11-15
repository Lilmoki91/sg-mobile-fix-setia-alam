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
import { initBottomNavigation, showTab } from './esm/features/nav.js'; // 🔥 TAMBAH showTab
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
window.showTab = showTab; // 🔥 TAMBAH INI: Supaya menu legacy boleh tukar tab

// Fallback initBooking
function initBooking() {}

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
  // 1. Jalankan init UI asas
  initMenu();
  initShareButton();
  initTheme();
  initLanguage();
  initBottomNavigation();
  initServiceFilters();

  // 2. Jalankan fungsi dari fail legacy dengan sedikit delay
  // Ini memastikan fail legacy seperti services-ui.js dan profile.js sudah didaftarkan ke window
  setTimeout(() => {
    if (typeof window.initDynamicServices === 'function') {
      window.initDynamicServices();
    } else {
      console.warn('⚠️ initDynamicServices tidak dijumpai');
    }
    
    if (typeof window.initChatbot === 'function') {
      window.initChatbot();
    }
  }, 300); // Tunggu 300ms

  // 3. Jalankan modul ESM yang lain
  initGallery();
  initTranslation();
  initShareLocation();
  initLightboxControls();
  initSocialDots();
  initServiceWorker();
  initPwaInstall();
  initBooking();

  const fbOverlay = document.getElementById('fb-overlay');
  if (fbOverlay) {
    window.facebookOverlay = initFacebookOverlay();
    initShareSocial();
  }

  // Auto buka side menu
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('menu') === 'open') {
    setTimeout(() => {
      window.openMenu?.();
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 300);
  }

  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();
});
