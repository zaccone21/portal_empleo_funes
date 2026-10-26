-- Dirección del postulante (P03, D-070): calle y número o zona de Funes, para
-- que la Oficina sepa dónde vive la persona. Es opcional en la base porque las
-- cuentas que ya existen no la tienen; la pantalla y el caso de uso la exigen
-- para guardar el perfil y para postularse.
--
-- No hace falta tocar permisos ni políticas: `postulantes` ya deja actualizar
-- su fila al propio postulante y leerla a la Oficina (migración 20260929120100).

alter table public.postulantes
  add column direccion text,
  add constraint postulantes_direccion_largo check (char_length(direccion) between 1 and 100);
