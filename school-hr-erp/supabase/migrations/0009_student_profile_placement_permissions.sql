-- Kesiswaan: izin siswa and a closed timestamp for class-placement history.
create table if not exists public.student_permissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  permission_type text not null check (permission_type in ('izin','sakit','dispensasi')),
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'diajukan' check (status in ('diajukan','disetujui','ditolak')),
  requested_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);
alter table public.student_permissions enable row level security;
create policy "student_permissions_read_scope" on public.student_permissions for select to authenticated using (public.can_access_student(student_id));
create policy "student_permissions_write_scope" on public.student_permissions for all to authenticated using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));
alter table public.class_enrollments add column if not exists ended_at timestamptz;
create index if not exists student_permissions_student_dates_idx on public.student_permissions(student_id, start_date desc);
