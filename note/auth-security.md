# Login, CAPTCHA dan sesi pelanggan/admin

## Pelaksanaan

- `auth-client.js` dan `auth.css`: overlay sebelum akses, Google popup, Turnstile selepas Google, profil pelanggan, logout dan pengesahan semula sebelum pemadaman akaun.
- `functions/api/auth/[[path]].js` + `lib/auth-server.js`: sahkan tandatangan JWT Google (issuer, audience, expiry, provider dan akaun aktif), Siteverify Turnstile (action + hostname), onboarding dan sesi.
- Cookie pelanggan `__Host-sgm_session` dan admin `__Host-sgm_admin`: raw random 256-bit, HttpOnly, Secure, SameSite=Strict, Path=/, `Max-Age` + `Expires` 24 jam mutlak. Cookie kekal apabila browser/PWA ditutup tanpa logout dan dibuka semula dalam tempoh yang sah; logout tetap memadamkannya serta-merta. Database hanya menyimpan hash cookie sebagai ID sesi, bukan raw cookie.
- Dokumen `authSessions/{hash}` mempunyai UID, peranan, masa ciptaan, expiry dan revoked. Ia hanya boleh dicipta/dipadam oleh backend.
- Backend mengeluarkan Firebase custom token dengan claims `sid` dan `role`. Firebase SDK menggunakan **inMemoryPersistence**, bukan localStorage/sessionStorage/IndexedDB. Login Google menggunakan Firebase app berasingan; ID token Google sahaja tidak memberikan akses booking.
- `firestore.rules` menyemak rekod sesi pada **setiap permintaan** menggunakan `request.time`. Refresh token Firebase tidak memanjangkan expiry rekod sesi. Memadam sesi membatalkan kuasa SDK serta-merta untuk permintaan baharu.
- Booking pelanggan mesti ditapis `ownerUid == UID`; carian chatbot turut ditapis UID. Tiada bacaan semua pelanggan oleh pelanggan biasa.
- Admin menggunakan password utama backend, bukan Google pelanggan atau flag browser. Galeri, telefon dan waktu operasi kini turut memerlukan sesi admin utama. Login Worker/token sessionStorage lama tidak lagi digunakan untuk dashboard.

## Konfigurasi wajib di luar editor

Sistem keselamatan sebenar memerlukan deployment **Cloudflare Pages Functions + HTTPS**. Pratonton HTML sahaja tidak menyediakan backend dan tidak boleh menguji keselamatan ini. Jangan letakkan secret sebenar dalam fail frontend atau repositori.

Tetapkan environment variables / secrets Cloudflare:

| Nama | Nilai / kegunaan |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Project Firebase sama seperti `firebase-config.js`: `sgmfix-services` |
| `FIREBASE_CLIENT_EMAIL` | Email service account project tersebut |
| `FIREBASE_PRIVATE_KEY` | PEM private key service account; newline sebenar atau `\\n` |
| `FIREBASE_WEB_API_KEY` | Web API key Firebase yang sama seperti frontend; bukan service account secret |
| `TURNSTILE_SITE_KEY` | Site key awam widget Turnstile |
| `TURNSTILE_SECRET_KEY` | Secret Siteverify; backend sahaja |
| `TURNSTILE_HOSTNAME` | Hostname tepat deployment tanpa protokol/path; satu environment bagi setiap hostname |
| `ADMIN_PASSWORD` | Password kuat dan unik, minimum 16 aksara |
| Binding `GALLERY_KV` | KV sedia ada; digunakan untuk rate limit admin dan modul galeri/waktu |

