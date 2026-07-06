import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Search, UserRound, X } from 'lucide-react'
import PublicPlayerCard from '../components/PublicPlayerCard'
import { readPublicPlayersCache, writePublicPlayersCache } from '../lib/playerCache'
import { getPublicPlayers, playerMatches } from '../lib/players'

const PREDICTIVE_LIMIT = 25
const FULL_SEARCH_LIMIT = 100

function SearchPage() {
  const [initialCache] = useState(readPublicPlayersCache)
  const [players, setPlayers] = useState(initialCache?.players || [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [usingCache, setUsingCache] = useState(Boolean(initialCache?.players?.length))
  const [resultLabel, setResultLabel] = useState('')
  const searchAreaRef = useRef(null)

  useEffect(() => {
    let active = true

    async function loadPlayers() {
      try {
        const data = await getPublicPlayers()

        if (!active) return

        if (data.length) {
          setPlayers(data)
          writePublicPlayersCache(data)
          setUsingCache(false)
          setLoadError('')
        } else if (!initialCache?.players?.length) {
          setPlayers([])
          setLoadError('Supabase no devolvió jugadores para el acceso público.')
        } else {
          setUsingCache(true)
          setLoadError('No se recibieron datos nuevos. Se mantiene la copia guardada en este dispositivo.')
        }
      } catch (error) {
        console.error('No fue posible cargar el índice público:', error)
        if (active) {
          setUsingCache(Boolean(initialCache?.players?.length))
          setLoadError(
            initialCache?.players?.length
              ? 'Sin conexión con Supabase. Se está usando la copia guardada en este dispositivo.'
              : 'No fue posible cargar los jugadores desde Supabase.',
          )
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadPlayers()
    return () => { active = false }
  }, [initialCache])

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!searchAreaRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  const allMatches = useMemo(
    () => query.trim().length >= 2 ? players.filter((player) => playerMatches(player, query)) : [],
    [players, query],
  )

  function handleInput(event) {
    const value = event.target.value
    setQuery(value)
    setSelectedPlayer(null)
    setResultLabel('')

    if (value.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const matches = players.filter((player) => playerMatches(player, value))
    setResults(matches.slice(0, PREDICTIVE_LIMIT))
    setIsOpen(true)
  }

  function performFullSearch(event) {
    event?.preventDefault()
    if (query.trim().length < 2) return

    const matches = allMatches.slice(0, FULL_SEARCH_LIMIT)
    setResults(matches)
    setResultLabel(`${allMatches.length} ${allMatches.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`)
    setIsOpen(true)
  }

  function selectPlayer(player) {
    setSelectedPlayer(player)
    setQuery(player.fullName)
    setIsOpen(false)
    setResultLabel('')
  }

  function clearSearch() {
    setQuery('')
    setResults([])
    setSelectedPlayer(null)
    setResultLabel('')
    setIsOpen(false)
  }

  return (
    <div className="search-page">
      <header className="search-brand">
        <img src="/logo.png" alt="Liga de Fútbol Vinto" />
        <div>
          <span>Consulta pública</span>
          <h1>Buscador de jugadores</h1>
          <p>Busca por nombre, apellido o número de carnet.</p>
        </div>
      </header>

      <div className="search-area" ref={searchAreaRef}>
        <form className="search-form" onSubmit={performFullSearch} role="search">
          <div className="search-input-shell">
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="player-search">Buscar jugador</label>
            <input
              id="player-search"
              value={query}
              onChange={handleInput}
              onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
              placeholder="Nombre, apellido o carnet"
              autoComplete="off"
              disabled={isLoading && players.length === 0}
            />
            {query && <button type="button" className="clear-button" onClick={clearSearch} aria-label="Limpiar búsqueda"><X size={19} /></button>}
          </div>
          <button className="button button-primary search-button" disabled={(isLoading && players.length === 0) || query.trim().length < 2}>
            Buscar
          </button>
        </form>

        {isOpen && (
          <div className="suggestions" role="listbox" aria-label="Resultados de búsqueda">
            {resultLabel && <div className="suggestions-header">{resultLabel}</div>}
            {results.length ? results.map((player) => (
              <button key={player.ci} type="button" role="option" onClick={() => selectPlayer(player)} className="suggestion-item">
                <UserRound size={18} aria-hidden="true" />
                <span className="suggestion-player-data">
                  <strong>{player.fullName}</strong>
                  <small>CI {player.ci}</small>
                </span>
              </button>
            )) : <div className="no-results">No se encontraron jugadores</div>}
          </div>
        )}
      </div>

      {isLoading && <p className="index-status"><span className="mini-spinner" /> {players.length ? 'Actualizando jugadores…' : 'Preparando el buscador…'}</p>}
      {loadError && <div className={usingCache ? 'index-warning' : 'index-error'}><AlertCircle size={20} /><span>{loadError}</span></div>}

      {selectedPlayer && <PublicPlayerCard player={selectedPlayer} />}

      <footer className="site-footer">
        <span>Liga de Fútbol Vinto</span>
        <span>Vinto · Cochabamba · Bolivia</span>
      </footer>
    </div>
  )
}

export default SearchPage
