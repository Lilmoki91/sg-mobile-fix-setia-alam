// profile.js
(function () {
  'use strict';
  const view = document.getElementById('profile-view');
  const menu = document.getElementById('profile-menu-action');
  if (!view || !menu) return;
  
  const labels = {
    ms: { title: 'Profil Saya', name: 'Nama', email: 'Email', id: 'ID SG Mobile Fix', phone: 'Nombor Telefon', noPhone: 'Tiada nombor', save: 'Simpan', saving: 'Menyimpan…', logout: 'Log Keluar', delete: 'Padam Akaun', back: 'Kembali ke Utama', retry: 'Cuba lagi', loading: 'Memuatkan profil…', saved: 'Nombor telefon berjaya dikemas kini', invalid: 'Masukkan nombor telefon yang sah (6–15 digit), atau kosongkan untuk membuangnya.', failed: 'Profil gagal dimuatkan. Sila cuba lagi.', saveFailed: 'Nombor telefon gagal disimpan. Sila cuba lagi.', login: 'Sila login untuk melihat profil.', warning: 'Pemadaman akaun adalah kekal dan memerlukan pengesahan Google serta CAPTCHA baharu.', edit: 'Edit', cancel: 'Batal' },
    en: { title: 'My Profile', name: 'Name', email: 'Email', id: 'SG Mobile Fix ID', phone: 'Phone Number', noPhone: 'No phone number', save: 'Save', saving: 'Saving…', logout: 'Log Out', delete: 'Delete Account', back: 'Back to Home', retry: 'Try again', loading: 'Loading profile…', saved: 'Phone number updated successfully', invalid: 'Enter a valid phone number (6–15 digits), or leave blank to remove it.', failed: 'Unable to load profile. Please try again.', saveFailed: 'Unable to save phone number. Please try again.', login: 'Please log in to view your profile.', warning: 'Account deletion is permanent and requires Google verification and a new CAPTCHA.', edit: 'Edit', cancel: 'Cancel' }
  };
  
  const el = id => document.getElementById('profile-' + id);
  const text = key => (labels[document.documentElement.lang] || labels.ms)[key];
  let statusKey = '', statusError = false, saving = false, loaded = false;
  let currentPhone = '';
  let auth, sdk, fns, unsubscribe, activeUid = null, version = 0;

  function renderPhone() {
    const display = document.getElementById('phone-display');
    if (display) display.textContent = currentPhone || text('noPhone');
  }

  function translate() {
    document.querySelectorAll('[data-profile-text]').forEach(node => { node.textContent = text(node.dataset.profileText); });
    renderPhone();
    if (el('status')) { el('status').textContent = text(statusKey) || ''; el('status').dataset.error = String(statusError); }
    if (saving && el('save')) el('save').textContent = text('saving');
  }
  
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  function status(key, error = false) { statusKey = key; statusError = error; translate(); }
  
  // Fungsi Toggle UI Edit/Simpan
  function togglePhoneMode(isEdit) {
    document.getElementById('phone-view-mode').style.display = isEdit ? 'none' : 'flex';
    document.getElementById('profile-phone-form').style.display = isEdit ? 'flex' : 'none';
    if (isEdit) el('phone').focus();
  }

  function renderIdentity(user, profile) {
    el('name').textContent = user?.displayName || profile?.nama || '—';
    el('email').textContent = user?.email || profile?.email || '—';
    const photo = el('photo');
    const url = user?.photoURL || profile?.photoURL || '';
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
    
    if (!force && user?.uid === activeUid && session?.uid === activeUid) return;
    
    const mine = ++version;
    unsubscribe?.(); unsubscribe = null; activeUid = null;
    
    currentPhone = '';
    renderPhone();
    el('phone').value = '';
    el('id').textContent = '—';
    renderIdentity(null, null); el('retry').hidden = true;
    togglePhoneMode(false); // Pastikan mula dengan mod view
    
    if (!user || session?.uid !== user.uid || session.role !== 'pelanggan') { 
        status('login'); 
        return; 
    }
    
    activeUid = user.uid;
    renderIdentity(user, session.profile);
    status('loading');

    unsubscribe = fns.onSnapshot(fns.doc(window.db, 'users', user.uid), snapshot => {
      if (mine !== version) return;
      if (!snapshot.exists()) { status('failed', true); el('retry').hidden = false; return; }
      
      const data = snapshot.data();
      el('id').textContent = data.sgmfId || '—';
      
      currentPhone = data.phoneNumber ?? data.no_telefon ?? '';

      // Kemas kini paparan teks mengikut bahasa semasa
      renderPhone();
      
      // Masukkan ke dalam input (tapi jangan kacau kalau tengah taip)
      if (!saving && document.activeElement !== el('phone')) {
        el('phone').value = currentPhone;
      }
      
      renderIdentity(auth.currentUser, data);
      if (statusKey === 'loading' || statusKey === 'failed') status('');
      
    }, () => {
      if (mine !== version) return;
      status('failed', true); el('retry').hidden = false;
    });
  }

  const layoutReady = fetch('profile.html').then(response => {
    if (!response.ok) throw new Error('Profile layout unavailable');
    return response.text();
  }).then(html => {
    view.innerHTML = html;
    loaded = true;

    // --- EVENT LISTENERS ---
    document.getElementById('btn-edit-phone').addEventListener('click', () => {
        status(''); 
        togglePhoneMode(true);
    });

    document.getElementById('btn-cancel-phone').addEventListener('click', () => {
        el('phone').value = currentPhone;
        status('');
        togglePhoneMode(false);
    });

    document.getElementById('customer-logout').addEventListener('click', () => window.sgmAuth.logout().catch(() => {}));
    document.getElementById('customer-delete').addEventListener('click', () => window.sgmAuth.requestDeletion());
    el('retry').addEventListener('click', () => connect(true));

    el('phone-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (saving) return;
      
      const phone = el('phone').value.trim();
      const digits = phone.replace(/\D/g, '');
      
      if (phone && (!/^\+?[0-9 ()-]{6,30}$/.test(phone) || digits.length < 6 || digits.length > 15)) { 
          status('invalid', true); 
          el('phone').focus(); 
          return; 
      }
      
      const mine = version, uid = activeUid;
      saving = true; 
      el('save').disabled = true;
      status('saving');
      
      try {
        const session = await window.sgmAuth.require();
        if (session.uid !== uid || mine !== version) return;
        
        await fns.updateDoc(fns.doc(window.db, 'users', uid), { 
            phoneNumber: phone, 
            no_telefon: phone 
        });
        
        if (mine === version) { 
            // Kemas kini UI mengikut bahasa semasa
            currentPhone = phone;
            renderPhone();
            status('saved'); 
            togglePhoneMode(false); // TUTUP MOD EDIT
        }
      } catch (e) { 
          console.error("Save error:", e);
          if (mine === version) status('saveFailed', true); 
      } finally { 
          saving = false; 
          el('save').disabled = false;
          translate(); 
      }
    });

    translate();
  }).catch(() => {
    view.textContent = text('failed');
  });

  menu.addEventListener('click', async event => {
    event.preventDefault(); window.closeMenu?.();
    window.showTab('profile-view');
    await layoutReady;
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
