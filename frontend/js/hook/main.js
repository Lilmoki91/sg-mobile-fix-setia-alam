/**
 * main.js — Entry Point ESM
 * Lokasi: js/hook/main.js
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

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  
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

  // 2. PEMBETULAN: Tunggu fungsi legacy benar-benar wujud sebelum dipanggil
  let attempts = 0;
  const waitForServices = setInterval(() => {
    attempts++;
    if (typeof window.initDynamicServices === 'function') {
      clearInterval(waitForServices); // Berhenti menunggu
      window.initDynamicServices();   // Jalankan servis!
      console.log("✅ Servis Firebase berjaya dimulakan.");
    } else if (attempts >= 20) { // Tunggu maksimum 5 saat (20 x 250ms)
      clearInterval(waitForServices);
      console.error("❌ Gagal: Fail services-ui.js tidak dimuatkan langsung.");
    }
  }, 250);

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
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }, 300);
  }

  // 6. Set Tahun
  const currentYear = document.getElementById('current-year');
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});
