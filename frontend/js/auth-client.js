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
  // Reject if a promise takes too long, so the UI never stays on "Menyemak sesi selamat…" forever.
  const withTimeout = (promise, ms, text) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(text)), ms))]);
  async function api(path, data) {
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch('/api/auth/' + path, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal, ...(data !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
    } catch (e) {
      throw new Error(e.name === 'AbortError' ? 'Pelayan tidak membalas. Semak sambungan internet dan cuba lagi.' : 'Tiada sambungan ke pelayan. Semak internet anda.');
    } finally { clearTimeout(abortTimer); }
    let result;
    try { result = await response.json(); } catch { throw new Error('Pages Functions belum tersedia. Sistem ini memerlukan deployment Cloudflare dan konfigurasi Firebase/Turnstile.'); }
    if (!response.ok) { const e = new Error(result.error || 'Sesi tamat. Sila login semula.'); e.status = response.status; throw e; }
    return result;
  }
  async function initialize() {
    await window.firebaseReady;
    const apps = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    sdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    auth = sdk.getAuth(apps.getApp());
    googleAuth = sdk.getAuth(apps.initializeApp(window.firebaseConfig, 'google-login'));
    await Promise.all([sdk.setPersistence(auth, sdk.inMemoryPersistence), sdk.setPersistence(googleAuth, sdk.inMemoryPersistence)]);
  }
  function notify() { document.dispatchEvent(new CustomEvent('sgm-auth-changed', { detail: current })); }
  function lock() {
    current = null; generation++; clearTimeout(timer);
    if (!adminPage) {
      document.documentElement.classList.add('auth-locked');
      overlay.hidden = false;
      el('delete').hidden = true; el('cancel').hidden = true; el('google').hidden = false;
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
  async function accept(data) {
    const version = ++generation;
    await sdk.signInWithCustomToken(auth, data.customToken);
    if (version !== generation) { await sdk.signOut(auth); return; }
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
  let restoring = null;
  function restore() {
    if (restoring) return restoring;
    const version = generation;
    restoring = (async () => {
      try {
        const data = await api(adminPage ? 'admin-session' : 'session');
        if (version === generation) await accept(data);
      } catch (error) {
        if (version === generation) {
          lock(); if (auth) await sdk.signOut(auth);
          message(error.status === 401 ? 'Sila login untuk meneruskan.' : error.message);
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
    await ready;
    if (!sdk || !googleAuth) throw new Error('Sistem login belum sedia. Muat semula halaman dan cuba lagi.');
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
  const initialized = withTimeout(initialize(), 15000, 'Firebase gagal dimuatkan (sambungan lambat atau disekat). Muat semula halaman.');
  const ready = initialized.then(restore).catch(error => { lock(); message(error.message); return null; });
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
    if (data?.type === 'logout' && data.role === (adminPage ? 'admin' : 'pelanggan')) { lock(); initialized.then(clearBrowser).finally(() => location.reload()).catch(() => {}); }
  }
  if (channel) channel.onmessage = event => remoteLogout(event.data);
  window.addEventListener('storage', event => { if (event.key === 'sgm-logout-event' && event.newValue) { try { remoteLogout({ type: 'logout', ...JSON.parse(event.newValue) }); } catch (_) {} } });
  setInterval(() => { if (current && !document.hidden && !deleting && !loginFlow) restore(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !deleting && !loginFlow) ready.then(restore); });
  window.addEventListener('pageshow', event => { if (event.persisted) { lock(); ready.then(restore); } });
})();
