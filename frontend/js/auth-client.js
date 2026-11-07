// All Firebase credentials stay in memory. The durable session is an HttpOnly cookie.
(function () {
  'use strict';
  const adminPage = !!document.getElementById('admin-dashboard');
  let current = null, sdk, auth, googleAuth, widget, siteKey, timer, deleting = false, loginFlow = false;
  let generation = 0, deletionPending = false, deletionRunning = false, loggingOut = false, logoutTask = null;
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('sgm-auth-events') : null;
  const overlay = document.getElementById('auth-overlay');
  const el = id => document.getElementById('auth-' + id);
  const message = value => { if (el('message')) el('message').textContent = value; };
  // Reject if a promise takes too long, so the UI never stays on "Menyemak sesi selamat…" forever.
  const withTimeout = (promise, ms, text) => {
    let timeout;
    return Promise.race([promise, new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error(text)), ms);
    })]).finally(() => clearTimeout(timeout));
  };
  async function api(path, data) {
    const controller = new AbortController();
    const timeout = path.includes('logout') ? 10000 : path.startsWith('delete-account') ? 150000 : 30000;
    const abortTimer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch('/api/auth/' + path, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal, ...(data !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
      let result;
      try { result = await response.json(); }
      catch (e) {
        if (e.name === 'AbortError') throw e;
        throw new Error('Respons API tidak sah. Semak deployment Pages Functions dan log Cloudflare.');
      }
      if (!response.ok) {
        const e = new Error(result.error || 'Sesi tamat. Sila login semula.');
        e.status = response.status; e.deletionPending = result.deletionPending === true;
        e.deletionCompleted = result.deletionCompleted === true; throw e;
      }
      return result;
    } catch (e) {
      if (e.name === 'AbortError' || e instanceof TypeError) {
        const error = new Error(e.name === 'AbortError' ? 'Pelayan belum membalas. Status operasi belum dapat dipastikan; cuba lagi.' : 'Tiada sambungan ke pelayan. Semak internet anda.');
        error.retryable = true; throw error;
      }
      throw e;
    } finally { clearTimeout(abortTimer); }
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
    deleting = false; loginFlow = false; deletionPending = false;
    if (el('delete')) { el('delete').disabled = false; el('delete').textContent = 'Sahkan Google untuk padam akaun'; }
    if (el('cancel')) el('cancel').textContent = 'Batal pemadaman';
    if (el('google')) el('google').disabled = false;
    el('logout-retry')?.remove();
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
    if (deleting || loginFlow || loggingOut) return Promise.resolve(current);
    if (restoring) return restoring;
    const version = generation;
    restoring = (async () => {
      try {
        const data = await api(adminPage ? 'admin-session' : 'session');
        if (version === generation) await accept(data);
      } catch (error) {
        if (version === generation) {
          lock(); if (auth) sdk.signOut(auth).catch(() => {});
          message(error.deletionCompleted ? 'Akaun dan tempahan anda telah dipadam. Sila login untuk meneruskan.' : error.status === 401 ? 'Sila login untuk meneruskan.' : error.message);
          if (error.deletionPending) { deletionPending = true; showDeletionRetry(); }
        }
      }
      return current;
    })().finally(() => { restoring = null; });
    return restoring;
  }
  async function clearBrowser(clearCaches = true) {
    window.closeMenu?.();
    try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}
    const cleanup = async () => {
      const tasks = [];
      if (clearCaches && 'caches' in window) tasks.push(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
      if (sdk && auth) tasks.push(sdk.signOut(auth));
      if (sdk && googleAuth) tasks.push(sdk.signOut(googleAuth));
      await Promise.allSettled(tasks);
    };
    // A stalled browser cache/SDK must not prevent returning to the login screen.
    try { await withTimeout(cleanup(), 5000, 'Pembersihan pelayar mengambil masa terlalu lama.'); } catch (_) {}
  }
  function logout(broadcast = true) {
    if (logoutTask) return logoutTask;
    loggingOut = true;
    logoutTask = (async () => {
      lock();
      if (!adminPage) el('google').hidden = true;
      message('Sedang logout…');
      // Sign out Firebase immediately, without cache eviction competing with the request.
      const cleanup = clearBrowser(false);
      const path = adminPage ? 'admin-logout' : 'logout';
      let error;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const result = await api(path, {});
          if (result.success !== true) throw new Error('Respons logout tidak sah. Semak deployment Pages Functions.');
          error = null; break;
        } catch (e) {
          error = e;
          if (!e.retryable) break;
          message('Menyemak sama ada cookie logout telah dipadam…');
          try {
            // A lost POST response can still have expired the cookie. Never infer this from a timeout alone.
            const status = await api(path + '-status');
            if (status.cookieCleared === true && status.role === (adminPage ? 'admin' : 'pelanggan')) {
              error = null; break;
            }
          } catch (_) { /* Keep the original error; an unavailable status endpoint is not proof of logout. */ }
        }
      }
      await cleanup;
      if (error) {
        message('Paparan telah dikunci, tetapi logout pelayan belum disahkan. Cuba logout semula. ' + error.message);
        if (el('message')) {
          const retry = document.createElement('button');
          retry.id = 'auth-logout-retry'; retry.type = 'button'; retry.textContent = 'Cuba logout semula';
          retry.addEventListener('click', () => logout(broadcast).catch(() => {}));
          el('message').after(retry);
        }
        // Do not restore the still-possibly-valid cookie or reload other tabs as logged in.
        throw error;
      }
      if (broadcast) { channel?.postMessage({ type: 'logout', role: adminPage ? 'admin' : 'pelanggan' }); try { localStorage.setItem('sgm-logout-event', JSON.stringify({ role: adminPage ? 'admin' : 'pelanggan', nonce: crypto.randomUUID() })); } catch (_) {} }
      // Reload drops the Firebase SDK's in-memory Firestore cache as well.
      location.reload();
    })().finally(() => { logoutTask = null; });
    return logoutTask;
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
  function showDeletionRetry() {
    deleting = true;
    overlay.hidden = false; document.documentElement.classList.add('auth-locked');
    el('title').textContent = 'Pemadaman akaun';
    el('intro').hidden = false;
    el('intro').textContent = 'Pemadaman diproses secara berperingkat. Jika sambungan terputus, sambung semula tanpa mengulang CAPTCHA.';
    el('google').hidden = true; el('cancel').hidden = true; el('delete').hidden = false;
    el('delete').textContent = 'Sambung pemadaman';
  }
  async function finishDeletion() {
    if (deletionRunning) return;
    deletionRunning = true; el('delete').disabled = true;
    try {
      const deadline = Date.now() + 5 * 60000;
      let failures = 0;
      while (Date.now() < deadline) {
        message('Memadam akaun dan tempahan… Jangan tutup halaman ini.');
        let data;
        try { data = await api('delete-account-continue', {}); failures = 0; }
        catch (e) {
          if (e.retryable && ++failures < 3) { await new Promise(resolve => setTimeout(resolve, 1500)); continue; }
          throw e;
        }
        if (data.success) {
          deletionPending = false;
          lock(); await clearBrowser(); channel?.postMessage({ type: 'logout', role: 'pelanggan' });
          try { localStorage.setItem('sgm-logout-event', JSON.stringify({ role: 'pelanggan', nonce: crypto.randomUUID() })); } catch (_) {}
          message('Akaun dan tempahan anda telah dipadam.');
          location.reload(); return;
        }
        if (!data.pending) throw new Error('Status pemadaman tidak sah. Hubungi admin.');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      throw new Error('Pemadaman belum selesai. Tekan Sambung pemadaman untuk meneruskan.');
    } catch (e) {
      if (e.status === 401) {
        // An expired/missing deletion credential cannot be resumed. This is not proof of deletion.
        lock();
        await clearBrowser();
        message('Sesi pemadaman tamat. Sila login semula. Pemadaman belum dapat disahkan; hubungi admin jika akaun tidak boleh diakses.');
        return;
      }
      showDeletionRetry(); message(e.message);
      if (e.status === 409) {
        deletionPending = false;
        el('delete').textContent = 'Sahkan Google untuk padam akaun';
        el('cancel').hidden = false;
      }
    } finally { deletionRunning = false; el('delete').disabled = false; }
  }
  async function challenge(user, action) {
    await loadTurnstile();
    if (widget !== undefined) window.turnstile.remove(widget);
    widget = window.turnstile.render(el('turnstile'), {
      sitekey: siteKey, action,
      callback: async captchaToken => {
        if (action !== 'login' && deletionPending) return;
        const version = generation;
        message(action === 'login' ? 'Mengesahkan akses…' : 'Memadam akaun…');
        try {
          const idToken = await user.getIdToken(true);
          if (action !== 'login') {
            deletionPending = true; showDeletionRetry(); el('delete').disabled = true;
          }
          const data = await api(action === 'login' ? 'login' : 'delete-account', { idToken, captchaToken });
          if (version !== generation) return;
          if (action === 'login') {
            await accept(data); loginFlow = false; await sdk.signOut(googleAuth);
          } else {
            if (widget !== undefined) { window.turnstile.remove(widget); widget = undefined; }
            await finishDeletion();
          }
        } catch (error) {
          message(error.message);
          if (action !== 'login' && deletionPending) {
            el('delete').disabled = false;
            if (error.retryable || error.status >= 500) {
              // The tombstone may have committed even if its response was lost.
              showDeletionRetry();
              message(error.message + ' Tekan Sambung pemadaman untuk menyemak status.');
            } else {
              deletionPending = false;
              el('delete').textContent = 'Sahkan Google untuk padam akaun'; el('cancel').hidden = false;
            }
          }
          if (!deletionPending && widget !== undefined) window.turnstile.reset(widget);
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
    if (loggingOut) { await logout().catch(() => {}); return; }
    const button = el('google'); button.disabled = true; message('');
    try { await ready; loginFlow = true; const user = await googleLogin(); message('Login Google berjaya. Sila lengkapkan CAPTCHA.'); await challenge(user, 'login'); }
    catch (error) { loginFlow = false; message(error.message); }
    finally { button.disabled = false; }
  });
  document.getElementById('customer-logout')?.addEventListener('click', () => logout().catch(() => {}));
  function requestDeletion() {
    const english = document.documentElement.lang === 'en';
    if (!current || !confirm(english ? 'Permanently delete your account and ALL your bookings?' : 'Padam akaun dan SEMUA tempahan anda secara kekal?')) return;
    generation++;
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
    if (deletionPending) { await finishDeletion(); return; }
    el('delete').disabled = true;
    try { const user = await googleLogin(); if (current && user.uid !== current.uid) throw new Error('Pilih akaun Google yang sama.'); await challenge(user, 'delete_account'); }
    catch (e) { message(e.message); } finally { el('delete').disabled = false; }
  });
  el('cancel')?.addEventListener('click', () => {
    if (widget !== undefined) { window.turnstile.remove(widget); widget = undefined; }
    deleting = false;
    if (current) { overlay.hidden = true; document.documentElement.classList.remove('auth-locked'); }
    else { lock(); restore(); }
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
