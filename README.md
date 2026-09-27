# Kalender Bersama

Kalender bersama untuk maksimal 6 orang, mirip Life360 tapi untuk jadwal.
Setiap **environment** (grup) punya kalendernya sendiri; anggota lain di
environment yang sama bisa lihat kegiatan satu sama lain, tapi hanya boleh
edit/hapus kegiatan miliknya sendiri.

Login pakai **username + password** saja — tidak ada email sama sekali di UI,
biar simpel untuk dipakai teman/keluarga (lihat bagian "Autentikasi" di bawah).

Tech stack: Next.js App Router + TypeScript + Tailwind, Supabase (Auth,
Postgres, Row Level Security, Realtime), deploy ke Vercel.

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (Free tier cukup).
2. Buka **SQL Editor**, tempel seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu jalankan (Run).
   File ini membuat semua tabel, trigger, fungsi RPC, dan RLS policy sekaligus. Aman dijalankan ulang.
3. Buka **Project Settings → API**, salin tiga nilai ini:
   - `Project URL`
   - `anon public` key
   - `service_role` key (di bawah anon key, klik "Reveal") — **rahasia, jangan pernah dipakai di kode client-side**

## 2. Setup project lokal

```bash
npm install
cp .env.local.example .env.local
```

Isi `.env.local` dengan tiga nilai dari langkah di atas:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Jalankan dev server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## 3. Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di [vercel.com](https://vercel.com) (Hobby plan gratis cukup).
3. Tambahkan ketiga environment variables yang sama di Vercel Project Settings → Environment Variables
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy.

## Autentikasi (username + password, tanpa email)

Supabase Auth secara internal tetap butuh kolom email, jadi setiap username
dipetakan deterministik ke email palsu `username@kalender.local`
(lihat [`lib/auth-username.ts`](lib/auth-username.ts)). Supaya email palsu ini
tidak pernah memblokir login di langkah "konfirmasi email" (yang mustahil
diselesaikan karena emailnya tidak nyata), pendaftaran akun **tidak** lewat
`supabase.auth.signUp()` biasa, tapi lewat route server
[`app/api/signup/route.ts`](app/api/signup/route.ts) yang memakai
`service_role` key untuk langsung membuat akun berstatus "confirmed"
(`admin.createUser({ email_confirm: true, ... })`). Login sesudahnya pakai
`signInWithPassword()` seperti biasa dari browser.

Aturan username: 3–20 karakter, huruf kecil/angka/titik/underscore
(lihat `USERNAME_RULES_LABEL` di `lib/auth-username.ts`).

## Struktur project

```
app/
  login/, register/        halaman autentikasi (username + password)
  api/signup/               route server: buat akun via Supabase admin API
  environments/             daftar environment saya + buat/gabung
  environments/[id]/        kalender per environment (Day/Week/Month/Year)
components/
  calendar/                 semua komponen kalender (header, grid, form, dsb)
  ui/                       Modal & LoadingScreen generik
  ThemeProvider.tsx         context tema (default / putih pinky / putih biru)
lib/
  supabase/                 client browser/server/admin + refresh sesi di middleware
  auth-username.ts          pemetaan username <-> email palsu buat Supabase Auth
  colors.ts                 warna deterministik per anggota, per tema
  date-utils.ts             helper tanggal (date-fns)
supabase/schema.sql          skema + RLS, siap tempel ke SQL editor Supabase
```

## Fitur

- Kalender Hari / Minggu / Bulan / Tahun, gaya Apple Calendar.
- Login username + password saja, tanpa email.
- Warna berbeda otomatis per anggota di setiap kegiatan, mengikuti tema aktif.
- 3 tema tampilan: Default, Putih Pinky, Putih Biru — termasuk warna kotak kegiatan.
- Environment: buat, gabung via kode undangan 6 karakter, atau tambah anggota
  langsung lewat username. Role owner (hapus environment/keluarkan anggota) vs
  member (bisa keluar sendiri).
- Isolasi antar environment dijamin oleh **Postgres Row Level Security**, bukan
  cuma filter di client — lihat `supabase/schema.sql`.
- Realtime: kegiatan baru dari anggota lain muncul otomatis tanpa refresh.
- PWA: bisa dipasang ke layar utama di Android (tombol "Pasang") maupun iOS
  (instruksi Share → Add to Home Screen).
- Pesan loading yang jelas saat Supabase free-tier baru "bangun" dari auto-pause.

## Catatan keamanan

- Semua isolasi data antar environment dan kepemilikan kegiatan ditegakkan lewat
  RLS policy di database (`supabase/schema.sql`), bukan cuma logika di frontend —
  jadi tetap aman meski seseorang memanggil Supabase API secara langsung.
- `SUPABASE_SERVICE_ROLE_KEY` melewati RLS sepenuhnya. Dipakai hanya di satu
  tempat server-side ([`lib/supabase/admin.ts`](lib/supabase/admin.ts)) dan
  tidak pernah dikirim ke browser — jangan tambahkan prefix `NEXT_PUBLIC_`
  padanya atau meng-importnya dari Client Component.
