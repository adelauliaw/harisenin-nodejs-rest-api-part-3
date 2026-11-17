# Panduan Postman

Base URL: `http://localhost:3000`. Jalankan MySQL, `npm run db:migrate`, lalu `npm start`. Contoh ID, timestamp, dan slug di bawah hanya ilustrasi; gunakan nilai response aktual. Semua request dengan body memakai **Body ? raw ? JSON** dan header `Content-Type: application/json`.

## 1. Register

`POST http://localhost:3000/api/auth/register`

Header: `Content-Type: application/json`. Tidak membutuhkan token.

```json
{"name":"Dashboard Tester","email":"dashboard-tester@example.com","password":"Dashboard123!"}
```

Expected **201**:
```json
{"message":"User successfully registered","data":{"id":4,"name":"Dashboard Tester","email":"dashboard-tester@example.com"}}
```

## 2. Login

`POST http://localhost:3000/api/auth/login`

Header: `Content-Type: application/json`. Tidak membutuhkan token.

```json
{"email":"dashboard-tester@example.com","password":"Dashboard123!"}
```

Expected **200**:
```json
{"message":"User successfully logged in","data":{"token":"<JWT aktual>"}}
```

## 3. Copy JWT

Salin `data.token`. Pada request terlindungi pilih **Authorization ? Bearer Token**, lalu paste token tanpa tanda kutip. Header yang dikirim: `Authorization: Bearer <JWT aktual>`. Koleksi terlampir menyimpan token secara otomatis ke `{{token}}`.

## 4. Profile

`GET http://localhost:3000/api/profile`

Header: `Authorization: Bearer <JWT>`. Body: tidak ada. Expected **200**:
```json
{"message":"Success","data":{"id":4,"name":"Dashboard Tester","email":"dashboard-tester@example.com","createdAt":"2026-11-15T00:00:00.000Z","updatedAt":"2026-11-15T00:00:00.000Z"}}
```

## 5. Users

`GET http://localhost:3000/api/users`

Header: `Authorization: Bearer <JWT>`. Body: tidak ada. Expected **200**:
```json
{"message":"Success","data":[{"id":4,"name":"Dashboard Tester","email":"dashboard-tester@example.com"}]}
```

Daftar aktual mengikuti seluruh users di database. Password tidak boleh muncul.

## 6. Buat post

`POST http://localhost:3000/api/posts`

Headers: `Content-Type: application/json`, `Authorization: Bearer <JWT>`.
```json
{"title":"Post pertama saya","content":"Konten dari Postman."}
```

Expected **201**:
```json
{"message":"Post successfully created","data":{"id":1,"user_id":4,"title":"Post pertama saya","slug":"post-pertama-saya-<uuid>","content":"Konten dari Postman.","createdAt":"2026-11-15T00:00:00.000Z","updatedAt":"2026-11-15T00:00:00.000Z","user":{"id":4,"name":"Dashboard Tester"}}}
```

Salin slug aktual. `user_id` harus sama dengan ID pemilik token. `content` boleh kosong/null; title wajib 1?255 karakter. Slug dihasilkan server.

## 7. Daftar posts

`GET http://localhost:3000/api/posts`

Headers: tidak wajib. Body: tidak ada. Expected **200**:
```json
{"message":"Success","data":[{"id":1,"user_id":4,"title":"Post pertama saya","slug":"post-pertama-saya-<uuid>","content":"Konten dari Postman.","createdAt":"2026-11-15T00:00:00.000Z","updatedAt":"2026-11-15T00:00:00.000Z","user":{"id":4,"name":"Dashboard Tester"}}]}
```

Jika belum ada post, `data` adalah `[]`.

## 8. Detail post

`GET http://localhost:3000/api/posts/<slug aktual>`

Headers: tidak wajib. Body: tidak ada. Expected **200**:
```json
{"message":"Success","data":{"id":1,"user_id":4,"title":"Post pertama saya","slug":"post-pertama-saya-<uuid>","content":"Konten dari Postman.","createdAt":"2026-11-15T00:00:00.000Z","updatedAt":"2026-11-15T00:00:00.000Z","user":{"id":4,"name":"Dashboard Tester"}}}
```

## Pengujian error

| Kondisi | Status |
| --- | --- |
| Email sudah terdaftar | 409 |
| Password salah saat login | 401 |
| Token hilang, rusak, kedaluwarsa, atau user tidak ada | 401 |
| Email bertipe angka, body kosong, title kosong, password lemah | 400 |
| JSON tidak valid | 400 |
| Body lebih dari 100 KB | 413 |
| Slug tidak ditemukan atau endpoint salah | 404 |

Contoh: `GET /api/profile` tanpa token menghasilkan:
```json
{"message":"Invalid or expired token","data":null}
```

Logout tersedia melalui tombol frontend dan menghapus token tab; tidak ada endpoint revokasi JWT. Untuk simulasi Postman, hapus variable token, lalu GET profile harus menghasilkan 401.
