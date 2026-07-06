# Kardex Digital Público · Liga de Fútbol Vinto

Aplicación React mobile-first para consultar jugadores registrados en la Liga.

## Rutas

- `/`: buscador predictivo por nombre, apellido o CI. El resultado público muestra únicamente fotografía, nombre e historial de clubes.
- `/:ci`: credencial abierta desde el QR del carnet físico. Muestra la participación vigente de la gestión 2026.

## Desarrollo

```bash
npm install
npm run dev
```

Las variables admitidas están documentadas en `.env.example`. La clave incluida es publicable; nunca debe usarse aquí una `service_role`.

## Supabase y seguridad

Esta aplicación no modifica las tablas ni las políticas RLS compartidas. Para permitir la consulta pública aislada, `supabase/kardex-public-rpc.sql` crea dos funciones de solo lectura que devuelven exclusivamente `ci`, `nombres`, `apellidos`, gestión, condición de pase y nombre del equipo.

El SQL no contiene `ALTER TABLE`, no elimina políticas y no revoca permisos sobre tablas. No cambies las políticas RLS existentes sin auditar primero las demás aplicaciones conectadas al mismo proyecto de Supabase.

El CI necesariamente llega al navegador porque forma parte de la URL del QR, permite la búsqueda exacta y determina el nombre de la fotografía. Se muestra junto al nombre en los resultados y en la credencial individual abierta mediante `/:ci`.

El buscador guarda el JSON público en `localStorage` bajo la clave `lfv:kardex-public-players:v1`. En visitas posteriores utiliza inmediatamente esa copia y la actualiza en segundo plano desde Supabase.

## Despliegue

El hosting debe redirigir cualquier ruta desconocida a `/index.html` para que enlaces como `/14512574` funcionen al abrirse directamente o recargarse.
