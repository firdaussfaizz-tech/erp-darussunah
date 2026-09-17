-- Operasional lanjutan Kesiswaan: impor, pembinaan/prestasi, dan komunikasi wali.

create table if not exists public.student_import_batches (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete set null,
  file_name text not null,
  total_rows integer not null default 0 check (total_rows >= 0),
  accepted_rows integer not null default 0 check (accepted_rows >= 0),
  rejected_rows integer not null default 0 check (rejected_rows >= 0),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  category text not null check (category in ('pelanggaran', 'pembinaan_bk', 'prestasi')),
  title text not null,
  description text,
  points integer not null default 0,
  event_date date not null default current_date,
  follow_up text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_outbox (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid references public.guardians(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'email', 'in_app')),
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'siap_dikirim', 'terkirim')),
  created_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists student_import_batches_unit_created_idx on public.student_import_batches(unit_id, created_at desc);
create index if not exists student_events_student_date_idx on public.student_events(student_id, event_date desc);
create index if not exists guardian_outbox_student_created_idx on public.guardian_outbox(student_id, created_at desc);

alter table public.student_import_batches enable row level security;
alter table public.student_events enable row level security;
alter table public.guardian_outbox enable row level security;

create policy "student_import_batches_read_scope" on public.student_import_batches for select to authenticated
  using (public.is_admin_yayasan() or public.can_access_unit(unit_id));
create policy "student_import_batches_write_scope" on public.student_import_batches for all to authenticated
  using (public.is_admin_yayasan() or public.can_manage_unit(unit_id))
  with check (public.is_admin_yayasan() or public.can_manage_unit(unit_id));

create policy "student_events_read_scope" on public.student_events for select to authenticated
  using (public.can_access_student(student_id));
create policy "student_events_write_scope" on public.student_events for all to authenticated
  using (public.can_manage_student(student_id))
  with check (public.can_manage_student(student_id));

create policy "guardian_outbox_read_scope" on public.guardian_outbox for select to authenticated
  using (public.can_access_student(student_id));
create policy "guardian_outbox_write_scope" on public.guardian_outbox for all to authenticated
  using (public.can_manage_student(student_id))
  with check (public.can_manage_student(student_id));

grant select, insert, update, delete on public.student_import_batches, public.student_events, public.guardian_outbox to authenticated;
