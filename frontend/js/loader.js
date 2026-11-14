// tranlatiob on.js
// Titik masuk pelanggan. Import statik memastikan modul siap sebelum DOMContentLoaded.
import '/script.js';
import { initMenu, initBottomNavigation } from '/navigation.js';
import { initTheme } from '/theme.js';
import { initLanguage, applyTranslations } from './js/i18n.js';
import { initGallery, initLightboxControls, initSocialDots } from './js/gallery-ui.js';
import { initServiceFilters } from './js/service-filters.js';
import { initShareButton, initShareSocial, initShareLocation } from './js/social-share.js';
import { initBusinessCard } from './js/business-card.js';
import { initServiceWorker, initPwaInstall } from '/pwa-install.js';

// Modul sedia ada dikekalkan; kebergantungan Firebase/Auth dimuat mengikut susunan.
import '/firebase-config.js';
import '/auth-client.js';
import './js/profile.js';
import './js/booking-firebase.js';
import './js/shop-hours.js';
import './js/services-firebase.js';
import './js/booking-ui.js';
import './js/services-ui.js';
import './js/gallery-client.js';
import './js/phones.js';
import './js/testimonial-videos.js';
import './js/ai-chatbot.js';

let started = false;
function start() {
  if (started) return;
  started = true;
  const initializers = [
    initMenu, initBottomNavigation, initTheme, initLanguage,
    initServiceFilters, () => window.initDynamicServices?.(),
    initGallery, initLightboxControls, initSocialDots,
    initShareButton, initShareSocial, initShareLocation, initBusinessCard,
    initServiceWorker, initPwaInstall, () => window.initBooking?.(),
    () => applyTranslations(document.documentElement.lang)
  ];
  initializers.forEach(initialize => {
    try {
      const result = initialize();
      if (result?.catch) result.catch(error => console.error('Permulaan modul gagal:', error));
    } catch (error) { console.error('Permulaan modul gagal:', error); }
  });
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
