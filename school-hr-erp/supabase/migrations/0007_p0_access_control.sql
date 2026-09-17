-- P0 access control for the GPT Supabase project.
-- Admin Yayasan is the only role allowed to manage ERP records.
create or replace function public.is_admin_yayasan()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin_yayasan'::public.user_role); $$;
revoke all on function public.is_admin_yayasan() from public;
grant execute on function public.is_admin_yayasan() to authenticated;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin_yayasan());
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin_yayasan()) with check (public.is_admin_yayasan());

do $$ declare t text; begin
  foreach t in array array['academic_years','semesters','students','guardians','classes','class_enrollments','student_status_history','subjects','teaching_assignments','schedules','attendance_records','assessment_types','grades','report_cards','fee_types','invoices','payments','facilities','asset_references','facility_bookings','announcements','messages','notification_log','assets','rooms','plans','procs','penghapusan','permintaan_aset','pengeluaran_aset','pemeliharaan','perbaikan','persediaan_barang','persediaan_transaksi'] loop
    execute format('drop policy if exists %I on public.%I', 'admin_manage_'||t, t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin_yayasan()) with check (public.is_admin_yayasan())', 'admin_manage_'||t, t);
  end loop;
end $$;

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id),
  table_name text not null, record_id uuid, action text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data jsonb, new_data jsonb, created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
drop policy if exists "audit_admin_read" on public.audit_log;
create policy "audit_admin_read" on public.audit_log for select to authenticated using (public.is_admin_yayasan());
create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.audit_log(actor_id,table_name,record_id,action,old_data,new_data) values ((select auth.uid()),TG_TABLE_NAME,coalesce(new.id,old.id),TG_OP,to_jsonb(old),to_jsonb(new)); return coalesce(new,old); end $$;
revoke all on function public.write_audit_log() from public;
grant execute on function public.write_audit_log() to authenticated;
do $$ declare t text; begin foreach t in array array['profiles','units','staff'] loop execute format('drop trigger if exists audit_%I on public.%I',t,t); execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',t,t); end loop; end $$;

-- Unit/class scope helpers. SECURITY DEFINER avoids policy recursion while keeping
-- the functions executable only by authenticated users.
create or replace function public.current_user_unit() returns uuid
language sql stable security definer set search_path = public
as $$ select unit_id from public.profiles where id=(select auth.uid()) $$;
revoke all on function public.current_user_unit() from public;
grant execute on function public.current_user_unit() to authenticated;
create or replace function public.can_access_unit(target_unit uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or (target_unit is not null and target_unit=public.current_user_unit()) $$;
revoke all on function public.can_access_unit(uuid) from public;
grant execute on function public.can_access_unit(uuid) to authenticated;
create or replace function public.can_access_class(target_class uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or exists (select 1 from public.classes c where c.id=target_class and (c.unit_id=public.current_user_unit() or c.homeroom_teacher_id=(select auth.uid()))) or exists (select 1 from public.teaching_assignments ta where ta.class_id=target_class and ta.teacher_id=(select auth.uid())) $$;
revoke all on function public.can_access_class(uuid) from public;
grant execute on function public.can_access_class(uuid) to authenticated;
create or replace function public.can_access_student(target_student uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or exists (select 1 from public.students s where s.id=target_student and s.current_unit_id=public.current_user_unit()) or exists (select 1 from public.class_enrollments ce where ce.student_id=target_student and public.can_access_class(ce.class_id)) $$;
revoke all on function public.can_access_student(uuid) from public;
grant execute on function public.can_access_student(uuid) to authenticated;
create or replace function public.can_access_label(target_label text) returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin_yayasan() or exists (select 1 from public.units u where target_label is not null and (lower(trim(target_label))=lower(trim(u.code)) or lower(trim(target_label))=lower(trim(u.name))) and u.id=public.current_user_unit()) $$;
revoke all on function public.can_access_label(text) from public;
grant execute on function public.can_access_label(text) to authenticated;