1. Aktifkan Google provider dalam Firebase Authentication, dan masukkan domain deployment dalam **Authorized domains**. Popup memerlukan browser membenarkan popup dan login pihak ketiga.
2. Pastikan service account mempunyai IAM untuk membaca/menulis Firestore dan menyemak/memadam Firebase Auth (contohnya Datastore User + Firebase Authentication Admin, dengan skop project sahaja). Private key tidak pernah dihantar kepada browser.
3. Konfigurasi Turnstile dengan hostname produksi yang sama. Gunakan pasangan key staging untuk ujian, bukan test key pada produksi.
4. **Terbitkan kandungan `firestore.rules` ke Firebase Firestore Rules.** Meletakkan fail dalam editor sahaja TIDAK mengaktifkan rules di Firebase. Jangan gabungkan dengan rules lama yang memberi `allow read, write: if true`; kebenaran match tambahan boleh membatalkan pengasingan.
5. Sekiranya Firebase meminta index untuk carian `bookings(ownerUid, code)`, cipta index tersebut mengikut pautan Firebase Console. Listener pelanggan hanya menapis ownerUid dan menyusun tarikh dalam browser supaya tidak memerlukan composite index tarikh.
6. Tambahkan rate limiting Cloudflare di endpoint `/api/auth/admin-login` dan `/api/auth/login`. KV hanya best-effort dan tidak memberikan counter atomik ketika permintaan serentak.
7. Konfigurasi Cloudinary/produk sedia ada masih diperlukan untuk galeri dan jualan telefon. Sesi password galeri lama sengaja tidak lagi memberi kuasa admin; gunakan login admin utama.
8. Pilihan: aktifkan Firestore TTL pada `authSessions.expiresAt` untuk membersihkan sesi lama. TTL bukan penguatkuasaan expiry; rules/server tetap menyekat tepat pada deadline.

## Data lama

Booking sedia ada yang tiada `ownerUid` hanya boleh dilihat admin selepas rules diterbitkan. Admin perlu memadankan rekod lama dengan UID yang benar secara manual; **jangan** memberi pemilikan berdasarkan email/nama yang dibekalkan pelanggan. Import admin boleh menyimpan ownerUid daripada backup yang dipercayai.

`users/{uid}` dicipta oleh backend selepas CAPTCHA dengan `uid`, `email`, `nama`, `no_telefon: ''`, `peranan: 'pelanggan'` dan transform Firestore `REQUEST_TIME` untuk `tarikh_daftar`. Profil lama dikekalkan. Pelanggan hanya boleh mengemas kini `no_telefon` melalui rules; peranan tidak boleh diubah.

## Logout dan pemadaman

Logout membatalkan semua sesi peranan/UID tersebut, memadam cookie backend, sign out kedua-dua Firebase app, mengosongkan cache CacheStorage/localStorage/sessionStorage serta cache booking dan sejarah chatbot. Reload selepas logout berjaya turut membuang cache Firestore dalam memori SDK. BroadcastChannel + storage event menyegerakkan logout di tab; permintaan baharu juga ditolak oleh rules walaupun tab menerima event lambat. Timer UI ialah bantuan sahaja; masa browser yang diubah tidak boleh memanjangkan akses backend.

Header `Clear-Site-Data: "cache"` digunakan jika browser menyokongnya. JavaScript tidak boleh menjamin pemadaman keseluruhan HTTP cache pada semua browser atau salinan data yang sudah dimuat turun/disalin pengguna. API dan shell diberi `Cache-Control: no-store`. `sw.js` tidak menyimpan navigasi HTML, `/api/*`, data pengguna, token atau respons Firebase; sesi sentiasa disemak terus pada pelayan. Versi cache baharu membuang cache aplikasi lama termasuk respons API yang mungkin tersimpan sebelum ini.

Padam akaun memerlukan Google login semula (akaun sama, auth_time maksimum 5 minit) + CAPTCHA baharu dengan action `delete_account`. Backend menandakan profil `deleting`, menyekat penulisan booking, memadam booking milik UID, akaun Firebase Auth, profil dan sesi. Ini bukan transaksi merentas Firestore dan Firebase Auth. **Jika operasi terganggu**, data mungkin sudah dipadam sebahagian: akaun kekal dikunci dengan `deleting` untuk mengelakkan akses semula. Admin mesti melengkapkan pembersihan melalui Firebase Console/log backend; jangan membuang flag begitu sahaja. Penanda minimum `authDeletions/{uid}` (masa mula, tanpa nama/email/telefon) dikekalkan sebagai tombstone keselamatan untuk menyekat sesi/login serentak daripada menghidupkan UID lama semula. Ia tidak boleh dibaca/ditulis pelanggan. Pengguna boleh mendaftar semula selepas pemadaman selesai melalui Google login baharu yang menghasilkan UID baharu.

