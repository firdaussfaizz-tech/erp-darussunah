-- ERP YPI Darussunah: modul siswa, akademik, keuangan, sarpras, komunikasi.
-- Melengkapi fondasi SIMPEG pada migrasi 0001-0003.

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  aktif boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  nama text not null,
  tingkat smallint not null check (tingkat between 1 and 12),
  wali_kelas_id uuid references public.employees(id) on delete set null,
  kapasitas smallint not null default 32 check (kapasitas > 0),
  created_at timestamptz not null default now(),
  unique (school_id, academic_year_id, nama)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  class_id uuid references public.classes(id) on delete set null,
  nis text not null unique,
  nisn text unique,
  nama text not null,
  jenis_kelamin text check (jenis_kelamin in ('L', 'P')),
  tempat_lahir text,
  tanggal_lahir date,
  nama_wali text,
  no_hp_wali text,
  alamat text,
  status text not null default 'aktif' check (status in ('aktif', 'lulus', 'pindah', 'nonaktif')),
  tahun_masuk smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  kode text not null,
  nama text not null,
  kelompok text,
  kkm numeric(5,2) not null default 75,
  created_at timestamptz not null default now(),
  unique (school_id, kode)
);

create table if not exists public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  tanggal date not null,
  status text not null check (status in ('hadir', 'sakit', 'izin', 'alpa')),
  catatan text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, tanggal)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  semester smallint not null check (semester in (1, 2)),
  jenis_penilaian text not null check (jenis_penilaian in ('tugas', 'formatif', 'uts', 'uas', 'praktik', 'projek')),
  nilai numeric(5,2) not null check (nilai between 0 and 100),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_types (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  nama text not null,
  nominal_default numeric(14,2) not null default 0,
  berulang boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fee_type_id uuid not null references public.fee_types(id) on delete restrict,
  periode text,
  nominal numeric(14,2) not null check (nominal >= 0),
  jatuh_tempo date,
  status text not null default 'belum_lunas' check (status in ('belum_lunas', 'sebagian', 'lunas', 'menunggak')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.student_invoices(id) on delete cascade,
  nominal numeric(14,2) not null check (nominal > 0),
  metode text not null check (metode in ('tunai', 'transfer', 'virtual_account', 'lainnya')),
  dibayar_pada timestamptz not null default now(),
  referensi text,
  verified_by uuid references auth.users(id) on delete set null
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  kode text not null unique,
  nama text not null,
  kategori text not null,
  lokasi text,
  kondisi text not null default 'baik' check (kondisi in ('baik', 'perlu_perbaikan', 'rusak')),
  jumlah integer not null default 1 check (jumlah >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  judul text not null,
  isi text not null,
  audiens text not null default 'semua' check (audiens in ('semua', 'pegawai', 'guru', 'siswa', 'orang_tua')),
  status text not null default 'draft' check (status in ('draft', 'terbit')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Pemeriksaan akses ditaruh di fungsi privat secara perilaku: tidak dapat dipanggil anon.
create or replace function public.erp_can_access_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and (
        ur.role in ('admin_yayasan', 'hr')
        or (ur.school_id = target_school_id and ur.role in ('admin_sekolah', 'kepala_sekolah', 'guru'))
      )
  );
$$;

create or replace function public.erp_can_manage_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and (
        ur.role in ('admin_yayasan', 'hr')
        or (ur.school_id = target_school_id and ur.role in ('admin_sekolah', 'kepala_sekolah'))
      )
  );
$$;

revoke all on function public.erp_can_access_school(uuid) from public, anon;
revoke all on function public.erp_can_manage_school(uuid) from public, anon;
grant execute on function public.erp_can_access_school(uuid) to authenticated;
grant execute on function public.erp_can_manage_school(uuid) to authenticated;

alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.student_attendance enable row level security;
alter table public.grades enable row level security;
alter table public.fee_types enable row level security;
alter table public.student_invoices enable row level security;
alter table public.student_payments enable row level security;
alter table public.facilities enable row level security;
alter table public.announcements enable row level security;

create policy academic_years_read on public.academic_years for select to authenticated using (true);
create policy academic_years_manage on public.academic_years for all to authenticated
  using (public.is_yayasan_admin()) with check (public.is_yayasan_admin());

create policy classes_read on public.classes for select to authenticated using (public.erp_can_access_school(school_id));
create policy classes_manage on public.classes for all to authenticated using (public.erp_can_manage_school(school_id)) with check (public.erp_can_manage_school(school_id));

create policy students_read on public.students for select to authenticated using (public.erp_can_access_school(school_id));
create policy students_manage on public.students for all to authenticated using (public.erp_can_manage_school(school_id)) with check (public.erp_can_manage_school(school_id));

create policy subjects_read on public.subjects for select to authenticated using (public.erp_can_access_school(school_id));
create policy subjects_manage on public.subjects for all to authenticated using (public.erp_can_manage_school(school_id)) with check (public.erp_can_manage_school(school_id));

create policy attendance_student_read on public.student_attendance for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_access_school(s.school_id)));
create policy attendance_student_manage on public.student_attendance for all to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)))
  with check (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)));

