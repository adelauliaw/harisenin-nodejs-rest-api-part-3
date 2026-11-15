# Node.js REST API + MySQL Dashboard

Dashboard HTML yang tersedia di `frontend/index.html` dilayani oleh Express di `/dashboard/`. Frontend menggunakan origin server yang sama untuk `/api`; tidak memerlukan Live Server. Root `/` tetap mengembalikan JSON seperti sebelumnya.

## Menjalankan

1. Aktifkan MySQL.
2. Untuk instalasi baru, jalankan `npm install`, salin `.env.example` menjadi `.env`, kemudian isi konfigurasi MySQL dan `JWT_SECRET` acak yang panjang. Jangan menimpa `.env` yang sudah berfungsi.
3. Jalankan `npm run db:migrate`. Migrasi membuat tabel dan menambahkan slug; tidak menggunakan `sync({ force: true })`.
4. Jalankan `npm run dev` untuk pengembangan atau `npm start`.
5. Buka **http://localhost:3000/dashboard/** (sesuaikan port jika `SERVER_PORT` berbeda).
6. Register akun lalu login. Password minimal 8 karakter, berisi huruf besar, kecil, angka, simbol, dan maksimal 72 byte UTF-8.

Sesudah perubahan backend, nodemon akan restart otomatis. Jika menggunakan `npm start`, hentikan dengan Ctrl+C kemudian jalankan kembali. Setelah perubahan HTML, refresh browser.

## Membuka dashboard di localhost:3000

Setelah backend berjalan dengan `npm run dev` atau `npm start`, buka **[http://localhost:3000/dashboard/](http://localhost:3000/dashboard/)** untuk register dan login. Express sudah melayani frontend sekaligus API, jadi tidak perlu menjalankan Live Server.

- Dashboard: `http://localhost:3000/dashboard/`
- Base URL API: `http://localhost:3000/api`
- Root `http://localhost:3000/` menampilkan informasi API dalam format JSON, bukan halaman dashboard.

Jika membuka `http://127.0.0.1:5500/frontend/index.html` lewat Live Server, request register akan terkirim ke `http://127.0.0.1:5500/api/auth/register`. Live Server hanya melayani file statis dan tidak menerima request POST tersebut, sehingga muncul **405 Method Not Allowed**. Solusinya, buka dashboard melalui alamat port **3000** di atas, lalu coba register kembali.

Jika halaman tidak dapat dibuka, pastikan MySQL aktif dan backend berhasil berjalan. Jika nilai `SERVER_PORT` di `.env` berbeda, sesuaikan port pada alamat dashboard dan API.

## Alur dashboard

- Overview memverifikasi profil dan memuat jumlah users/posts melalui API. Tidak menggunakan status atau data dummy.
- My Profile mengambil user berdasarkan JWT dan membaca data terbaru dari MySQL.
- Users menampilkan pengguna tanpa hash password; membutuhkan JWT.
- Posts menampilkan daftar dan detail berdasarkan slug. Form Simpan Post mengirim POST dengan JWT, kemudian memuat ulang daftar dan detail.
- Penulis selalu diambil dari JWT, bukan `user_id` yang dikirim klien.
- Slug dibuat server dari judul dan UUID; judul sama tetap diperbolehkan.
- Token disimpan di `sessionStorage` per tab dan dikirim sebagai Bearer token. Respons 401 menghapus sesi dan menampilkan login.
- Logout menghapus token dan data tampilan dari tab tersebut. JWT bersifat stateless: salinan token di tempat lain tetap berlaku sampai kedaluwarsa (1 jam); belum ada pencabutan token server/global logout.
- Daftar dan detail posts adalah endpoint publik; membuat post membutuhkan login.

## Struktur

`src/app.js` menyiapkan Express dan mengekspor aplikasi untuk tes tanpa menjalankan listener. `src/index.js` memverifikasi konfigurasi JWT, menghubungkan MySQL, dan menjalankan server. Pemisahan ini memungkinkan pengujian HTTP dengan port sementara.

`src/routes` ? middleware ? controller ? `src/models` ? MySQL. Model `user` memiliki banyak `post`; `post.user_id` mengacu ke `users.id`. Respons memakai `{ message, data }`.

Konfigurasi saat ini ditujukan untuk development lokal (`NODE_ENV` kosong/development). Migrasi slug memakai kolom NOT NULL dan indeks unik. Data post lama, jika ada saat migrasi, mendapatkan slug `post-<id>`.

## Testing otomatis

```powershell
npm test
```

Tes memakai database dari `.env`, membuat akun dengan email unik dan post uji, lalu membersihkan hanya data yang dibuat tes. Tes mencakup hash password, register/login, JWT tidak valid/kedaluwarsa, input salah, profile/users, author dari JWT, slug unik, penyimpanan MySQL, error JSON, dan penyajian HTML.

Script JavaScript asli dari HTML juga dijalankan dengan DOM minimal dan HTTP server nyata: login, overview, profile, users, create/detail post, escaping HTML, logout, dan sesi kedaluwarsa. Ini bukan pengujian layout atau klik browser. Pemeriksaan visual browser belum dilakukan karena akses browser otomatis tidak tersedia pada sesi pengerjaan.

## Postman dan pemeriksaan manual

Import `docs/postman.collection.json`. Pilih email unik di collection variables; register dengan email yang sudah ada menghasilkan 409. Jalankan request secara berurutan. Login menyimpan token otomatis dan create post menyimpan slug otomatis. Panduan lengkap request dan contoh JSON ada di `docs/API-TESTING.md`.

Di browser: register ? login ? periksa Overview ? My Profile ? Users ? Posts ? buat post ? buka detail ? refresh ? logout. Post harus tetap ada setelah refresh karena disimpan di MySQL. Setelah logout, halaman login tampil dan token tab terhapus.
