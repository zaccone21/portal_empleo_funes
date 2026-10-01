-- An applicant keeps seeing the offers they applied to after the Office
-- closes them, so "Mis postulaciones" (P07, RF1.2.4) always shows which offer
-- it was. Before this, RLS only showed published offers to applicants.
-- The subquery reads postulaciones through its own RLS (the applicant's own
-- rows), and postulaciones' select policies do not read ofertas, so there is
-- no policy loop.

create policy "ofertas_select_postuladas"
  on public.ofertas
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.postulaciones p
      -- Qualified: a bare "id" would be postulaciones.id inside this subquery.
      where p.oferta_id = ofertas.id and p.postulante_id = (select auth.uid())
    )
  );
