-- Unit leadership access: Admin Unit, Kepala Sekolah, and Wakil Kepala Sekolah.
-- They may administer academic data only in the unit assigned to their profile.

alter type public.user_role add value if not exists 'kepala_sekolah';
alter type public.user_role add value if not exists 'wakil_kepala_sekolah';

create or replace function public.is_unit_manager()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('admin_unit'::public.user_role, 'kepala_sekolah'::public.user_role, 'wakil_kepala_sekolah'::public.user_role)
  )
$$;
revoke all on function public.is_unit_manager() from public;
grant execute on function public.is_unit_manager() to authenticated;

create or replace function public.can_read_unit(target_unit uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or (target_unit is not null and target_unit = public.current_user_unit()) $$;
revoke all on function public.can_read_unit(uuid) from public;
grant execute on function public.can_read_unit(uuid) to authenticated;

create or replace function public.can_manage_unit(target_unit uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or (public.is_unit_manager() and target_unit is not null and target_unit = public.current_user_unit()) $$;
revoke all on function public.can_manage_unit(uuid) from public;
grant execute on function public.can_manage_unit(uuid) to authenticated;

create or replace function public.can_access_class(target_class uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_admin_yayasan()
    or exists (select 1 from public.classes c where c.id = target_class and public.is_unit_manager() and c.unit_id = public.current_user_unit())
    or exists (select 1 from public.classes c where c.id = target_class and c.homeroom_teacher_id = (select auth.uid()))
    or exists (select 1 from public.teaching_assignments ta where ta.class_id = target_class and ta.teacher_id = (select auth.uid()))
$$;
revoke all on function public.can_access_class(uuid) from public;
grant execute on function public.can_access_class(uuid) to authenticated;

create or replace function public.can_manage_class(target_class uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_admin_yayasan()
    or exists (select 1 from public.classes c where c.id = target_class and public.is_unit_manager() and c.unit_id = public.current_user_unit())
$$;
revoke all on function public.can_manage_class(uuid) from public;
grant execute on function public.can_manage_class(uuid) to authenticated;

create or replace function public.can_access_student(target_student uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_admin_yayasan()
    or exists (select 1 from public.students s where s.id = target_student and public.is_unit_manager() and s.current_unit_id = public.current_user_unit())
    or exists (select 1 from public.class_enrollments ce where ce.student_id = target_student and public.can_access_class(ce.class_id))
$$;
revoke all on function public.can_access_student(uuid) from public;
grant execute on function public.can_access_student(uuid) to authenticated;

create or replace function public.can_manage_student(target_student uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_admin_yayasan()
    or exists (select 1 from public.students s where s.id = target_student and public.is_unit_manager() and s.current_unit_id = public.current_user_unit())
$$;
revoke all on function public.can_manage_student(uuid) from public;
grant execute on function public.can_manage_student(uuid) to authenticated;

create or replace function public.can_read_profile(target_profile uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select target_profile = (select auth.uid())
    or public.is_admin_yayasan()
    or exists (select 1 from public.profiles p where p.id = target_profile and public.is_unit_manager() and p.unit_id = public.current_user_unit())
$$;
revoke all on function public.can_read_profile(uuid) from public;
grant execute on function public.can_read_profile(uuid) to authenticated;

drop policy if exists "profiles_unit_manager_read" on public.profiles;
create policy "profiles_unit_manager_read" on public.profiles for select to authenticated using (public.can_read_profile(id));

drop policy if exists "academic_years_unit_manager_read" on public.academic_years;
create policy "academic_years_unit_manager_read" on public.academic_years for select to authenticated using (public.is_admin_yayasan() or public.is_unit_manager());
drop policy if exists "semesters_unit_manager_read" on public.semesters;
create policy "semesters_unit_manager_read" on public.semesters for select to authenticated using (public.is_admin_yayasan() or public.is_unit_manager());

drop policy if exists "students_unit_scope" on public.students;
drop policy if exists "students_read_scope" on public.students;
drop policy if exists "students_insert_scope" on public.students;
drop policy if exists "students_update_scope" on public.students;
drop policy if exists "students_delete_scope" on public.students;
create policy "students_read_scope" on public.students for select to authenticated using (public.can_access_student(id));
create policy "students_insert_scope" on public.students for insert to authenticated with check (public.can_manage_unit(current_unit_id));
create policy "students_update_scope" on public.students for update to authenticated using (public.can_manage_student(id)) with check (public.can_manage_unit(current_unit_id));
create policy "students_delete_scope" on public.students for delete to authenticated using (public.can_manage_student(id));

drop policy if exists "classes_unit_scope" on public.classes;
drop policy if exists "classes_read_scope" on public.classes;
drop policy if exists "classes_insert_scope" on public.classes;
drop policy if exists "classes_update_scope" on public.classes;
drop policy if exists "classes_delete_scope" on public.classes;
create policy "classes_read_scope" on public.classes for select to authenticated using (public.can_access_class(id));
create policy "classes_insert_scope" on public.classes for insert to authenticated with check (public.can_manage_unit(unit_id));
create policy "classes_update_scope" on public.classes for update to authenticated using (public.can_manage_class(id)) with check (public.can_manage_unit(unit_id));
create policy "classes_delete_scope" on public.classes for delete to authenticated using (public.can_manage_class(id));

drop policy if exists "subjects_unit_scope" on public.subjects;
drop policy if exists "subjects_read_scope" on public.subjects;
drop policy if exists "subjects_insert_scope" on public.subjects;
drop policy if exists "subjects_update_scope" on public.subjects;
drop policy if exists "subjects_delete_scope" on public.subjects;
create policy "subjects_read_scope" on public.subjects for select to authenticated using (public.can_read_unit(unit_id));
create policy "subjects_insert_scope" on public.subjects for insert to authenticated with check (public.can_manage_unit(unit_id));
create policy "subjects_update_scope" on public.subjects for update to authenticated using (public.can_manage_unit(unit_id)) with check (public.can_manage_unit(unit_id));
create policy "subjects_delete_scope" on public.subjects for delete to authenticated using (public.can_manage_unit(unit_id));

drop policy if exists "staff_unit_scope" on public.staff;
drop policy if exists "staff_read_scope" on public.staff;
drop policy if exists "staff_update_scope" on public.staff;
create policy "staff_read_scope" on public.staff for select to authenticated using (profile_id = (select auth.uid()) or public.can_read_unit(unit_id));
create policy "staff_update_scope" on public.staff for update to authenticated using (public.can_manage_unit(unit_id)) with check (public.can_manage_unit(unit_id));

drop policy if exists "guardians_student_scope" on public.guardians;
drop policy if exists "guardians_read_scope" on public.guardians;
drop policy if exists "guardians_write_scope" on public.guardians;
create policy "guardians_read_scope" on public.guardians for select to authenticated using (public.can_access_student(student_id));
create policy "guardians_write_scope" on public.guardians for all to authenticated using (public.can_manage_student(student_id)) with check (public.can_manage_student(student_id));

drop policy if exists "enrollments_class_scope" on public.class_enrollments;
drop policy if exists "enrollments_read_scope" on public.class_enrollments;
drop policy if exists "enrollments_write_scope" on public.class_enrollments;
create policy "enrollments_read_scope" on public.class_enrollments for select to authenticated using (public.can_access_class(class_id));
create policy "enrollments_write_scope" on public.class_enrollments for all to authenticated using (public.can_manage_class(class_id)) with check (public.can_manage_class(class_id));

drop policy if exists "teaching_unit_class_scope" on public.teaching_assignments;
drop policy if exists "teaching_read_scope" on public.teaching_assignments;
drop policy if exists "teaching_write_scope" on public.teaching_assignments;
create policy "teaching_read_scope" on public.teaching_assignments for select to authenticated using (teacher_id = (select auth.uid()) or public.can_access_class(class_id));
create policy "teaching_write_scope" on public.teaching_assignments for all to authenticated using (public.can_manage_class(class_id)) with check (public.can_manage_class(class_id));

-- These helpers are used only by RLS. They must never be callable by anonymous API users.
revoke execute on function public.is_admin_yayasan() from anon;
revoke execute on function public.current_user_unit() from anon;
revoke execute on function public.can_access_unit(uuid) from anon;
revoke execute on function public.can_access_class(uuid) from anon;
revoke execute on function public.can_access_student(uuid) from anon;
revoke execute on function public.can_access_label(text) from anon;
revoke execute on function public.is_unit_manager() from anon;
revoke execute on function public.can_read_unit(uuid) from anon;
revoke execute on function public.can_manage_unit(uuid) from anon;
revoke execute on function public.can_manage_class(uuid) from anon;
revoke execute on function public.can_manage_student(uuid) from anon;
revoke execute on function public.can_read_profile(uuid) from anon;
revoke execute on function public.write_audit_log() from anon;
