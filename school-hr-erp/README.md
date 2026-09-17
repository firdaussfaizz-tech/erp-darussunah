# ERP Darussunah

ERP terpadu untuk yayasan yang mengelola unit SD, SMP, dan SMA. Aplikasi memakai React + Vite, Supabase, dan Vercel.

## Modul

- Dashboard lintas unit
- Kesiswaan dan data induk siswa
- Akademik, jadwal, presensi, nilai, dan rapor
- Keuangan, tagihan, pembayaran, dan tunggakan
- SDM dan kepegawaian
- Sarana dan prasarana
- Komunikasi dan pengumuman
- Pusat laporan

## Menjalankan aplikasi

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL dan publishable key Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Jangan pernah menaruh secret key atau service-role key di aplikasi frontend.

## Database

Jalankan migrasi dalam `supabase/migrations` secara berurutan. Migrasi `0004_core_erp_modules.sql` menambahkan modul siswa, akademik, keuangan, sarpras, dan komunikasi serta mengaktifkan Row Level Security.

## Deployment

Proyek disiapkan untuk Vercel. Atur Root Directory ke `school-hr-erp` bila menghubungkan repository dari root, lalu tambahkan kedua environment variable Supabase untuk Production dan Preview.

Konfigurasi aktif ERP menggunakan project Supabase GPT `mfewryswvszwwjsvfqbk` (YPI Darussunah, region ap-south-1). Project Claude dipisahkan dan tidak digunakan oleh aplikasi ini.

Mode demo tersedia pada halaman login agar antarmuka dapat ditinjau tanpa akun Supabase. Data pada mode demo tidak ditulis ke database.
