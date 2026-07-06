-- RPC aislado para el Kardex Digital Público.
--
-- Este archivo NO modifica tablas, NO habilita/deshabilita RLS, NO elimina
-- políticas y NO cambia permisos usados por otras aplicaciones. Solamente
-- crea dos funciones nuevas y permite ejecutarlas con la clave publicable.
-- Ejecutarlo desde Supabase > SQL Editor con el propietario del proyecto.

create or replace function public.kardex_listado_publico()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(
    jsonb_agg(
      jugador.payload
      order by jugador.payload->>'apellidos', jugador.payload->>'nombres'
    ),
    '[]'::jsonb
  )
  from (
    select jsonb_build_object(
      'ci', j.ci::text,
      'nombres', j.nombres,
      'apellidos', j.apellidos,
      'historial_participacion', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'año', hp."año",
            'condicion_pase', hp.condicion_pase,
            'equipos', jsonb_build_object('nombre', e.nombre)
          )
          order by hp."año" desc
        )
        from public.historial_participacion hp
        left join public.equipos e on e.id = hp.equipo_id
        where hp.jugador_ci = j.ci
          and lower(btrim(coalesce(hp.condicion_pase, ''))) <> 'anulada'
      ), '[]'::jsonb)
    ) as payload
    from public.jugadores j
  ) as jugador;
$function$;

create or replace function public.kardex_jugador_publico(
  p_ci text,
  p_gestion integer default 2026
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'ci', j.ci::text,
    'nombres', j.nombres,
    'apellidos', j.apellidos,
    'historial_participacion', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'año', hp."año",
          'condicion_pase', hp.condicion_pase,
          'equipos', jsonb_build_object('nombre', e.nombre)
        )
      ), '[]'::jsonb)
      from public.historial_participacion hp
      left join public.equipos e on e.id = hp.equipo_id
      where hp.jugador_ci = j.ci
        and hp."año" = p_gestion
        and lower(btrim(coalesce(hp.condicion_pase, ''))) <> 'anulada'
    )
  )
  from public.jugadores j
  where j.ci::text = p_ci
    and exists (
      select 1
      from public.historial_participacion vigente
      where vigente.jugador_ci = j.ci
        and vigente."año" = p_gestion
        and lower(btrim(coalesce(vigente.condicion_pase, ''))) <> 'anulada'
    )
  limit 1;
$function$;

-- Las funciones SECURITY DEFINER leen con los permisos de su propietario,
-- pero solamente devuelven los campos incluidos explícitamente arriba.
revoke all on function public.kardex_listado_publico() from public;
revoke all on function public.kardex_jugador_publico(text, integer) from public;

grant execute on function public.kardex_listado_publico() to anon, authenticated;
grant execute on function public.kardex_jugador_publico(text, integer) to anon, authenticated;
