// pwa-install.js
import { getStorage, setStorage, removeStorage, showToast } from './utils.js';

let deferredPrompt = null;
let refreshPwaInstall = () => {};
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); deferredPrompt = event;
  removeStorage('pwa-installed-hint'); refreshPwaInstall();
});

let registrationStarted = false;
export async function initServiceWorker() {
  if (registrationStarted || !('serviceWorker' in navigator) || !window.isSecureContext) return;
  registrationStarted = true;
  // Satu pendaftaran sahaja; reload hanya apabila halaman sudah dikawal SW.
  let controlled = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled && !reloading) { reloading = true; window.location.reload(); }
    controlled = true;
  });
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await registration.update();
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) { console.warn('Service worker tidak dapat didaftarkan:', error); }
}

export function initPwaInstall() {
  const overlay = document.getElementById('install-overlay');
  const closeBtn = document.getElementById('close-overlay-btn');
  const closeLink = document.getElementById('close-overlay-link');
  const installBtn = document.getElementById('install-btn-overlay');
  if (!overlay || !installBtn || overlay.dataset.initialized) return;
  overlay.dataset.initialized = 'true';
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
  const title = overlay.querySelector('[data-i18n-key="PwaTitle"]');
  const description = overlay.querySelector('[data-i18n-key="PwaDesc"]');
  const buttonLabel = installBtn.querySelector('span');
  [title, description, buttonLabel, closeLink].forEach(element => element?.removeAttribute('data-i18n-key'));
  const instructions = document.createElement('p');
  instructions.style.cssText = 'display:none;white-space:pre-line;text-align:left;font-size:14px;line-height:1.7;color:#444;margin:0 0 20px;';
  installBtn.before(instructions);
  const displayMode = window.matchMedia('(display-mode: standalone)');
  const isStandalone = () => displayMode.matches || navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let manualVisible = false, busy = false, previousFocus = null;
  function getTexts() {
    const texts = {
      ms: {
        title: 'Pasang App SG Mobile Fix', description: 'Akses pantas terus dari skrin utama peranti anda.',
        install: 'Install App', guide: 'Cara pasang', later: 'Tidak sekarang', close: 'Tutup',
        ios: '1. Buka laman ini dalam Safari (bukan pelayar dalam WhatsApp/Facebook).\n2. Tekan ikon Kongsi (kotak dengan anak panah ke atas), atau menu Safari kemudian Kongsi.\n3. Pilih “Add to Home Screen” / “Tambah ke Skrin Utama”.\n4. Jika tersedia, hidupkan “Open as Web App”, kemudian tekan “Add” / “Tambah”.\n5. Buka SG Mobile Fix melalui ikon di skrin utama.',
        other: 'Buka laman ini dalam Chrome, Edge atau pelayar yang menyokong PWA. Pilih menu pelayar → “Install app” atau “Add to Home screen” jika tersedia.\n\nJika pilihan itu tiada, laman mungkin belum memenuhi syarat pemasangan atau pelayar tidak menyokongnya.',
        already: 'Sudah dipasang? Buka melalui ikon SG Mobile Fix di skrin utama. Pelayar biasa, terutama iOS, tidak dapat memastikan sama ada app sudah dipasang.',
        insecure: 'Pemasangan PWA memerlukan laman HTTPS. Buka alamat HTTPS laman ini dahulu.',
        error: 'Pemasangan tidak dapat dimulakan. Cuba lagi atau gunakan panduan pemasangan.', installing: 'Memasang…'
      },
      en: {
        title: 'Install SG Mobile Fix App', description: 'Quick access directly from your device’s Home Screen.',
        install: 'Install App', guide: 'How to install', later: 'Not now', close: 'Close',
        ios: '1. Open this site in Safari (not the WhatsApp/Facebook in-app browser).\n2. Tap Share (the square with an upward arrow), or the Safari menu then Share.\n3. Select “Add to Home Screen”.\n4. If available, enable “Open as Web App”, then tap “Add”.\n5. Open SG Mobile Fix using its Home Screen icon.',
        other: 'Open this site in Chrome, Edge or a browser supporting PWA installation. Select the browser menu → “Install app” or “Add to home screen”, if available.\n\nIf the option is missing, the site may not meet installation requirements or the browser may not support it.',
        already: 'Already installed? Open SG Mobile Fix using its Home Screen icon. A regular browser, especially on iOS, cannot reliably determine whether the app is installed.',
        insecure: 'PWA installation requires HTTPS. Open the HTTPS address of this site first.',
        error: 'Unable to start installation. Try again or use the installation guide.', installing: 'Installing…'
      }
    };
    return texts[document.documentElement.lang] || texts.ms;
  }
  function updateUI() {
    const t = getTexts();
    if (title) title.textContent = t.title;
    if (description) description.textContent = t.description;
    if (buttonLabel) buttonLabel.textContent = busy ? t.installing : deferredPrompt ? t.install : t.guide;
    if (closeLink) closeLink.textContent = t.later;
    closeBtn?.setAttribute('aria-label', t.close); overlay.setAttribute('aria-label', t.title);
    instructions.textContent = (!window.isSecureContext ? t.insecure : isIOS ? t.ios : t.other) + '\n\n' + t.already;
    instructions.style.display = manualVisible ? 'block' : 'none'; installBtn.disabled = busy;
  }
  function hideOverlay() {
    overlay.style.display = 'none';
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  function showOverlay() {
    if (isStandalone()) return;
    previousFocus = document.activeElement; manualVisible = !deferredPrompt;
    updateUI(); overlay.style.display = 'flex'; closeBtn?.focus();
  }
  function dismiss() {
    try { sessionStorage.setItem('pwa-install-dismissed', 'true'); } catch {}
    hideOverlay();
  }
  refreshPwaInstall = updateUI;
  closeBtn?.addEventListener('click', dismiss); closeLink?.addEventListener('click', dismiss);
  overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismiss();
    if (event.key === 'Tab') {
      const controls = [closeBtn, installBtn, closeLink].filter(button => button && !button.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  installBtn.addEventListener('click', async () => {
    if (busy) return;
    if (isStandalone()) { hideOverlay(); return; }
    if (!deferredPrompt) { manualVisible = true; updateUI(); return; }
    const prompt = deferredPrompt; deferredPrompt = null; busy = true; updateUI();
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') hideOverlay(); else manualVisible = true;
    } catch (error) { manualVisible = true; showToast(getTexts().error); }
    finally { busy = false; updateUI(); }
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null; setStorage('pwa-installed-hint', 'true'); hideOverlay(); updateUI();
  });
  function checkStandalone() {
    if (isStandalone()) { setStorage('pwa-installed-hint', 'true'); hideOverlay(); }
  }
  displayMode.addEventListener?.('change', checkStandalone); checkStandalone();
  new MutationObserver(updateUI).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  updateUI();
  setTimeout(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true'; } catch {}
    if (!dismissed && (deferredPrompt || getStorage('pwa-installed-hint') !== 'true')) showOverlay();
  }, 1500);
}
