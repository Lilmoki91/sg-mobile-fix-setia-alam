// All Firebase credentials stay in memory. The durable session is an HttpOnly cookie.
(function () {
  'use strict';
  const adminPage = !!document.getElementById('admin-dashboard');
  let current = null, sdk, auth, googleAuth, widget, siteKey, timer, deleting = false, loginFlow = false;
  let generation = 0;
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('sgm-auth-events') : null;
  const overlay = document.getElementById('auth-overlay');
  const el = id => document.getElementById('auth-' + id);
  const message = value => { if (el('message')) el('message').textContent = value; };
  // Prevents the "checking session" screen from hanging forever on a slow/resumed mobile connection.
  function withTimeout(promise, ms, text) {
    let timeout;
    return Promise.race([promise, new Promise((_, reject) => {
      timeout = setTimeout(() => { const e = new Error(text); e.status = 0; reject(e); }, ms);
    })]).finally(() => clearTimeout(timeout));
  }
  const NETWORK_MESSAGE = 'Sambungan lambat atau terputus. Sesi anda masih disimpan. Sila cuba semula.';
  async function api(path, data) {
    let response;
    try {
      response = await fetch('/api/auth/' + path, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(data === undefined ? 15000 : 30000), ...(data !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
    } catch (_) { const e = new Error(NETWORK_MESSAGE); e.status = 0; throw e; }
    let result;
    try { result = await response.json(); } catch { throw new Error('Pages Functions belum tersedia. Sistem ini memerlukan deployment Cloudflare dan konfigurasi Firebase/Turnstile.'); }
    if (!response.ok) { const e = new Error(result.error || 'Sesi tamat. Sila login semula.'); e.status = response.status; throw e; }
    return result;
  }
  let initPromise = null;
  // Retryable: a failed init (e.g. offline at app resume) is not cached.
  function initialize() {
    if (!initPromise) {
      initPromise = withTimeout((async () => {
        // Do not wait for Firestore to load; the session check only needs Firebase Auth.
        const apps = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const nextSdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const app = apps.getApps().length ? apps.getApp() : apps.initializeApp(window.firebaseConfig);
        const nextAuth = nextSdk.getAuth(app);
        const nextGoogle = nextSdk.getAuth(apps.getApps().find(a => a.name === 'google-login') || apps.initializeApp(window.firebaseConfig, 'google-login'));
        await Promise.all([nextSdk.setPersistence(nextAuth, nextSdk.inMemoryPersistence), nextSdk.setPersistence(nextGoogle, nextSdk.inMemoryPersistence)]);
        sdk = nextSdk; auth = nextAuth; googleAuth = nextGoogle;
      })(), 20000, NETWORK_MESSAGE).catch(error => { initPromise = null; throw error; });
    }
    return initPromise;
  }
  function notify() { document.dispatchEvent(new CustomEvent('sgm-auth-changed', { detail: current })); }
  function lock() {
    current = null; generation++; clearTimeout(timer);
    if (!adminPage) {
      document.documentElement.classList.add('auth-locked');
      overlay.hidden = false;
      el('delete').hidden = true; el('cancel').hidden = true; el('google').hidden = false;
      if (el('retry')) el('retry').hidden = true;
      el('title').textContent = 'Selamat datang';
      el('intro').textContent = '';
      el('intro').hidden = true;
    }
    if (widget !== undefined && window.turnstile) { window.turnstile.remove(widget); widget = undefined; }
    deleting = false; loginFlow = false;
    window.cachedBookings = []; window.cachedBookingsReady = false;
    document.getElementById('booking-list')?.replaceChildren();
    document.getElementById('booking-form')?.reset();
    if (el('profile')) el('profile').textContent = '';
    notify();
  }
  async function accept(data, version = ++generation) {
    if (version !== generation) return;
    await withTimeout(sdk.signInWithCustomToken(auth, data.customToken), 20000, NETWORK_MESSAGE);
    if (version !== generation) return;
    // Do not retain the custom token returned by the backend.
    current = { uid: data.uid, role: data.role, profile: data.profile, expiresAt: data.expiresAt };
    if (!adminPage) {
      document.documentElement.classList.remove('auth-locked'); overlay.hidden = true;
      const name = document.getElementById('booking-name');
      if (name && !name.value) name.value = data.profile?.nama || '';
      if (el('profile')) el('profile').textContent = data.profile?.nama || data.profile?.email || data.uid;
    }
    notify();
    clearTimeout(timer);
    // A relative server-derived duration is cosmetic; backend + Rules enforce the deadline.
    timer = setTimeout(() => { lock(); sdk.signOut(auth).catch(() => {}); message('Sesi 24 jam telah tamat. Sila login semula.'); location.reload(); }, Math.max(0, Date.parse(data.expiresAt) - Date.parse(data.serverNow)));
  }
  let restoring = null, retryTimer = null, retries = 0;
  const retryButton = () => el('retry');
  function restore() {
    if (restoring) return restoring;
    const version = generation;
    clearTimeout(retryTimer);
    if (retryButton()) retryButton().hidden = true;
    restoring = (async () => {
      try {
        await initialize();
        if (version !== generation) return current;
        const data = await api(adminPage ? 'admin-session' : 'session');
        // Keep the same attempt ID through Firebase sign-in so its errors reach this catch.
        if (version === generation) { await accept(data, version); retries = 0; }
      } catch (error) {
        if (version === generation) {
          // Only 401/403 mean the session is really invalid; everything else is a transient problem
          // (the HttpOnly cookie is still on the device), so offer a retry instead of getting stuck.
          const invalid = error.status === 401 || error.status === 403;
          if (!invalid && current) return current; // already signed in; a brief network drop must not log the user out
          lock();
          // Show recovery immediately, even if Firebase cleanup is slow.
          if (auth) sdk.signOut(auth).catch(() => {});
          message(error.status === 401 ? 'Sila login untuk meneruskan.' : error.message);
          if (!invalid && !adminPage) {
            if (retryButton()) retryButton().hidden = false;
            if (retries < 3) { retries++; retryTimer = setTimeout(() => restore(), 3000 * retries); }
          }
        }
      }
      return current;
    })().finally(() => { restoring = null; });
    return restoring;
  }
  async function clearBrowser() {
    window.closeMenu?.();
    try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}
    if ('caches' in window) { try { await Promise.all((await caches.keys()).map(k => caches.delete(k))); } catch (_) {} }
    // HTTP cache is cleared by Clear-Site-Data where supported; it cannot be cleared by JS everywhere.
    await Promise.allSettled([sdk.signOut(auth), sdk.signOut(googleAuth)]);
  }
  async function logout(broadcast = true) {
    lock();
    let error;
    try { await api(adminPage ? 'admin-logout' : 'logout', {}); } catch (e) { error = e; }
    await clearBrowser();
    if (broadcast) { channel?.postMessage({ type: 'logout', role: adminPage ? 'admin' : 'pelanggan' }); try { localStorage.setItem('sgm-logout-event', JSON.stringify({ role: adminPage ? 'admin' : 'pelanggan', nonce: crypto.randomUUID() })); } catch (_) {} }
    if (error) { message('Logout backend gagal. Cuba lagi untuk membatalkan cookie: ' + error.message); throw error; }
    // Reload drops the Firebase SDK's in-memory Firestore cache as well.
    location.reload();
  }
  async function loadTurnstile() {
    if (!siteKey) siteKey = (await api('config')).siteKey;
    if (!window.turnstile) {
      await new Promise((resolve, reject) => {
        window.sgmTurnstileReady = resolve;
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=sgmTurnstileReady';
        script.onerror = () => reject(new Error('Turnstile gagal dimuatkan.'));
        document.head.append(script);
      });
    }
  }
  async function googleLogin() {
    await ready; await initialize();
    const provider = new sdk.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
    return (await sdk.signInWithPopup(googleAuth, provider)).user;
  }
  async function challenge(user, action) {
    await loadTurnstile();
    if (widget !== undefined) window.turnstile.remove(widget);
    widget = window.turnstile.render(el('turnstile'), {
      sitekey: siteKey, action,
      callback: async captchaToken => {
        const version = generation;
        message(action === 'login' ? 'Mengesahkan akses…' : 'Memadam akaun…');
        try {
          const idToken = await user.getIdToken(true);
          const data = await api(action === 'login' ? 'login' : 'delete-account', { idToken, captchaToken });
          if (version !== generation) return;
          if (action === 'login') {
            await accept(data); loginFlow = false; await sdk.signOut(googleAuth);
          } else {
            lock(); await clearBrowser(); channel?.postMessage({ type: 'logout', role: 'pelanggan' });
            try { localStorage.setItem('sgm-logout-event', JSON.stringify({ role: 'pelanggan', nonce: crypto.randomUUID() })); } catch (_) {}
            message('Akaun dan tempahan anda telah dipadam.');
            location.reload();
          }
        } catch (error) {
          message(error.message); if (widget !== undefined) window.turnstile.reset(widget);
        }
      },
      'error-callback': () => { message('CAPTCHA gagal. Cuba lagi.'); },
      'expired-callback': () => { message('CAPTCHA tamat. Sila sahkan semula.'); }
    });
  }
  const ready = restore();
  window.sgmAuth = {
    ready,
    get current() { return current; },
    async require() { await ready; if (!current || !auth.currentUser) throw new Error('Login dan CAPTCHA diperlukan.'); return current; },
    async adminLogin(password) { await ready; const data = await api('admin-login', { password }); await accept(data); },
    logout,
    requestDeletion,
    refresh: restore
  };
  el('google')?.addEventListener('click', async () => {
    const button = el('google'); button.disabled = true; message('');
    try { await ready; loginFlow = true; const user = await googleLogin(); message('Login Google berjaya. Sila lengkapkan CAPTCHA.'); await challenge(user, 'login'); }
    catch (error) { loginFlow = false; message(error.message); }
    finally { button.disabled = false; }
  });
  document.getElementById('customer-logout')?.addEventListener('click', () => logout().catch(() => {}));
  function requestDeletion() {
    const english = document.documentElement.lang === 'en';
    if (!current || !confirm(english ? 'Permanently delete your account and ALL your bookings?' : 'Padam akaun dan SEMUA tempahan anda secara kekal?')) return;
    deleting = true;
    overlay.hidden = false; document.documentElement.classList.add('auth-locked');
    el('title').textContent = 'Padam akaun'; el('intro').hidden = false; el('intro').textContent = 'Sahkan akaun Google yang sama dan selesaikan CAPTCHA baharu. Tindakan ini tidak boleh dibatalkan.';
    el('google').hidden = true; el('delete').hidden = false; el('cancel').hidden = false; message('');
    if (english) {
      el('title').textContent = 'Delete account';
      el('intro').textContent = 'Verify the same Google account and complete a new CAPTCHA. This action cannot be undone.';
      el('delete').textContent = 'Verify Google to delete account';
      el('cancel').textContent = 'Cancel deletion';
    } else {
      el('delete').textContent = 'Sahkan Google untuk padam akaun';
      el('cancel').textContent = 'Batal pemadaman';
    }
  }
  document.getElementById('customer-delete')?.addEventListener('click', requestDeletion);
  el('delete')?.addEventListener('click', async () => {
    el('delete').disabled = true;
    try { const user = await googleLogin(); if (user.uid !== current?.uid) throw new Error('Pilih akaun Google yang sama.'); await challenge(user, 'delete_account'); }
    catch (e) { message(e.message); } finally { el('delete').disabled = false; }
  });
  el('cancel')?.addEventListener('click', () => {
    if (widget !== undefined) { window.turnstile.remove(widget); widget = undefined; }
    deleting = false; overlay.hidden = true; document.documentElement.classList.remove('auth-locked');
    sdk.signOut(googleAuth).catch(() => {});
  });
  function remoteLogout(data) {
    if (data?.type === 'logout' && data.role === (adminPage ? 'admin' : 'pelanggan')) { lock(); initialize().then(clearBrowser).catch(() => {}).finally(() => location.reload()); }
  }
  if (channel) channel.onmessage = event => remoteLogout(event.data);
  window.addEventListener('storage', event => { if (event.key === 'sgm-logout-event' && event.newValue) { try { remoteLogout({ type: 'logout', ...JSON.parse(event.newValue) }); } catch (_) {} } });
  setInterval(() => { if (current && !document.hidden && !deleting && !loginFlow) restore(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !deleting && !loginFlow) { retries = 0; ready.then(restore); } });
  // Network came back after the app was reopened offline/slow: re-check the saved session automatically.
  window.addEventListener('online', () => { if (!current && !deleting && !loginFlow) { retries = 0; restore(); } });
  retryButton()?.addEventListener('click', () => { retries = 0; message('Menyemak sesi selamat…'); restore(); });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      const pending = restoring || ready;
      lock();
      message('Menyemak sesi selamat…');
      // Wait for the invalidated attempt to finish before starting a fresh one.
      pending.then(restore);
    }
  });
})();
