# HH FIT CLUB

Website company profile dan e-commerce UMKM HH FIT CLUB.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Zustand, Recharts
- Backend: Node.js, Express.js, Sequelize ORM, MySQL
- Payment: Midtrans sandbox
- Storage: Cloudinary
- Auth: JWT 7 hari

## Cara Menjalankan

### 1. Buat Database

```sql
CREATE DATABASE hhfitclub;
```

### 2. Backend

```bash
cd hhfitclub/server
npm install
copy .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Edit `.env` sesuai MySQL lokal:

```env
DB_HOST=127.0.0.1
DB_NAME=hhfitclub
DB_USER=root
DB_PASS=
JWT_SECRET=secret-yang-panjang
MIDTRANS_SERVER_KEY=SB-Mid-server-your-server-key
MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
PORT=5000
```

Health check:

```text
http://localhost:5000/health
```

### 3. Frontend

```bash
cd hhfitclub/client
npm install
copy .env.example .env
npm run dev
```

Buka:

```text
http://localhost:5173
```

### Akun Admin Seeder

```text
email: admin@hhfitclub.com
password: Admin12345
```

## Catatan Midtrans

Project memakai Midtrans sandbox. Isi `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, dan `VITE_MIDTRANS_CLIENT_KEY` dari dashboard sandbox Midtrans.

## Catatan Cloudinary

Untuk upload gambar produk dari dashboard admin, isi `CLOUDINARY_URL` dari dashboard Cloudinary. Kalau belum diisi, admin masih bisa memakai `image_url` manual.
