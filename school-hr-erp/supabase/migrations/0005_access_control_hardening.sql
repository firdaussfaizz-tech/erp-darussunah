-- Hak akses ERP: pemisahan peran baca/tulis dan pembatasan unit sekolah.

create or replace function public.erp_has_role(target_school_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and (ur.role::text = any(allowed_roles))
      and (ur.role::text in ('admin_yayasan', 'hr') or ur.school_id = target_school_id)
  );
$$;

revoke all on function public.erp_has_role(uuid, text[]) from public, anon;
grant execute on function public.erp_has_role(uuid, text[]) to authenticated;

-- Siswa, kelas, dan mapel: guru dapat membaca; pengelolaan hanya admin sekolah.
drop policy if exists classes_read on public.classes;
drop policy if exists classes_manage on public.classes;
create policy classes_read on public.classes for select to authenticated
  using (public.erp_can_access_school(school_id));
create policy classes_manage on public.classes for all to authenticated
  using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))
  with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists students_read on public.students;
drop policy if exists students_manage on public.students;
create policy students_read on public.students for select to authenticated
  using (public.erp_can_access_school(school_id));
create policy students_manage on public.students for all to authenticated
  using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))
  with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists subjects_read on public.subjects;
drop policy if exists subjects_manage on public.subjects;
create policy subjects_read on public.subjects for select to authenticated
  using (public.erp_can_access_school(school_id));
create policy subjects_manage on public.subjects for all to authenticated
  using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))
  with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

-- Presensi siswa dapat dicatat guru pada unitnya; admin sekolah tetap dapat mengelola.
drop policy if exists attendance_student_read on public.student_attendance;
drop policy if exists attendance_student_manage on public.student_attendance;
create policy attendance_student_read on public.student_attendance for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_access_school(s.school_id)));
create policy attendance_student_manage on public.student_attendance for all to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])))
  with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));

-- Nilai dapat dikelola guru pada unit yang sama, tanpa akses lintas sekolah.
drop policy if exists grades_read on public.grades;
drop policy if exists grades_manage on public.grades;
create policy grades_read on public.grades for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_can_access_school(s.school_id)));
create policy grades_manage on public.grades for all to authenticated
  using (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])))
  with check (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));

-- Keuangan: hanya yayasan/HR dan pengelola sekolah, bukan guru/staff.
drop policy if exists fee_types_read on public.fee_types;
drop policy if exists fee_types_manage on public.fee_types;
create policy fee_types_read on public.fee_types for select to authenticated
  using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy fee_types_manage on public.fee_types for all to authenticated
  using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))
  with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists invoices_read on public.student_invoices;
drop policy if exists invoices_manage on public.student_invoices;
create policy invoices_read on public.student_invoices for select to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy invoices_manage on public.student_invoices for all to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])))
  with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));

drop policy if exists payments_read on public.student_payments;
drop policy if exists payments_manage on public.student_payments;
create policy payments_read on public.student_payments for select to authenticated
  using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy payments_manage on public.student_payments for all to authenticated
  using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])))
  with check (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));

-- Pengumuman dapat dibaca semua pengguna unit, tetapi hanya pengelola yang menerbitkan.
drop policy if exists announcements_read on public.announcements;
drop policy if exists announcements_manage on public.announcements;
create policy announcements_read on public.announcements for select to authenticated
  using (school_id is null or public.erp_can_access_school(school_id));
create policy announcements_manage on public.announcements for all to authenticated
  using (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])))
  with check (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));

create index if not exists classes_school_year_idx on public.classes (school_id, academic_year_id);
create index if not exists students_school_class_idx on public.students (school_id, class_id);
create index if not exists subjects_school_idx on public.subjects (school_id);
create index if not exists attendance_student_date_idx on public.student_attendance (student_id, tanggal);
create index if not exists grades_student_subject_idx on public.grades (student_id, subject_id);
create index if not exists invoices_student_status_idx on public.student_invoices (student_id, status);
create index if not exists payments_invoice_idx on public.student_payments (invoice_id);
create index if not exists announcements_school_status_idx on public.announcements (school_id, status);

-- Pisahkan policy baca dan policy tulis agar evaluasi RLS tidak tumpang tindih.
drop policy if exists classes_manage on public.classes;
create policy classes_insert on public.classes for insert to authenticated with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy classes_update on public.classes for update to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy classes_delete on public.classes for delete to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists students_manage on public.students;
create policy students_insert on public.students for insert to authenticated with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy students_update on public.students for update to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy students_delete on public.students for delete to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists subjects_manage on public.subjects;
create policy subjects_insert on public.subjects for insert to authenticated with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy subjects_update on public.subjects for update to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy subjects_delete on public.subjects for delete to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists attendance_student_manage on public.student_attendance;
create policy attendance_student_insert on public.student_attendance for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
create policy attendance_student_update on public.student_attendance for update to authenticated using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))) with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
create policy attendance_student_delete on public.student_attendance for delete to authenticated using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
drop policy if exists grades_manage on public.grades;
create policy grades_insert on public.grades for insert to authenticated with check (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
create policy grades_update on public.grades for update to authenticated using (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))) with check (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
create policy grades_delete on public.grades for delete to authenticated using (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])));
drop policy if exists fee_types_manage on public.fee_types;
create policy fee_types_insert on public.fee_types for insert to authenticated with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy fee_types_update on public.fee_types for update to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
create policy fee_types_delete on public.fee_types for delete to authenticated using (public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists invoices_manage on public.student_invoices;
create policy invoices_insert on public.student_invoices for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy invoices_update on public.student_invoices for update to authenticated using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))) with check (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy invoices_delete on public.student_invoices for delete to authenticated using (exists (select 1 from public.students s where s.id = student_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
drop policy if exists payments_manage on public.student_payments;
create policy payments_insert on public.student_payments for insert to authenticated with check (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy payments_update on public.student_payments for update to authenticated using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))) with check (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
create policy payments_delete on public.student_payments for delete to authenticated using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])));
drop policy if exists announcements_manage on public.announcements;
create policy announcements_insert on public.announcements for insert to authenticated with check (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));
create policy announcements_update on public.announcements for update to authenticated using (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))) with check (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));
create policy announcements_delete on public.announcements for delete to authenticated using (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));

-- Fungsi bantuan hanya boleh dipanggil oleh pengguna login; trigger tetap berjalan sebagai owner.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.current_employee_id() from public, anon;
revoke execute on function public.employee_school_id(uuid) from public, anon;
revoke execute on function public.has_school_access(uuid) from public, anon;
revoke execute on function public.is_yayasan_admin() from public, anon;
revoke execute on function public.erp_can_access_school(uuid) from public, anon;
revoke execute on function public.erp_can_manage_school(uuid) from public, anon;
alter function public.set_updated_at() set search_path = public;