create policy grades_read on public.grades for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_access_school(s.school_id)));
create policy grades_manage on public.grades for all to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)))
  with check (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)));

create policy fee_types_read on public.fee_types for select to authenticated using (public.erp_can_access_school(school_id));
create policy fee_types_manage on public.fee_types for all to authenticated using (public.erp_can_manage_school(school_id)) with check (public.erp_can_manage_school(school_id));

create policy invoices_read on public.student_invoices for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_access_school(s.school_id)));
create policy invoices_manage on public.student_invoices for all to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)))
  with check (exists (select 1 from public.students s where s.id = student_id and public.erp_can_manage_school(s.school_id)));

create policy payments_read on public.student_payments for select to authenticated
  using (exists (
    select 1 from public.student_invoices i join public.students s on s.id = i.student_id
    where i.id = invoice_id and public.erp_can_access_school(s.school_id)
  ));
create policy payments_manage on public.student_payments for all to authenticated
  using (exists (
    select 1 from public.student_invoices i join public.students s on s.id = i.student_id
    where i.id = invoice_id and public.erp_can_manage_school(s.school_id)
  ))
  with check (exists (
    select 1 from public.student_invoices i join public.students s on s.id = i.student_id
    where i.id = invoice_id and public.erp_can_manage_school(s.school_id)
  ));

create policy facilities_read on public.facilities for select to authenticated using (public.erp_can_access_school(school_id));
create policy facilities_manage on public.facilities for all to authenticated using (public.erp_can_manage_school(school_id)) with check (public.erp_can_manage_school(school_id));

create policy announcements_read on public.announcements for select to authenticated
  using (school_id is null or public.erp_can_access_school(school_id));
create policy announcements_manage on public.announcements for all to authenticated
  using (public.is_yayasan_admin() or (school_id is not null and public.erp_can_manage_school(school_id)))
  with check (public.is_yayasan_admin() or (school_id is not null and public.erp_can_manage_school(school_id)));

grant select on public.academic_years, public.classes, public.students, public.subjects,
  public.student_attendance, public.grades, public.fee_types, public.student_invoices,
  public.student_payments, public.facilities, public.announcements to authenticated;
grant insert, update, delete on public.academic_years, public.classes, public.students,
  public.subjects, public.student_attendance, public.grades, public.fee_types,
  public.student_invoices, public.student_payments, public.facilities, public.announcements to authenticated;

insert into public.academic_years (nama, tanggal_mulai, tanggal_selesai, aktif)
values ('2026/2027', '2026-07-01', '2027-06-30', true)
on conflict (nama) do update set aktif = excluded.aktif;

