const CACHE_KEY = 'lfv:kardex-public-players:v1'
const CACHE_VERSION = 1

export function readPublicPlayersCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))

    if (
      cached?.version !== CACHE_VERSION ||
      !Array.isArray(cached.players) ||
      typeof cached.savedAt !== 'number'
    ) {
      return null
    }

    return cached
  } catch {
    return null
  }
}

export function writePublicPlayersCache(players) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      version: CACHE_VERSION,
      savedAt: Date.now(),
      players,
    }))
    return true
  } catch (error) {
    console.warn('No fue posible guardar el índice público en localStorage:', error)
    return false
  }
}
