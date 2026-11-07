(function () {
  'use strict';
  const view = document.getElementById('profile-view');
  const menu = document.getElementById('profile-menu-action');
  if (!view || !menu) return;
  const labels = {
    ms: { title: 'Profil Saya', name: 'Nama', email: 'Email', id: 'ID SG Mobile Fix', phone: 'Nombor Telefon', save: 'Simpan', saving: 'Menyimpan…', logout: 'Log Keluar', delete: 'Padam Akaun', back: 'Kembali ke Utama', retry: 'Cuba lagi', loading: 'Memuatkan profil…', saved: 'Nombor telefon berjaya dikemas kini', invalid: 'Masukkan nombor telefon yang sah (6–15 digit), atau kosongkan untuk membuangnya.', failed: 'Profil gagal dimuatkan. Sila cuba lagi.', saveFailed: 'Nombor telefon gagal disimpan. Sila cuba lagi.', login: 'Sila login untuk melihat profil.', warning: 'Pemadaman akaun adalah kekal dan memerlukan pengesahan Google serta CAPTCHA baharu.' },
    en: { title: 'My Profile', name: 'Name', email: 'Email', id: 'SG Mobile Fix ID', phone: 'Phone Number', save: 'Save', saving: 'Saving…', logout: 'Log Out', delete: 'Delete Account', back: 'Back to Home', retry: 'Try again', loading: 'Loading profile…', saved: 'Phone number updated successfully', invalid: 'Enter a valid phone number (6–15 digits), or leave blank to remove it.', failed: 'Unable to load profile. Please try again.', saveFailed: 'Unable to save phone number. Please try again.', login: 'Please log in to view your profile.', warning: 'Account deletion is permanent and requires Google verification and a new CAPTCHA.' }
  };
  const el = id => document.getElementById('profile-' + id);
  const text = key => (labels[document.documentElement.lang] || labels.ms)[key];
  let statusKey = '', statusError = false, saving = false, loaded = false;
  let auth, sdk, fns, unsubscribe, activeUid = null, version = 0;
  function translate() {
    document.querySelectorAll('[data-profile-text]').forEach(node => { node.textContent = text(node.dataset.profileText); });
    el('back')?.setAttribute('aria-label', text('back'));
    if (el('status')) { el('status').textContent = text(statusKey) || ''; el('status').dataset.error = String(statusError); }
    if (saving && el('save')) el('save').textContent = text('saving');
  }
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  function status(key, error = false) { statusKey = key; statusError = error; translate(); }
  function editable(ready) {
    if (el('phone')) el('phone').disabled = !ready || saving;
    if (el('save')) el('save').disabled = !ready || saving;
  }
  function renderIdentity(user, profile) {
    el('name').textContent = user?.displayName || profile?.nama || '—';
    el('email').textContent = user?.email || profile?.email || '—';
    const photo = el('photo');
    const url = user?.photoURL || profile?.photoURL || '';
    // Only load HTTPS profile images, never inject identity data as HTML.
    if (url.startsWith('https://')) {
      photo.hidden = false; el('avatar-fallback').hidden = true;
      if (photo.getAttribute('src') !== url) photo.src = url;
    } else {
      photo.hidden = true; photo.removeAttribute('src'); el('avatar-fallback').hidden = false;
    }
  }
  function connect(force = false) {
    if (!loaded || !auth) return;
    const user = auth.currentUser;
    const session = window.sgmAuth.current;
    if (!force && user?.uid === activeUid && session?.uid === activeUid) {
      renderIdentity(user, session.profile); return;
    }
    const mine = ++version;
    unsubscribe?.(); unsubscribe = null; activeUid = null;
    editable(false); el('phone').value = ''; el('id').textContent = '—';
    renderIdentity(null, null); el('retry').hidden = true;
    if (!user || session?.uid !== user.uid || session.role !== 'pelanggan') { status('login'); return; }
    activeUid = user.uid;
    renderIdentity(user, session.profile);
    status('loading');
    // Profile creation and ID allocation are server-only to preserve Dual Action Security.
    unsubscribe = fns.onSnapshot(fns.doc(window.db, 'users', user.uid), snapshot => {
      if (mine !== version) return;
      if (!snapshot.exists()) { status('failed', true); editable(false); el('retry').hidden = false; return; }
      const data = snapshot.data();
      el('id').textContent = data.sgmfId || '—';
      if (!saving && document.activeElement !== el('phone')) el('phone').value = data.phoneNumber ?? data.no_telefon ?? '';
      renderIdentity(auth.currentUser, data);
      editable(true);
      if (statusKey === 'loading' || statusKey === 'failed') status('');
    }, () => {
      if (mine !== version) return;
      editable(false); status('failed', true); el('retry').hidden = false;
    });
  }
  const layoutReady = fetch('profile.html').then(response => {
    if (!response.ok) throw new Error('Profile layout unavailable');
    return response.text();
  }).then(html => {
    view.innerHTML = html;
    loaded = true;
    el('photo').addEventListener('error', () => { el('photo').hidden = true; el('avatar-fallback').hidden = false; });
    el('back').addEventListener('click', () => {
      window.showTab('home-tab');
      document.querySelectorAll('.mobile-bottom-nav a').forEach(link => link.classList.toggle('active', link.dataset.nav === 'home-tab'));
      menu.focus();
    });
    // Reuse the existing cookie revocation and Google + CAPTCHA deletion flow.
    document.getElementById('customer-logout').addEventListener('click', () => window.sgmAuth.logout().catch(() => {}));
    document.getElementById('customer-delete').addEventListener('click', () => window.sgmAuth.requestDeletion());
    el('retry').addEventListener('click', () => connect(true));
    el('phone-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (saving || el('save').disabled) return;
      const phone = el('phone').value.trim();
      const digits = phone.replace(/\D/g, '');
      if (phone && (!/^\+?[0-9 ()-]{6,30}$/.test(phone) || digits.length < 6 || digits.length > 15)) { status('invalid', true); el('phone').focus(); return; }
      const mine = version, uid = activeUid;
      saving = true; editable(false); status('saving');
      try {
        const session = await window.sgmAuth.require();
        if (session.uid !== uid || mine !== version) return;
        await fns.updateDoc(fns.doc(window.db, 'users', uid), { phoneNumber: phone, no_telefon: phone });
        if (mine === version) { el('phone').value = phone; status('saved'); }
      } catch (_) { if (mine === version) status('saveFailed', true); }
      finally { saving = false; editable(!!activeUid); translate(); }
    });
    translate();
  }).catch(() => {
    view.textContent = text('failed');
    const back = document.createElement('button');
    back.className = 'profile-back'; back.textContent = text('back');
    back.addEventListener('click', () => window.showTab('home-tab'));
    view.appendChild(back);
  });
  menu.addEventListener('click', async event => {
    event.preventDefault(); window.closeMenu?.();
    window.showTab('profile-view');
    document.querySelectorAll('.mobile-bottom-nav a').forEach(link => link.classList.remove('active'));
    await layoutReady;
    if (view.classList.contains('active')) el('title')?.focus();
  });
  document.addEventListener('sgm-auth-changed', () => connect());
  (async () => {
    await layoutReady;
    await window.sgmAuth.ready;
    await window.firebaseReady;
    sdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const apps = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    auth = sdk.getAuth(apps.getApp());
    fns = window.firestoreFns;
    sdk.onAuthStateChanged(auth, () => connect());
    connect();
  })().catch(() => status('failed', true));
})();
