import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Award, CalendarDays, CheckCircle2, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import PlayerPhoto from '../components/PlayerPhoto'
import { CURRENT_SEASON } from '../config'
import { getPlayerByCi } from '../lib/players'

const NOT_FOUND_MESSAGE = 'Jugador no encontrado o no habilitado para la gestión actual'

function KardexView() {
  const { ci = '' } = useParams()
  const [state, setState] = useState({ status: 'loading', player: null })

  useEffect(() => {
    let active = true

    async function loadPlayer() {
      setState({ status: 'loading', player: null })

      try {
        const player = await getPlayerByCi(ci)
        if (!active) return
        setState(player ? { status: 'success', player } : { status: 'not-found', player: null })
      } catch (error) {
        console.error('No fue posible consultar la credencial:', error)
        if (active) setState({ status: 'error', player: null })
      }
    }

    loadPlayer()
    return () => { active = false }
  }, [ci])

  if (state.status === 'loading') {
    return <LoadingState message="Cargando credencial oficial…" />
  }

  if (!state.player) {
    return (
      <section className="message-card" role="alert">
        <AlertCircle size={52} className="message-icon error" />
        <span className="eyebrow">Consulta de credencial</span>
        <h1>{state.status === 'error' ? 'No pudimos completar la consulta' : 'Credencial no disponible'}</h1>
        <p>{state.status === 'error' ? 'Ocurrió un problema de conexión. Intenta nuevamente en unos minutos.' : NOT_FOUND_MESSAGE}</p>
        <Link to="/" className="button button-primary"><ArrowLeft size={18} /> Ir al buscador</Link>
      </section>
    )
  }

  const { player } = state
  const participation = player.history[0]

  return (
    <div className="credential-page">
      <article className="credential-card" aria-labelledby="player-name">
        <header className="credential-header">
          <img src="/logo.png" alt="Liga de Fútbol Vinto" className="credential-logo" />
          <div>
            <span>Liga de Fútbol Vinto</span>
            <strong>Kardex Digital Público</strong>
          </div>
        </header>

        <div className="credential-ribbon">Credencial oficial · Gestión {CURRENT_SEASON}</div>

        <div className="credential-body">
          <div className="credential-photo-frame">
            <PlayerPhoto ci={player.ci} name={player.fullName} className="credential-photo" />
            <span className="active-badge"><span /> Habilitado</span>
          </div>

          <span className="eyebrow">Jugador registrado</span>
          <h1 id="player-name">{player.fullName}</h1>

          {participation && (
            <div className="current-team">
              <Award size={22} aria-hidden="true" />
              <div>
                <span>Club deportivo</span>
                <strong>{participation.team}</strong>
              </div>
            </div>
          )}

          <dl className="credential-data">
            <div><dt>Gestión deportiva</dt><dd>{CURRENT_SEASON}</dd></div>
            <div><dt>Estado</dt><dd>Habilitado</dd></div>
          </dl>
        </div>

        {/* Historial de Clubes */}
        {player.history.length > 0 && (
          <div className="credential-history">
            <div className="section-title-row credential-history-title">
              <Trophy size={18} aria-hidden="true" />
              <h3>Historial de clubes</h3>
            </div>

            <ol className="history-list">
              {player.history.map((entry, index) => (
                <li key={`${entry.year}-${entry.team}-${index}`}>
                  <span className="history-marker" aria-hidden="true" />
                  <div className="history-content">
                    <strong>{entry.team}</strong>
                    <span><CalendarDays size={14} /> Gestión {entry.year}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <footer className="credential-footer">
          <CheckCircle2 size={18} />
          <span>Registro vigente en la Liga de Fútbol Vinto</span>
        </footer>
      </article>

      <Link to="/" className="back-link"><ArrowLeft size={18} /> Buscar otro jugador</Link>
    </div>
  )
}

export default KardexView
