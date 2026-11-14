// tranlatiob on.js
// Titik masuk pelanggan. Import statik memastikan modul siap sebelum DOMContentLoaded.
import './script.js';
import { initMenu, initBottomNavigation } from './navigation.js';
import { initTheme } from './theme.js';
import { initLanguage, applyTranslations } from './i18n.js';
import { initGallery, initLightboxControls, initSocialDots } from './gallery-ui.js';
import { initServiceFilters } from './service-filters.js';
import { initShareButton, initShareSocial, initShareLocation } from './social-share.js';
import { initBusinessCard } from './business-card.js';
import { initServiceWorker, initPwaInstall } from './pwa-install.js';

// Modul sedia ada dikekalkan; kebergantungan Firebase/Auth dimuat mengikut susunan.
import './firebase-config.js';
import './auth-client.js';
import './profile.js';
import './booking-firebase.js';
import './shop-hours.js';
import './services-firebase.js';
import './booking-ui.js';
import './services-ui.js';
import './gallery-client.js';
import './phones.js';
import './testimonial-videos.js';
import './ai-chatbot.js';

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
