-- Admin Yayasan dan HR mempertahankan akses lintas unit secara eksplisit.
-- Fungsi erp_has_role sendiri tetap hanya mencocokkan peran unit.
drop policy if exists students_insert on public.students;
create policy students_insert on public.students for insert to authenticated with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists students_update on public.students;
create policy students_update on public.students for update to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists students_delete on public.students;
create policy students_delete on public.students for delete to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists classes_insert on public.classes;
create policy classes_insert on public.classes for insert to authenticated with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists classes_update on public.classes;
create policy classes_update on public.classes for update to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists classes_delete on public.classes;
create policy classes_delete on public.classes for delete to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists subjects_insert on public.subjects;
create policy subjects_insert on public.subjects for insert to authenticated with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists subjects_update on public.subjects;
create policy subjects_update on public.subjects for update to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists subjects_delete on public.subjects;
create policy subjects_delete on public.subjects for delete to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists fee_types_insert on public.fee_types;
create policy fee_types_insert on public.fee_types for insert to authenticated with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists fee_types_update on public.fee_types;
create policy fee_types_update on public.fee_types for update to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])) with check (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));
drop policy if exists fee_types_delete on public.fee_types;
create policy fee_types_delete on public.fee_types for delete to authenticated using (public.is_yayasan_admin() or public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']));

drop policy if exists announcements_insert on public.announcements;
create policy announcements_insert on public.announcements for insert to authenticated with check (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));
drop policy if exists announcements_update on public.announcements;
create policy announcements_update on public.announcements for update to authenticated using (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah']))) with check (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));
drop policy if exists announcements_delete on public.announcements;
create policy announcements_delete on public.announcements for delete to authenticated using (public.is_yayasan_admin() or (school_id is not null and public.erp_has_role(school_id, array['admin_sekolah','kepala_sekolah'])));

drop policy if exists attendance_student_insert on public.student_attendance;
create policy attendance_student_insert on public.student_attendance for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));
drop policy if exists attendance_student_update on public.student_attendance;
create policy attendance_student_update on public.student_attendance for update to authenticated using (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])))) with check (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));
drop policy if exists attendance_student_delete on public.student_attendance;
create policy attendance_student_delete on public.student_attendance for delete to authenticated using (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));

drop policy if exists grades_insert on public.grades;
create policy grades_insert on public.grades for insert to authenticated with check (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));
drop policy if exists grades_update on public.grades;
create policy grades_update on public.grades for update to authenticated using (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru'])))) with check (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));
drop policy if exists grades_delete on public.grades;
create policy grades_delete on public.grades for delete to authenticated using (exists (select 1 from public.students s join public.subjects sub on sub.school_id = s.school_id where s.id = student_id and sub.id = subject_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah','guru']))));

drop policy if exists invoices_insert on public.student_invoices;
create policy invoices_insert on public.student_invoices for insert to authenticated with check (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));
drop policy if exists invoices_update on public.student_invoices;
create policy invoices_update on public.student_invoices for update to authenticated using (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])))) with check (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));
drop policy if exists invoices_delete on public.student_invoices;
create policy invoices_delete on public.student_invoices for delete to authenticated using (exists (select 1 from public.students s where s.id = student_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));

drop policy if exists payments_insert on public.student_payments;
create policy payments_insert on public.student_payments for insert to authenticated with check (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));
drop policy if exists payments_update on public.student_payments;
create policy payments_update on public.student_payments for update to authenticated using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah'])))) with check (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));
drop policy if exists payments_delete on public.student_payments;
create policy payments_delete on public.student_payments for delete to authenticated using (exists (select 1 from public.student_invoices i join public.students s on s.id = i.student_id where i.id = invoice_id and (public.is_yayasan_admin() or public.erp_has_role(s.school_id, array['admin_sekolah','kepala_sekolah']))));
