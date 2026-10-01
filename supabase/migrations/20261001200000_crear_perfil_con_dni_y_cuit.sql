-- Actualizar la función crear_perfil para leer DNI y CUIT del user_metadata e insertarlos.
-- (RF1.2.1, RF1.3.2; Refactor de flujo de usuario).
-- Si el DNI o CUIT ya existen, la inserción fallará por el constraint UNIQUE y abortará el registro.

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nuevo_rol public.rol_usuario := case
    when new.raw_user_meta_data ->> 'rol' = 'empresa' then 'empresa'::public.rol_usuario
    else 'postulante'::public.rol_usuario
  end;
  metadata_dni text := new.raw_user_meta_data ->> 'dni';
  metadata_cuit text := new.raw_user_meta_data ->> 'cuit';
begin
  insert into public.perfiles (id, rol, email) values (new.id, nuevo_rol, new.email);

  if nuevo_rol = 'empresa' then
    insert into public.empresas (id, cuit) values (new.id, metadata_cuit);
  else
    insert into public.postulantes (id, dni) values (new.id, metadata_dni);
  end if;

  return new;
end;
$$;