HTML shell, katalog telefon diterbitkan dan servis ialah kandungan awam; overlay bukan sempadan keselamatan data. Memadam overlay/menukar URL tidak membuka booking kerana backend dan Rules tetap memerlukan sesi CAPTCHA yang sah. Jangan letak data pelanggan dalam HTML statik.

## Matriks ujian keselamatan (belum dijalankan)

Gunakan project/staging dan dua akaun Google berasingan. Uji sebelum produksi.

| Ujian | Keputusan wajib |
| --- | --- |
| Tutup PWA/browser tanpa logout, kemudian buka semula sebelum 24 jam | Sesi dipulihkan melalui cookie + `/api/auth/session`; tiada Google/CAPTCHA baharu |
| Sambungan terganggu ketika pemulihan sesi | Mesej sambungan + butang/cubaan semula; tiada login semula dipaksa; data kekal dilindungi |
| Browser baharu / buka URL `index.html#booking-tab` tanpa login | Overlay dipaparkan, tiada booking; bacaan SDK/REST booking ditolak |
| Login Google tanpa menyelesaikan Turnstile | Tiada sesi aplikasi atau dokumen users baharu; booking ditolak walaupun token Google sah |
| POST login dengan token CAPTCHA palsu, expired, reused atau action/hostname salah | HTTP 403, tiada cookie akses/booking |
| Pengguna baharu login Google + CAPTCHA sah | Tepat satu users/{uid}; peranan pelanggan, telefon kosong, timestamp server |
| Login pengguna lama | Profil, tarikh daftar dan telefon lama tidak ditulis semula |
| A dan B mencipta booking | Setiap booking mempunyai ownerUid yang betul; listener/chatbot A tidak menerima B |
| A membaca ID booking B atau cuba menukar ownerUid/status | Firestore permission-denied |
| Cipta token Google sahaja atau ubah sid/role/flag browser | Tidak memberi akses; tandatangan dan rekod sesi diperiksa |
| Set authSessions.expiresAt di staging kepada masa server lampau | Endpoint session ditolak; bacaan/penulisan SDK ditolak, walaupun Firebase refresh token sah |
| Ubah jam browser ke belakang / reload | Tidak memanjangkan expiry server 24 jam |
| Login admin password salah berulang | Login ditolak; rate-limit KV/edge memberi 429 selepas had |
| Pelanggan buka admin.html / ubah sessionStorage flag lama | Hanya login admin; servis write/booking semua/galeri/produk admin ditolak |
| Admin login password betul | Dashboard dan modul sedia ada boleh baca/tulis dengan sesi admin |
| Logout tab A semasa tab B membuka booking/chat | Kedua-dua tab dikunci; cache/sejarah hilang; token lama tidak boleh baca/tulis |
| Payload booking `<img src=x onerror=alert(1)>` pada nama/nota | Dipaparkan sebagai teks di pelanggan dan admin, bukan HTML aktif |
| Padam akaun tanpa Google reauth/CAPTCHA baharu | Ditolak, tiada pemadaman |
| Padam akaun dengan Google akaun lain | Ditolak, data kekal |
| Padam akaun sah | Booking UID itu, profil, Auth dan semua sesinya dipadam; data pelanggan lain kekal |
| Semak DevTools storage/network | Tiada token dalam localStorage/sessionStorage/IndexedDB; cookie HttpOnly/Secure/Strict; secret Turnstile/service account tidak dihantar |

Tiada ujian automatik/integrasi dijalankan dari editor ini. Deployment, penerbitan rules, IAM dan keputusan ujian mesti disahkan pada staging sebenar.
