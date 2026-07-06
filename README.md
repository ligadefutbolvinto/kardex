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

Esta aplicación no incluye migraciones, políticas RLS ni comandos que modifiquen la base de datos compartida. El frontend ejecuta exclusivamente operaciones `SELECT` y solicita solamente `ci`, `nombres`, `apellidos`, gestión, condición de pase y nombre del equipo.

No cambies las políticas RLS existentes sin auditar primero las demás aplicaciones conectadas al mismo proyecto de Supabase. Los permisos efectivos continúan siendo los que ya estén configurados en Supabase.

El CI necesariamente llega al navegador porque forma parte de la URL del QR, permite la búsqueda exacta y determina el nombre de la fotografía. En el buscador no se renderiza; solo aparece en la credencial individual abierta mediante `/:ci`.

## Despliegue

El hosting debe redirigir cualquier ruta desconocida a `/index.html` para que enlaces como `/14512574` funcionen al abrirse directamente o recargarse.
