# Next.js Part 1 --- Build the Frontend Using Existing Node.js REST API

Harisenin Bootcamp --- Full-Stack Web Developer

## Goal

Pada sesi ini kita **langsung fokus membangun frontend menggunakan
Next.js Pages Router**. Backend Node.js REST API Part 3 sudah tersedia
dan tidak perlu dibuat ulang.

Next.js akan menggunakan endpoint yang sudah tersedia pada backend
untuk: - Register dan login. - Mengambil profil user. - Mengambil daftar
user. - Mengambil daftar post. - Mengambil detail post berdasarkan slug.

Kita juga akan menyiapkan data contoh melalui **Sequelize Seeder di
project backend** agar endpoint posts memiliki data dan Next.js dapat
membaca slug yang akan digunakan pada dynamic route.

> Prinsip pembelajaran: backend yang sudah ada digunakan sebagai sumber
> data. Fokus coding hari ini adalah membangun Next.js dan
> menghubungkannya ke API.

------------------------------------------------------------------------

# 1. Arsitektur Aplikasi

``` text
BROWSER
   |
   v
NEXT.JS PAGES ROUTER
http://localhost:3000
   |
   | fetch() / HTTP request
   v
NODE.JS + EXPRESS REST API
http://localhost:3001
   |
   v
ROUTES
   |
   v
MIDDLEWARE (JWT untuk endpoint protected)
   |
   v
CONTROLLERS
   |
   v
SEQUELIZE ORM
   |
   v
MYSQL DATABASE
```

## Port yang digunakan

  Aplikasi             Port URL
  ------------------ ------ -------------------------
  Next.js frontend     3000 `http://localhost:3000`
  Node.js backend      3001 `http://localhost:3001`
  MySQL / MariaDB      3306 `localhost:3306`

**Penting:** Next.js dan Node.js tidak boleh menggunakan port yang sama.
Pastikan backend menggunakan `SERVER_PORT=3001`, sedangkan Next.js
berjalan pada port `3000`.

------------------------------------------------------------------------

# 2. Endpoint Backend yang Digunakan

Kita menggunakan endpoint yang sudah tersedia. Jangan membuat backend,
controller, atau endpoint baru untuk latihan ini.

  ----------------------------------------------------------------------------
  Method            Endpoint               Kegunaan          Authentication
  ----------------- ---------------------- ----------------- -----------------
  `POST`            `/api/auth/register`   Membuat akun      Tidak

  `POST`            `/api/auth/login`      Login dan         Tidak
                                           memperoleh JWT    

  `GET`             `/api/profile`         Mengambil profil  Bearer Token
                                           user aktif        

  `GET`             `/api/users`           Mengambil daftar  Bearer Token
                                           user              

  `GET`             `/api/posts`           Mengambil daftar  Tidak
                                           post              

  `GET`             `/api/posts/:slug`     Mengambil detail  Tidak
                                           post berdasarkan  
                                           slug              
  ----------------------------------------------------------------------------

Contoh URL lengkap:

``` text
POST http://localhost:3001/api/auth/register
POST http://localhost:3001/api/auth/login
GET  http://localhost:3001/api/profile
GET  http://localhost:3001/api/users
GET  http://localhost:3001/api/posts
GET  http://localhost:3001/api/posts/belajar-nextjs-routing
```

Endpoint `/api/profile` dan `/api/users` membutuhkan header:

``` http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Bentuk response API

Endpoint posts menggunakan struktur response seperti berikut:

``` json
{
  "message": "Success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Belajar Next.js Routing",
      "slug": "belajar-nextjs-routing",
      "content": "Next.js Pages Router menggunakan file di folder pages sebagai route.",
      "user": {
        "id": 1,
        "name": "Bootcamp Student",
        "email": "student@example.com"
      }
    }
  ]
}
```

Perhatikan bahwa data artikel berada di dalam `data`, bukan langsung di
root response. Karena itu helper Next.js harus mengembalikan
`result.data`.

------------------------------------------------------------------------

# 3. Persiapan Backend Sebelum Membuat Next.js

Bagian ini hanya checkpoint singkat. Kita tidak membangun ulang backend.

## 3.1 Pastikan backend berjalan di port 3001

Di project backend `harisenin-nodejs-rest-api-part-3`, pastikan `.env`
menggunakan:

``` env
SERVER_PORT=3001

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=

