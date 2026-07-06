export const CURRENT_SEASON = 2026

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://flwrkxufkknrqbdlkvvp.supabase.co'

export const PLAYER_PHOTO_BUCKET = 'fotos_jugadores'

export function getPlayerPhotoUrl(ci) {
  return `${SUPABASE_URL}/storage/v1/object/public/${PLAYER_PHOTO_BUCKET}/${encodeURIComponent(ci)}.jpg`
}
