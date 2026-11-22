# Profil pengguna

- `profile.html`, `profile.css`, `profile.js`: paparan Profil Saya, mod cerah/gelap, Bahasa Malaysia/English, nombor telefon boleh disimpan dan butang kembali ke Utama.
- `profile.js` menggunakan `onAuthStateChanged` pada Firebase Auth aplikasi utama (bukan instance sementara `google-login`). Maklumat Google dipaparkan daripada `photoURL`, `displayName`, `email`, dengan fallback kepada profil yang disahkan backend.
- `users/{uid}` diperuntukkan oleh backend login **selepas** Google dan CAPTCHA disahkan. Client tidak diberi kebenaran mencipta profil sendiri. Sesi yang dipulihkan turut melengkapkan medan profil lama tanpa memadam data sedia ada.
- Medan baharu: `phoneNumber`, `sgmfId`, `createdAt`; medan lama `no_telefon` dan `tarikh_daftar` dikekalkan. Penyimpanan telefon mengemas kini `phoneNumber` dan `no_telefon` serentak.
- ID menggunakan `SGMF-` + UUID rawak, bukan hanya 5 digit, untuk mengelakkan perlanggaran ID dalam ruang 100,000 nombor. ID kekal dan tidak boleh diedit oleh pelanggan.
- Log keluar memanggil `sgmAuth.logout()`. Padam akaun memanggil `sgmAuth.requestDeletion()`, iaitu aliran asal pengesahan Google semula + CAPTCHA + pemadaman backend. Tiada aliran pemadaman kedua.

## Keperluan deployment

Terbitkan `firestore.rules` yang dikemas kini pada projek Firebase dan deploy perubahan Pages Functions bersama fail UI serta `lib/profile-store.js`. Konfigurasi Firebase/Cloudflare/Turnstile sedia ada tetap diperlukan. Preview sandbox tanpa rangkaian/backend tidak boleh mengesahkan login atau penyimpanan Firestore.

## Semakan manual

1. Login pelanggan baharu: buka Profil Saya dari side menu dan semak nama, email, gambar dan ID.
2. Pelanggan lama: semak telefon lama dikekalkan dan ID baharu kekal selepas refresh/login semula.
3. Tukar bahasa dan tema; semak label, input, mesej kejayaan dan kontras.
4. Simpan telefon sah, kosongkan telefon, dan cuba input tidak sah; semak maklum balas.
5. Klik X atau navigasi bawah: Profil disembunyikan, hanya tab pilihan dipaparkan.
6. Log keluar: sesi dibatalkan, maklumat profil dikosongkan dan skrin login kembali.
7. Padam akaun: cuba batal, Google UID berbeza, kemudian sahkan UID sama + CAPTCHA. Semak rekod pengguna dan tempahan dipadam oleh aliran asal.
8. Semak Rules menolak akses profil pengguna lain dan perubahan `sgmfId`, `email`, `uid`, atau `createdAt` oleh client.
