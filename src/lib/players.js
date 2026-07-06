import { CURRENT_SEASON } from '../config'
import { supabase } from './supabase'

const PAGE_SIZE = 1000
const PLAYER_FIELDS = `
  ci,
  nombres,
  apellidos,
  historial_participacion (
    año,
    condicion_pase,
    equipos!historial_participacion_equipo_id_fkey (
      nombre
    )
  )
`

function isActiveParticipation(participation) {
  return participation?.condicion_pase?.trim().toLocaleLowerCase('es') !== 'anulada'
}

function normalizePlayer(player) {
  const history = (player.historial_participacion || [])
    .filter(isActiveParticipation)
    .map((participation) => ({
      year: Number(participation.año),
      status: participation.condicion_pase || 'Sin condición registrada',
      team: participation.equipos?.nombre || 'Equipo no registrado',
    }))
    .sort((a, b) => b.year - a.year || a.team.localeCompare(b.team, 'es'))

  return {
    ci: String(player.ci),
    firstNames: player.nombres?.trim() || '',
    lastNames: player.apellidos?.trim() || '',
    fullName: `${player.nombres || ''} ${player.apellidos || ''}`.trim(),
    history,
  }
}

export function normalizeSearchText(value = '') {
  return String(value)
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function playerMatches(player, rawQuery) {
  const query = normalizeSearchText(rawQuery)
  if (!query) return false

  return [player.firstNames, player.lastNames, player.fullName, player.ci]
    .map(normalizeSearchText)
    .some((field) => field.includes(query))
}

export async function getPlayerByCi(ci) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('kardex_jugador_publico', {
    p_ci: String(ci),
    p_gestion: CURRENT_SEASON,
  })

  if (!rpcError) {
    if (!rpcData) return null
    const player = normalizePlayer(rpcData)
    return player.history.length ? player : null
  }

  // Compatibilidad temporal mientras se instala el RPC en Supabase.
  const { data, error } = await supabase
    .from('jugadores')
    .select(PLAYER_FIELDS)
    .eq('ci', ci)
    .eq('historial_participacion.año', CURRENT_SEASON)
    .not('historial_participacion.condicion_pase', 'ilike', 'anulada')
    .limit(1)

  if (error) throw error
  if (!data?.length) return null

  const player = normalizePlayer(data[0])
  player.history = player.history.filter((item) => item.year === CURRENT_SEASON)

  return player.history.length ? player : null
}

export async function getPublicPlayers() {
  const { data: rpcData, error: rpcError } = await supabase.rpc('kardex_listado_publico')

  if (!rpcError) {
    return (Array.isArray(rpcData) ? rpcData : []).map(normalizePlayer)
  }

  // Compatibilidad con proyectos donde las tablas ya tengan lectura pública.
  const players = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('jugadores')
      .select(PLAYER_FIELDS)
      .not('historial_participacion.condicion_pase', 'ilike', 'anulada')
      .order('apellidos', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(
        `No fue posible consultar el RPC público (${rpcError.message}) ni la lectura directa (${error.message}).`,
      )
    }

    players.push(...(data || []).map(normalizePlayer))
    if (!data || data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return players
}
