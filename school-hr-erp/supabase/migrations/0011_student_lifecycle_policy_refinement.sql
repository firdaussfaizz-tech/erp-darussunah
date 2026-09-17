-- Pisahkan kebijakan tulis agar SELECT tidak ikut menjadi kebijakan permisif yang lebar.

drop policy if exists "student_import_batches_write_scope" on public.student_import_batches;
create policy "student_import_batches_insert_scope" on public.student_import_batches for insert to authenticated
  with check (public.is_admin_yayasan() or public.can_manage_unit(unit_id));
create policy "student_import_batches_update_scope" on public.student_import_batches for update to authenticated
  using (public.is_admin_yayasan() or public.can_manage_unit(unit_id))
  with check (public.is_admin_yayasan() or public.can_manage_unit(unit_id));
create policy "student_import_batches_delete_scope" on public.student_import_batches for delete to authenticated
  using (public.is_admin_yayasan() or public.can_manage_unit(unit_id));

drop policy if exists "student_events_write_scope" on public.student_events;
create policy "student_events_insert_scope" on public.student_events for insert to authenticated
  with check (public.can_manage_student(student_id));
create policy "student_events_update_scope" on public.student_events for update to authenticated
  using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));
create policy "student_events_delete_scope" on public.student_events for delete to authenticated
  using (public.can_manage_student(student_id));

drop policy if exists "guardian_outbox_write_scope" on public.guardian_outbox;
create policy "guardian_outbox_insert_scope" on public.guardian_outbox for insert to authenticated
  with check (public.can_manage_student(student_id));
create policy "guardian_outbox_update_scope" on public.guardian_outbox for update to authenticated
  using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));
create policy "guardian_outbox_delete_scope" on public.guardian_outbox for delete to authenticated
  using (public.can_manage_student(student_id));
