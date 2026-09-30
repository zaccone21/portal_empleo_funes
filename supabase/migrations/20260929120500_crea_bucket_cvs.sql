-- cvs: private bucket with one PDF per applicant (P04, RF1.2.3, RNF1; D-026,
-- D-032). The path is always {applicant id}/cv.pdf, the same value that
-- postulantes.cv_ruta holds. The 5 MB limit is provisional (DT-004, Q-005).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf']);

-- The applicant uploads and replaces their own file. Replacing uses upsert,
-- which Supabase allows only with INSERT, SELECT and UPDATE policies
-- (docs: Storage > Access control). SELECT lets the applicant download their
-- own CV through the API; the screen does not offer it (D-026) and it exposes
-- nobody else's data. The postulantes subquery keeps companies and admins out.
create policy "cvs_insert_propio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cvs'
    and name = (select auth.uid())::text || '/cv.pdf'
    and exists (select 1 from public.postulantes p where p.id = (select auth.uid()))
  );

create policy "cvs_select_propio"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'cvs' and name = (select auth.uid())::text || '/cv.pdf');

create policy "cvs_update_propio"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cvs' and name = (select auth.uid())::text || '/cv.pdf')
  with check (bucket_id = 'cvs' and name = (select auth.uid())::text || '/cv.pdf');

create policy "cvs_delete_propio"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cvs' and name = (select auth.uid())::text || '/cv.pdf');

-- The Office reads every CV to create short-lived signed URLs (D-030).
create policy "cvs_select_admin"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'cvs' and (select private.es_admin()));
