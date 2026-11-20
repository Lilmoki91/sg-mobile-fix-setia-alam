/** main.js — Bootstrap UI dengan kegagalan modul yang diasingkan. */

const domReady = document.readyState === 'loading'
  ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
  : Promise.resolve();

async function safe(name, fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(`[init] ${name} gagal:`, error);
    return undefined;
  }
}

// Import juga mesti dilindungi; try/catch pada init sahaja tidak mencukupi.
function feature(path, setup) {
  return safe(path, async () => {
    const module = await import(path);
    await domReady;
    await setup(module);
    return module;
  });
}

// Klien legacy boleh menerima data sebelum modul renderer selesai dimuatkan.
// Simpan data terakhir tanpa memadam kandungan sedia ada dengan init kosong.
function queueRenderer(name) {
  let pendingArgs;
  window[name] = (...args) => { pendingArgs = args; };
  return render => {
    window[name] = render;
    if (pendingArgs) {
      const args = pendingArgs;
      pendingArgs = undefined;
      return safe(name, () => render(...args));
    }
  };
}

const connectGallery = queueRenderer('initGallery');
const connectTestimonials = queueRenderer('initTestimonials');

// Digunakan klien testimoni apabila tab ditutup atau halaman disembunyikan.
window.stopTestimonialVideo = () => {
  if (document.querySelector('#videoScrollContainer iframe')) window.__tiktokStop?.();
};

const utilitiesReady = feature('./esm/core/utils.js', module => {
  window.escapeHtml = module.escapeHtml;
  window.showToast = module.showToast;
});
const translationsReady = feature('./esm/i18n/translations.js', module => {
  window.translations = module.translations;
});

// Navigasi asas tidak menunggu AI, Firebase, terjemahan atau PWA.
const navigationReady = feature('./esm/features/nav.js', async module => {
  window.showTab = module.showTab;
  await safe('bottomNav', module.initBottomNavigation);
});
feature('./esm/features/menu.js', async module => {
  await safe('menu', module.initMenu);
  await safe('menuLink', () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('menu') !== 'open' || typeof window.openMenu !== 'function') return;
    window.openMenu();
    url.searchParams.delete('menu');
    window.history.replaceState(window.history.state, document.title, url.href);
  });
});

const themeReady = feature('./esm/features/theme.js', async module => {
  window.applyTheme = module.applyTheme;
  await safe('theme', module.initTheme);
});
const languageReady = feature('./esm/features/language.js', async module => {
  await Promise.all([themeReady, navigationReady]);
  await safe('language', module.initLanguage);
});
feature('./esm/i18n/index.js', async module => {
  await languageReady;
  await safe('translation', module.initTranslation);
});

feature('./esm/features/gallery.js', async module => {
  await safe('lightbox', module.initLightboxControls);
  await connectGallery(module.initGallery);
});
feature('./esm/features/testimonials.js', async module => {
  await languageReady;
  await connectTestimonials(module.initTestimonials);
});
feature('./esm/features/card.js', module => {
  window.shareCard = module.shareCard;
  window.saveCard = module.saveCard;
});
feature('./esm/features/share.js', async module => {
  await safe('shareButton', module.initShareButton);
  await safe('shareLocation', module.initShareLocation);
  await safe('shareSocial', module.initShareSocial);
});
feature('./esm/features/facebook-overlay.js', async module => {
  if (document.getElementById('fb-overlay')) {
    window.facebookOverlay = await safe('facebookOverlay', module.initFacebookOverlay);
  }
});
feature('./esm/features/social-dot.js', module => module.initSocialDots());
const filtersReady = feature('./esm/features/filter.js', async module => {
  await languageReady;
  await safe('serviceFilters', module.initServiceFilters);
});
feature('./esm/features/pwa.js', async module => {
  // L'enregistrement du service worker ne doit pas bloquer le bouton installer.
  await Promise.all([
    safe('serviceWorker', module.initServiceWorker),
    safe('pwaInstall', module.initPwaInstall)
  ]);
});

// defer biasanya sudah siap pada DOMContentLoaded; tunggu secara terhad jika lewat.
async function initLegacy(name, isReady, initialize) {
  await domReady;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (isReady()) return safe(name, initialize);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.warn(`[init] ${name}: skrip legacy belum tersedia selepas 10 saat.`);
}

const bookingReady = safe('booking', async () => {
  await Promise.all([utilitiesReady, translationsReady, languageReady]);
  await initLegacy('booking',
    () => typeof window.initBooking === 'function',
    () => window.initBooking());
});
feature('./esm/features/booking-ai.js', async module => {
  await bookingReady;
  await safe('bookingAI', module.initBookingAI);
});
safe('services', async () => {
  await Promise.all([utilitiesReady, translationsReady, filtersReady]);
  await initLegacy('services',
    () => typeof window.initDynamicServices === 'function'
      && (typeof window.startServicesListener === 'function'
        || typeof window.getServicesFromFirebase === 'function'),
    () => window.initDynamicServices());
});

// ai-chatbot.js memulakan dirinya sendiri; jangan gandakan event listener di sini.
safe('currentYear', async () => {
  await domReady;
  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
});
