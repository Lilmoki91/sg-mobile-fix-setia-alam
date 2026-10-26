// Firebase v10 Modular; UI kekal terkunci sehingga sesi disahkan.
(async function () {
  'use strict';
  const overlay = document.getElementById('login-overlay');
  const main = document.getElementById('main-content');
  const button = document.getElementById('google-login-btn');
  const spinner = document.getElementById('login-spinner');
  const status = document.getElementById('login-status');
  const errorBox = document.getElementById('login-error');
  const profile = document.getElementById('user-profile-container');
  let stopBookings = null;
  let generation = 0;
  window.currentUser = null;

  function showError(error) {
    const messages = {
      'auth/popup-closed-by-user': 'Log masuk dibatalkan. Sila cuba lagi.',
      'auth/popup-blocked': 'Pelayar menyekat popup. Benarkan popup untuk log masuk.',
      'auth/unauthorized-domain': 'Domain ini belum dibenarkan dalam Firebase Authentication.',
      'auth/operation-not-allowed': 'Aktifkan penyedia Google dalam Firebase Authentication.',
      'auth/network-request-failed': 'Sambungan gagal. Semak internet dan cuba lagi.'
    };
    errorBox.textContent = messages[error.code] || `Gagal: ${error.message || 'Ralat tidak diketahui.'}`;
    errorBox.classList.remove('hidden');
  }

  function clearBookings() {
    generation++;
    stopBookings?.();
    stopBookings = null;
    window.cachedBookings = [];
    window.cachedBookingsReady = false;
    window.renderUserBookings?.([]);
    document.getElementById('user-bookings-list')?.replaceChildren();
  }

  window.loadUserBookings = async function (uid) {
    clearBookings();
    const token = generation;
    const list = document.getElementById('user-bookings-list');
    list.textContent = 'Memuatkan tempahan...';
    try {
      const fns = await window.ensureFirestoreFns();
      if (token !== generation || window.currentUser?.uid !== uid) return;
      const q = fns.query(fns.collection(window.db, 'bookings'), fns.where('uid', '==', uid));
      stopBookings = fns.onSnapshot(q, snapshot => {
        if (token !== generation || window.currentUser?.uid !== uid) return;
        const bookings = snapshot.docs.map(item => ({
          ...item.data(), id: item.id, code: item.data().code || item.id,
          status: item.data().status || 'pending'
        })).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        window.cachedBookings = bookings;
        window.cachedBookingsReady = true;
        window.renderUserBookings?.(bookings);
      }, error => {
        if (token !== generation) return;
        window.cachedBookings = [];
        list.textContent = `Gagal memuatkan tempahan: ${error.message}`;
        list.setAttribute('role', 'alert');
      });
    } catch (error) {
      if (token === generation) list.textContent = `Gagal memuatkan tempahan: ${error.message}`;
    }
  };

  try {
    const [authFns] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
      window.firebaseReady
    ]);
    const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } = authFns;
    const auth = getAuth(window.firebaseApp);
    window.firebaseAuth = auth;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    function renderProfile(user) {
      profile.replaceChildren();
      const row = document.createElement('div');
      row.className = 'user-profile-row';
      const avatar = document.createElement('img');
      avatar.alt = 'Avatar pengguna';
      avatar.referrerPolicy = 'no-referrer';
      if (user.photoURL && new URL(user.photoURL).protocol === 'https:') avatar.src = user.photoURL;
      else avatar.hidden = true;
      avatar.onerror = () => { avatar.hidden = true; };
      const name = document.createElement('span');
      name.textContent = user.displayName || 'Pengguna Google';
      row.append(avatar, name);
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.textContent = 'Log Keluar';
      logout.addEventListener('click', async () => {
        logout.disabled = true;
        logout.textContent = 'Log keluar...';
        try { await signOut(auth); }
        catch (error) {
          logout.disabled = false;
          logout.textContent = 'Log Keluar';
          const notice = document.createElement('p');
          notice.textContent = `Gagal log keluar: ${error.message}`;
          notice.setAttribute('role', 'alert');
          profile.appendChild(notice);
        }
      });
      profile.append(row, logout);
    }

    onAuthStateChanged(auth, user => {
      clearBookings();
      window.currentUser = user;
      main.hidden = !user;
      main.inert = !user;
      main.classList.toggle('hidden', !user);
      overlay.classList.toggle('hidden', !!user);
      document.body.classList.toggle('auth-locked', !user);
      status.textContent = '';
      button.disabled = false;
      if (user) {
        errorBox.classList.add('hidden');
        renderProfile(user);
        window.loadUserBookings(user.uid);
        window.dispatchEvent(new Event('resize'));
      } else {
        profile.replaceChildren();
        window.closeMenu?.();
        document.getElementById('booking-form')?.reset();
        document.body.classList.remove('overflow-hidden', 'chatbot-open');
        window.speechSynthesis?.cancel();
        document.querySelector('.share-toast')?.remove();
        button.focus();
      }
    }, showError);

    button.addEventListener('click', async () => {
      button.disabled = true;
      spinner.classList.remove('hidden');
      errorBox.classList.add('hidden');
      status.textContent = 'Sedang log masuk...';
      try { await signInWithPopup(auth, provider); }
      catch (error) { showError(error); }
      finally {
        button.disabled = false;
        spinner.classList.add('hidden');
        status.textContent = '';
      }
    });
  } catch (error) {
    status.textContent = 'Firebase tidak dapat dimuatkan. Muat semula halaman selepas semak sambungan.';
    showError(error);
  }
})();