DATABASE_NAME=fsd_bootcamp
DATABASE_NAME_TEST=fsd_bootcamp_test

JWT_SECRET=your_backend_jwt_secret
```

Gunakan password MySQL yang benar di komputer masing-masing. Jika MySQL
memang tidak memakai password, biarkan `DATABASE_PASSWORD` kosong.

Pastikan `src/index.js` menggunakan:

``` js
const PORT = process.env.SERVER_PORT || 3001;
```

Express tetap menjadi REST API. Jika sebelumnya Express menyajikan HTML
lama melalui `express.static()` pada route `/dashboard`, route tersebut
tidak digunakan lagi oleh frontend Next.js. Middleware API seperti
`cors()`, `express.json()`, `routes`, dan koneksi Sequelize tetap
dipertahankan.

Jalankan backend:

``` bash
npm run dev
```

Expected:

``` text
Database connected
Server running on http://localhost:3001
```

## 3.2 Pastikan endpoint sudah dapat diakses

Sebelum membuka project Next.js, tes endpoint berikut melalui browser
atau Postman:

``` text
GET http://localhost:3001/
GET http://localhost:3001/api/posts
```

Untuk endpoint protected, login terlebih dahulu melalui:

``` text
POST http://localhost:3001/api/auth/login
```

Gunakan token dari response login untuk menguji:

``` text
GET http://localhost:3001/api/profile
GET http://localhost:3001/api/users
```

Jika endpoint posts belum tersedia atau belum mengembalikan field
`slug`, selesaikan kondisi backend tersebut terlebih dahulu. Panduan ini
mengasumsikan endpoint posts yang dipakai sudah tersedia.

------------------------------------------------------------------------

# 4. Seeder --- Siapkan Data Post dan Slug

**Seeder dijalankan di project backend Node.js, bukan di project
Next.js.**

Tujuan seeder adalah mengisi tabel `posts` dengan data contoh. Next.js
nantinya mengambil data dan slug melalui `GET /api/posts`.

Alur:

``` text
Sequelize Seeder
      |
      v
MySQL: posts
      |
      v
GET /api/posts
      |
      v
Next.js getStaticPaths()
      |
      v
