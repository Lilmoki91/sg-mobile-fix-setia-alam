# Notifikasi respons tempahan

## Aliran
- Admin boleh memasukkan mesej pilihan dan menekan Disahkan/Ditolak. Butang Hantar respons menghantar mesej dengan status semasa.
- Setiap respons mempunyai `adminResponseId` baharu, `adminRespondedAt` (masa server) dan `adminMessage`.
- Listener tempahan sedia ada hanya memantau rekod pemilik yang login. Dot merah pada Hubungi, outline merah pada Buat Appointment dan ringkasan menunjukkan jumlah tempahan belum dibaca.
- Respons muncul dalam Tempahan Saya. Pengguna perlu menekan Tandakan dibaca pada respons tersebut; membuka tab Hubungi atau Tempahan tidak memadam tanda.
- `userReadResponseId` menyimpan ID respons yang dibaca bersama `userReadAt`. Peraturan menolak pengakuan respons lama jika admin telah menghantar respons baharu pada masa yang sama. Muat semula data dan cuba lagi.
- Penanda disimpan dalam Firestore, bukan localStorage, supaya bacaan diselaraskan antara peranti. Respons lama sebelum ciri ini tiada penanda baharu sehingga admin menghantar kemas kini.
- Pemadaman automatik tempahan luput pada paparan pelanggan dinyahaktifkan untuk mengekalkan sejarah respons. Butang padam manual sedia ada kekal.

## Keperluan penerbitan
Terbitkan kandungan terkini `firebase/firestore.rules` melalui Firebase Console, bahagian Firestore Database > Rules. Ini diperlukan supaya pelanggan dibenarkan menyimpan penanda dibaca. Editor tidak menerbitkan rules ke Firebase secara automatik.

Admin sahaja boleh mengubah status dan metadata respons. Pelanggan hanya boleh menandakan respons terkini pada tempahan sendiri sebagai dibaca; perubahan butiran tempahan sedia ada tetap tertakluk kepada validasi.

## Semakan manual
1. Login pelanggan dan buat tempahan.
2. Di sesi/peranti admin berasingan, tulis mesej dan sahkan atau tolak tempahan itu.
3. Semak dot Hubungi, outline Buat Appointment dan ringkasan respons baharu pada pelanggan.
4. Buka Tempahan Saya: mesej dan status dipaparkan, tetapi penanda masih kekal.
5. Tekan Tandakan dibaca. Penanda hilang hanya jika tiada respons lain belum dibaca.
6. Hantar respons admin sekali lagi: penanda muncul semula. Cuba juga muat semula halaman, tukar bahasa, logout dan login dengan akaun lain.

Ini notifikasi dalam aplikasi ketika halaman dibuka; bukan Web Push semasa aplikasi ditutup. Listener memerlukan akses Firebase yang tersedia pada laman diterbitkan.
