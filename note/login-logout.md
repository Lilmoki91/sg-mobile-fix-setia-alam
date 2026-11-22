## ARAHAN SISTEM (LOGIN + SIGNUP + CAPTCHA + KESELAMATAN)

### 1. ALIRAN LOGIN & CAPTCHA (Pintu Masuk)
- Pengguna wajib Login Gmail (Firebase Auth) untuk masuk.
- SELEPAS Login Gmail berjaya, wajib selesaikan Cloudflare Turnstile (CAPTCHA).
- Backend (Cloudflare pages function) MESTI sahkan token Turnstile menggunakan Secret Key (API Siteverify). Jangan letak Secret Key di frontend.
- Jika CAPTCHA gagal, tolak akses.
- Interface overlay login profesional menarik tutup laman utama webapps sebelum akses masuk.

### 2. PENDAFTARAN OTOMATIK (Sign Up / Onboarding)
- Tiada borang "Daftar" berasingan. Konsep "Daftar" dan "Login" adalah satu.
- SELEPAS pengguna lulus CAPTCHA, backend mesti semak sama ada UID pengguna itu sudah wujud dalam koleksi `users` di Firestore.
- Jika BELUM WUJUD (Pengguna Baru): Cipta dokumen baru secara automatik dalam koleksi `users` dengan medan berikut:
  - `uid` (ID dari Firebase Auth)
  - `email`
  - `nama` (Ambil dari profil Google)
  - `no_telefon` (Biarkan kosong dahulu, minta pelanggan isi kemudian jika perlu)
  - `peranan` (Set sebagai "pelanggan")
  - `tarikh_daftar` (Gunakan timestamp server)
- Jika SUDAH WUJUD (Pengguna Lama): Teruskan akses dan paparkan data sedia ada.

### 3. SESI SELAMAT (24 Jam Mutlak)
- Sesi tamat tepat 24 jam selepas login (guna masa server, bukan masa browser).
- Guna Cookies HttpOnly, Secure, SameSite. JANGAN simpan token dalam localStorage.
- Lindungi daripada serangan CSRF (semak Origin).
- Jika sesi tamat, tendang pengguna keluar ke halaman login.

### 4. DATA BOOKING & ADMIN (Asingkan Kuasa)
- Guna UID (bukan email) sebagai kunci pemilik data (ownerUid).
- Pelanggan biasa HANYA BOLEH baca/tulis data booking yang ada ownerUid mereka sendiri. (Kuatkuasakan guna Firestore Rules).
- Admin mesti guna sistem login berasingan (password). Pelanggan biasa tak boleh akses Admin Panel.

### 5. LOGOUT & PADAM AKAUN
- Logout: Kosongkan session, padam cache browser, sign out Firebase, dan padam cookie backend. Segerakkan logout di semua tab.
- Padam Akaun (Penting): Wajib minta pengesahan CAPTCHA (Turnstile) sekali lagi sebelum benarkan pengguna padam akaun. Ini halang bot jahat padam data sesuka hati.

### 6. UJIAN KESELAMATAN
- Pastikan pelanggan A tak boleh nampak data pelanggan B.
- Pastikan orang yang tak login tak boleh tembus masuk dengan taip URL terus.
- Pastikan jika CAPTCHA tak sah, akses ditolak walaupun dah login Gmail.
- Uji pengguna baru: Pastikan selepas Login Gmail + CAPTCHA, satu dokumen baru tercipta dalam koleksi `users` di Firestore.

### 7. UJIAN PEMULIHAN SESI WEBAPP
- Login, tutup webapp tanpa logout, kemudian buka semula sebelum 24 jam dari waktu login. Jika cookie masih sah dan rangkaian tersedia, laman utama perlu dibuka tanpa login/CAPTCHA baharu.
- Simulasikan kegagalan atau timeout Firebase ketika pemulihan sesi. Paparan mesti menunjukkan ralat dan butang “Cuba semula sambungan”, bukan kekal pada “Menyemak sesi selamat…”.
- Sambungkan semula rangkaian dan cuba semula; sesi mesti disahkan oleh backend sebelum laman dibuka.
- Uji kembali melalui Back/Forward ketika semakan sesi sedang berlangsung. Percubaan lama mesti selesai tanpa membuka laman, kemudian semakan baharu dilakukan.
- **Uji sesi tamat atau dibatalkan**: respons 401/403 mesti kekal mengunci akses. Pemulihan tidak memanjangkan had 24 jam.
- **Pembetulan klien**: pemulihan menggunakan ID percubaan yang sama hingga sign-in Firebase selesai supaya ralatnya tidak diabaikan; cache service worker dinaikkan ke V14.