/posts/[slug]
```

## 4.1 Pastikan sudah ada user

Tabel `posts` memiliki `user_id` yang berelasi dengan tabel `users`.
Jadi, pastikan minimal satu user sudah terdaftar.

Jika belum ada, gunakan endpoint register melalui Postman:

``` http
POST http://localhost:3001/api/auth/register
Content-Type: application/json
```

Body:

``` json
{
  "name": "Bootcamp Student",
  "email": "student@example.com",
  "password": "Belajar123!"
}
```

Password contoh mengikuti aturan validator backend: minimal 8 karakter
dengan huruf besar, huruf kecil, angka, dan simbol.

## 4.2 Generate Seeder

Buka terminal pada root project backend:

``` bash
npx sequelize-cli seed:generate --name sample-posts
```

Dengan konfigurasi `.sequelizerc` yang sudah mengarahkan `seeders-path`
ke `src/database/seeders`, file seeder akan dibuat di folder:

``` text
src/database/seeders/
```

Buka file seeder yang baru dibuat, lalu isi:

``` js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users ORDER BY id ASC LIMIT 1",
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const userId = users[0]?.id;

    if (!userId) {
      throw new Error(
        "User belum tersedia. Register user terlebih dahulu."
      );
    }

    const now = new Date();

    await queryInterface.bulkInsert("posts", [
      {
        user_id: userId,
        title: "Belajar Next.js Routing",
        slug: "belajar-nextjs-routing",
        content:
          "Next.js Pages Router menggunakan file di folder pages sebagai route.",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        title: "Dynamic Route dengan Slug",
        slug: "dynamic-route-dengan-slug",
        content:
          "Satu file [slug].js dapat digunakan untuk menampilkan banyak detail page.",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userId,
        title: "My First Full Stack Post",
        slug: "my-first-full-stack-post",
        content:
          "Node.js menjadi backend dan Next.js menjadi frontend aplikasi full-stack.",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("posts", {
      slug: [
        "belajar-nextjs-routing",
        "dynamic-route-dengan-slug",
        "my-first-full-stack-post",
      ],
    });
  },
};
```

**Penjelasan:** - Seeder mencari `id` user yang sudah ada. - `user_id`
digunakan untuk memenuhi relasi foreign key. - Setiap post memiliki
`title`, `slug`, dan `content`. - Slug dibuat unik karena digunakan
sebagai identitas URL artikel.

## 4.3 Jalankan Seeder

Dari root project backend:

``` bash
npx sequelize-cli db:seed:all
```

Jika ingin membatalkan seluruh seeder:

``` bash
npx sequelize-cli db:seed:undo:all
```

Jangan menjalankan seeder berulang kali dengan slug yang sama tanpa
melakukan undo atau memeriksa data terlebih dahulu, karena kolom `slug`
memiliki aturan unique.

## 4.4 Verifikasi Seeder

Di DBeaver:

``` sql
USE fsd_bootcamp;

SELECT
  id,
  user_id,
  title,
  slug,
  content
FROM posts
ORDER BY id ASC;
```

Pastikan tiga artikel sudah masuk ke database.

Kemudian tes:

``` text
GET http://localhost:3001/api/posts
```

Salin salah satu slug dari response, lalu tes:

``` text
GET http://localhost:3001/api/posts/belajar-nextjs-routing
```

Jika berhasil, backend siap digunakan oleh Next.js.

------------------------------------------------------------------------

# 5. Create Next.js Project from Scratch

Sekarang kita fokus ke frontend.

Buka terminal baru. Jangan matikan terminal backend.

Jalankan:

``` bash
npx create-next-app@latest
```

Nama project:

``` text
harisenin-nextjs-part-1
```

Pilih konfigurasi berikut:

  Pertanyaan                     Pilihan
  ------------------------------ ---------
  TypeScript                     No
  Linter                         ESLint
  React Compiler                 No
  Tailwind CSS                   No
  Code inside `src/` directory   No
  App Router                     No
  Customize import alias         No

**Penting:** pilih `App Router = No`, karena materi ini menggunakan
Pages Router, `getStaticProps()`, dan `getStaticPaths()`.

Masuk ke project:

``` bash
cd harisenin-nextjs-part-1
```

Jalankan:

``` bash
npm run dev
```

Buka:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# 6. Add Environment Variables untuk Next.js

Buat file `.env.local` di root project Next.js.

``` env
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Buat juga `.env.example`:

``` env
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Fungsi masing-masing environment variable

  -----------------------------------------------------------------------
  Variable                            Digunakan untuk
  ----------------------------------- -----------------------------------
  `API_URL`                           Request dari server Next.js,
                                      seperti `getStaticProps()` dan
                                      `getStaticPaths()`

  `NEXT_PUBLIC_API_URL`               Request dari browser, seperti
                                      register, login, profile, dan users
  -----------------------------------------------------------------------

`NEXT_PUBLIC_API_URL` boleh terlihat di browser karena hanya berisi
alamat API. **Jangan pernah menaruh `JWT_SECRET`, password database,
atau secret backend di environment variable berawalan `NEXT_PUBLIC_`.**

Pastikan `.env.local` tidak ikut di-push ke Git. Setelah mengubah file
environment, restart Next.js:

``` bash
Ctrl + C
npm run dev
```

------------------------------------------------------------------------

# 7. Next.js Project Structure

Buat struktur berikut:

``` text
harisenin-nextjs-part-1/
|
├── pages/
│   ├── _app.js
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── profile.js
│   ├── users.js
│   └── posts/
│       ├── index.js
│       └── [slug].js
|
├── components/
│   ├── Layout.js
│   ├── Navbar.js
│   └── PostCard.js
|
├── lib/
│   ├── api.js
│   └── auth.js
|
├── styles/
│   └── globals.css
|
├── .env.local
├── .env.example
└── public/
```

Fungsi folder:

  Folder / File   Fungsi
  --------------- -------------------------------------------
  `pages/`        Membuat halaman dan URL
  `components/`   Menyimpan UI yang dapat digunakan kembali
  `lib/api.js`    Mengelola request ke REST API
  `lib/auth.js`   Mengelola token di browser
  `styles/`       Menyimpan global CSS
  `.env.local`    Menyimpan alamat API lokal

Buat folder melalui Git Bash:

``` bash
mkdir -p components lib pages/posts styles
```

------------------------------------------------------------------------

# 8. Create API Helper

Buat file:

``` text
lib/api.js
```

Isi:

``` js
const SERVER_API_URL = process.env.API_URL;
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllPosts() {
  const response = await fetch(
    `${SERVER_API_URL}/api/posts`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const result = await response.json();

  return result.data;
}

export async function getPostBySlug(slug) {
  const response = await fetch(
    `${SERVER_API_URL}/api/posts/${encodeURIComponent(slug)}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  const result = await response.json();

  return result.data;
}

export async function apiRequest(
  path,
  options = {}
) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth) {
    const token = sessionStorage.getItem(
      "harisenin_rest_api_token"
    );

    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${CLIENT_API_URL}/api${path}`,
    {
      ...options,
      headers,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || `Request gagal (${response.status})`
    );
  }

  return result;
}
```

**Catatan penting:** `getAllPosts()` dan `getPostBySlug()` digunakan
oleh fungsi data-fetching Pages Router di sisi server. `apiRequest()`
digunakan dari event handler atau `useEffect()` di browser. Jangan
membaca `sessionStorage` saat render server karena `sessionStorage`
hanya tersedia di browser.

## Memahami API Helper

``` text
Next.js Page
     |
     v
lib/api.js
     |
     v
fetch()
     |
     v
Node.js REST API
     |
     v
JSON Response
     |
     v
Next.js
```

Helper memisahkan logika request dari komponen halaman agar kode lebih
rapi dan mudah digunakan ulang.

------------------------------------------------------------------------

# 9. Create Authentication Helper

Buat file:

``` text
lib/auth.js
```

Isi:

``` js
export const TOKEN_KEY = "harisenin_rest_api_token";

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
```

Token hanya diakses dari browser. Dalam latihan ini kita menggunakan
`sessionStorage` seperti dashboard HTML sebelumnya. Untuk aplikasi
production, pertimbangkan mekanisme session yang lebih aman, misalnya
HttpOnly Secure Cookie.

------------------------------------------------------------------------

# 10. Create Basic Pages

## 10.1 Home Page

Buka:

``` text
pages/index.js
```

Isi:

``` jsx
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Node.js + Next.js</h1>

      <p>
        Backend menggunakan Node.js REST API.
        Frontend menggunakan Next.js Pages Router.
      </p>

      <Link href="/posts">
        Explore Posts
      </Link>

      <p>
        <Link href="/login">Login</Link>
        {" | "}
        <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
```

Test:

``` text
http://localhost:3000
```

## 10.2 Login Page

Buat:

``` text
pages/login.js
```

Isi:

``` jsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiRequest } from "../lib/api";
import { saveToken } from "../lib/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!result.data?.token) {
        throw new Error("Token tidak ditemukan.");
      }

      saveToken(result.data.token);

      router.push("/profile");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Belum punya akun? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
```

Alur login:

``` text
Login Form
   |
   v
POST /api/auth/login
   |
   v
Node.js Validator
   |
   v
Auth Controller
   |
   v
bcrypt.compare()
   |
   v
jwt.sign()
   |
   v
JWT Token
   |
   v
sessionStorage
```

## 10.3 Register Page

Buat:

``` text
pages/register.js
```

Isi:

``` jsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiRequest } from "../lib/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setMessage(result.message || "Register berhasil.");

      router.push("/login");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <label>Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Mendaftarkan..." : "Register"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Sudah punya akun? <Link href="/login">Login</Link>
      </p>
    </main>
  );
}
```

Password tetap divalidasi oleh backend. Frontend juga dapat menambahkan
validasi awal untuk memberikan feedback lebih cepat kepada user.

------------------------------------------------------------------------

# 11. Protected Page --- Profile

Buat:

``` text
pages/profile.js
```

Isi:

``` jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    apiRequest("/profile", { auth: true })
      .then((result) => setProfile(result.data))
      .catch((error) => {
        setMessage(error.message);

        if (error.message.toLowerCase().includes("token")) {
          removeToken();
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <main>
      <h1>My Profile</h1>

      {message && <p>{message}</p>}

      {profile && (
        <>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}
```

Endpoint yang digunakan:

``` text
GET http://localhost:3001/api/profile
```

Request membawa:

``` http
Authorization: Bearer YOUR_JWT_TOKEN
```

Catatan: contoh redirect ini merupakan proteksi tampilan di sisi client.
Keamanan data tetap harus ditegakkan oleh middleware JWT pada backend.

------------------------------------------------------------------------

# 12. Protected Page --- Users

Buat:

``` text
pages/users.js
```

Isi:

``` jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "../lib/api";
import { getToken } from "../lib/auth";

export default function Users() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    apiRequest("/users", { auth: true })
      .then((result) => setUsers(result.data || []))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading users...</p>;

  return (
    <main>
      <h1>Users</h1>

      {message && <p>{message}</p>}

      {users.map((user) => (
        <article key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </article>
      ))}
    </main>
  );
}
```

Endpoint:

``` text
GET http://localhost:3001/api/users
```

------------------------------------------------------------------------

# 13. Posts List --- getStaticProps

Sekarang kita mulai menggunakan data yang berasal dari MySQL melalui
Node.js.

Buat:

``` text
components/PostCard.js
```

Isi:

``` jsx
import Link from "next/link";

export default function PostCard({ post }) {
  return (
    <article>
      <h2>{post.title}</h2>

      <p>{post.content}</p>

      <Link href={`/posts/${post.slug}`}>
        Read Post
      </Link>

      <style jsx>{`
        article {
          background: white;
          padding: 24px;
          margin-bottom: 16px;
          border: 1px solid #ddd;
          border-radius: 12px;
        }

        h2 {
          margin-top: 0;
        }
      `}</style>
    </article>
  );
}
```

Buat:

``` text
pages/posts/index.js
```

Isi:

``` jsx
import PostCard from "../../components/PostCard";
import { getAllPosts } from "../../lib/api";

export async function getStaticProps() {
  const posts = await getAllPosts();

  return {
    props: {
      posts,
    },
  };
}

export default function PostsPage({ posts }) {
  return (
    <main>
      <h1>Posts</h1>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}
    </main>
  );
}
```

Buka:

``` text
http://localhost:3000/posts
```

## Alur getStaticProps

``` text
Browser membuka /posts
        |
        v
getStaticProps()
        |
        v
getAllPosts()
        |
        v
lib/api.js
        |
        v
fetch()
        |
        v
GET /api/posts
        |
        v
Node.js REST API
        |
        v
Sequelize
        |
        v
MySQL
        |
        v
JSON Response
        |
        v
props
        |
        v
PostCard
```

Perhatikan bahwa Next.js tidak mengambil data langsung dari MySQL.
Next.js meminta data melalui REST API Node.js.

------------------------------------------------------------------------

# 14. Dynamic Route --- \[slug\].js

Buat:

``` text
pages/posts/[slug].js
```

Isi:

``` jsx
import {
  getAllPosts,
  getPostBySlug,
} from "../../lib/api";

export async function getStaticPaths() {
  const posts = await getAllPosts();

  const paths = posts.map((post) => ({
    params: {
      slug: post.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
}

export default function PostDetail({ post }) {
  return (
    <main>
      <h1>{post.title}</h1>

      <p>{post.content}</p>

      {post.user && (
        <p>Author: {post.user.name}</p>
      )}
    </main>
  );
}
```

## Bagaimana slug bekerja?

Misalnya API mengembalikan tiga slug:

``` text
belajar-nextjs-routing
dynamic-route-dengan-slug
my-first-full-stack-post
```

`getStaticPaths()` akan membentuk:

``` js
[
  {
    params: {
      slug: "belajar-nextjs-routing"
    }
  },
  {
    params: {
      slug: "dynamic-route-dengan-slug"
    }
  },
  {
    params: {
      slug: "my-first-full-stack-post"
    }
  }
]
```

Ketiga URL berikut dapat menggunakan satu file yang sama:

``` text
/posts/belajar-nextjs-routing
/posts/dynamic-route-dengan-slug
/posts/my-first-full-stack-post
```

Satu template, banyak halaman.

## Flow detail post

``` text
User klik Read Post
        |
        v
/posts/belajar-nextjs-routing
        |
        v
pages/posts/[slug].js
        |
        v
getStaticPaths()
        |
        v
getStaticProps({ params })
        |
        v
params.slug
        |
        v
getPostBySlug(slug)
        |
        v
GET /api/posts/:slug
        |
        v
Node.js + MySQL
        |
        v
JSON Response
        |
        v
Post Detail Page
```

Test:

``` text
http://localhost:3000/posts/belajar-nextjs-routing
http://localhost:3000/posts/dynamic-route-dengan-slug
http://localhost:3000/posts/my-first-full-stack-post
```

Test slug tidak dikenal:

``` text
http://localhost:3000/posts/post-tidak-ada
```

Dengan `fallback: false`, slug yang tidak termasuk daftar paths akan
menghasilkan 404.

------------------------------------------------------------------------

# 15. Global Layout and Navigation

Buat:

``` text
components/Navbar.js
```

Isi:

``` jsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      {" | "}
      <Link href="/posts">Posts</Link>
      {" | "}
      <Link href="/profile">Profile</Link>
      {" | "}
      <Link href="/users">Users</Link>
      {" | "}
      <Link href="/login">Login</Link>
    </nav>
  );
}
```

Buat:

``` text
components/Layout.js
```

Isi:

``` jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

Buka:

``` text
pages/_app.js
```

Isi:

``` jsx
import "../styles/globals.css";
import Layout from "../components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

Buat:

``` text
styles/globals.css
```

Isi:

``` css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f7f7f7;
  color: #111;
}

nav {
  padding: 20px 40px;
  background: #111;
}

nav a {
  color: white;
  text-decoration: none;
  margin-right: 12px;
}

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

input {
  display: block;
  width: 100%;
  padding: 12px;
  margin: 8px 0 16px;
}

button {
  padding: 10px 16px;
  cursor: pointer;
}
```

------------------------------------------------------------------------

# 16. Run Both Projects

Gunakan dua terminal yang berbeda.

## Terminal 1 --- Backend

``` bash
cd harisenin-nodejs-rest-api-part-3

git switch phase-5-nextjs-integration

npm run dev
```

Expected:

``` text
Database connected
Server running on http://localhost:3001
```

## Terminal 2 --- Frontend

``` bash
cd harisenin-nextjs-part-1

npm run dev
```

Expected:

``` text
http://localhost:3000
```

Jangan matikan backend saat menguji frontend.

------------------------------------------------------------------------

# 17. Test Full-Stack Application

  ---------------------------------------------------------------------------------
  Fitur                   URL / Action                      Expected
  ----------------------- --------------------------------- -----------------------
  Home                    `/`                               Homepage tampil

  Register                `/register`                       User berhasil dibuat

  Login                   `/login`                          JWT diterima dan
                                                            disimpan

  Profile                 `/profile`                        Profil user tampil
                                                            dengan token

  Users                   `/users`                          Daftar user tampil
                                                            dengan token

  Posts                   `/posts`                          Artikel dari database
                                                            tampil

  Post detail             `/posts/belajar-nextjs-routing`   Detail artikel tampil

  Unknown slug            `/posts/post-tidak-ada`           404
  ---------------------------------------------------------------------------------

## Test Authentication

1.  Register user baru.
2.  Login menggunakan email dan password tersebut.
3.  Periksa bahwa response login memiliki `data.token`.
4.  Token disimpan di `sessionStorage`.
5.  Buka `/profile`.
6.  Next.js mengirim token melalui `Authorization: Bearer`.
7.  Backend memverifikasi token menggunakan JWT middleware.
8.  Jika token tidak valid atau kedaluwarsa, user diminta login kembali.

## Test Posts

1.  Pastikan seeder sudah dijalankan.
2.  Buka `/posts`.
3.  Pastikan tiga artikel tampil.
4.  Klik `Read Post`.
5.  Pastikan URL menggunakan slug.
6.  Pastikan detail artikel sesuai dengan slug yang dipilih.

------------------------------------------------------------------------

# 18. Important: Static Generation and New Posts

Pada Pages Router, `getStaticProps()` dan `getStaticPaths()` digunakan
untuk membuat halaman statis.

Dalam production, data diambil ketika `npm run build` dijalankan.

Artinya:

1.  Seeder menambahkan data ke MySQL.
2.  Node.js menyediakan data melalui `/api/posts`.
3.  Next.js membaca daftar slug melalui `getStaticPaths()`.
4.  Next.js membangun halaman detail untuk setiap slug.
5.  Jika ada artikel baru setelah production build, jalankan ulang build
    dan deploy agar halaman statis baru ikut dibuat.

Untuk latihan development, Next.js menjalankan ulang proses
data-fetching saat halaman diminta. Namun, jangan menganggap perubahan
database otomatis memperbarui production static pages.

------------------------------------------------------------------------

# 19. Build and Run Production

Pastikan backend tetap hidup di port 3001.

Pada terminal frontend:

``` bash
npm run build
```

Expected: build berhasil.

Kemudian:

``` bash
npm run start
```

Test:

``` text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/profile
http://localhost:3000/users
http://localhost:3000/posts
http://localhost:3000/posts/belajar-nextjs-routing
```

------------------------------------------------------------------------

# 20. Troubleshooting

## A. fetch failed

Penyebab: - Backend belum berjalan. - Port backend salah. - `API_URL`
salah.

Check:

``` text
http://localhost:3001/
http://localhost:3001/api/posts
```

Pastikan `.env.local`:

``` env
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Restart Next.js setelah mengubah environment.

## B. CORS Error

Jika request dari browser ditolak oleh CORS, pastikan backend
mengaktifkan CORS dan mengizinkan origin frontend:

``` text
http://localhost:3000
```

Backend saat ini menggunakan `app.use(cors())`, yang mengizinkan semua
origin secara default. Untuk production, batasi origin sesuai domain
frontend.

## C. posts.map is not a function

Periksa response API.

Response:

``` json
{
  "message": "Success",
  "data": []
}
```

Helper harus mengembalikan:

``` js
return result.data;
```

Bukan:

``` js
return result;
```

## D. Detail post 404

Check:

``` text
GET http://localhost:3001/api/posts
```

Pastikan setiap post memiliki slug.

Contoh:

``` text
belajar-nextjs-routing
```

Pastikan nama file:

``` text
pages/posts/[slug].js
```

dan parameter:

``` js
params: {
  slug: post.slug
}
```

## E. Login berhasil tetapi Profile 401

Periksa: - Apakah login mengembalikan `data.token`? - Apakah token
disimpan di `sessionStorage`? - Apakah request profile mengirim
`Authorization: Bearer TOKEN`? - Apakah JWT belum kedaluwarsa? - Apakah
`JWT_SECRET` backend tetap sama?

Jangan menaruh `JWT_SECRET` di frontend.

## F. Slug baru tidak muncul setelah production build

Jalankan kembali:

``` bash
npm run build
```

Pastikan backend hidup dan data baru sudah muncul pada `GET /api/posts`.

------------------------------------------------------------------------

# 21. Final Checklist

## Backend Readiness

``` text
[ ] Node.js berjalan pada port 3001
[ ] MySQL berjalan
[ ] Database fsd_bootcamp tersedia
[ ] Endpoint POST /api/auth/register tersedia
[ ] Endpoint POST /api/auth/login tersedia
[ ] Endpoint GET /api/profile tersedia
[ ] Endpoint GET /api/users tersedia
[ ] Endpoint GET /api/posts tersedia
[ ] Endpoint GET /api/posts/:slug tersedia
[ ] Seeder sample posts sudah dijalankan
[ ] Setiap post memiliki slug unik
```

## Next.js Frontend

``` text
[ ] Next.js project berhasil dibuat
[ ] Pages Router digunakan
[ ] .env.local sudah dibuat
[ ] API_URL mengarah ke localhost:3001
[ ] NEXT_PUBLIC_API_URL mengarah ke localhost:3001
[ ] Home page tampil
[ ] Register berhasil
[ ] Login berhasil
[ ] JWT tersimpan
[ ] Profile dapat mengambil data
[ ] Users dapat mengambil data
[ ] Posts dapat mengambil data dari API
[ ] getStaticProps berjalan
[ ] getStaticPaths mengambil slug dari API
[ ] Dynamic route berhasil
[ ] Unknown slug menghasilkan 404
[ ] npm run build berhasil
```

## Full-Stack Result

``` text
[ ] MySQL menyimpan data
[ ] Sequelize membaca data
[ ] Node.js menyediakan JSON
[ ] Next.js mengonsumsi API
[ ] JWT melindungi endpoint yang membutuhkan login
[ ] React menampilkan data ke browser
```

------------------------------------------------------------------------

# 22. Final Learning Flow

``` text
SEEDER
   |
   v
MYSQL
   |
   v
SEQUELIZE
   |
   v
NODE.JS REST API
   |
   v
JSON RESPONSE
   |
   v
NEXT.JS
   |
   +---- Register / Login
   |
   +---- JWT / Protected API
   |
   +---- getStaticProps
   |
   +---- getStaticPaths
   |
   +---- Dynamic Routes
   |
   v
REACT COMPONENTS
   |
   v
BROWSER
```

## Key Mental Model

  Technology           Responsibility
  -------------------- ------------------------------------------------
  Sequelize Seeder     Mengisi data awal ke database
  MySQL                Menyimpan data
  Sequelize            Menghubungkan backend dengan database
  Node.js + Express    Menyediakan REST API
  JWT                  Membawa identitas user untuk protected request
  Next.js              Membangun frontend dan routing
  `fetch()`            Mengambil data dari backend
  `getStaticProps()`   Menyiapkan data untuk halaman
  `getStaticPaths()`   Menentukan dynamic paths
  `[slug].js`          Satu template untuk banyak halaman detail

**Target akhir:** mahasiswa mampu membangun frontend Next.js dari nol,
menggunakan endpoint backend yang sudah tersedia, menampilkan data MySQL
melalui REST API, melakukan authentication menggunakan JWT, dan membuat
halaman artikel dinamis berdasarkan slug.

------------------------------------------------------------------------

# Reference Documentation

-   Pages Router: https://nextjs.org/docs/pages
-   Pages and Layouts:
    https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts
-   Linking and Navigating:
    https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating
-   Dynamic Routes:
    https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes
-   getStaticProps:
    https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props
-   getStaticPaths:
    https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths
-   CSS-in-JS / Styled JSX:
    https://nextjs.org/docs/pages/guides/css-in-js
