import { CalendarDays, ShieldCheck, Trophy } from 'lucide-react'
import PlayerPhoto from './PlayerPhoto'

function PublicPlayerCard({ player }) {
  const latestTeam = player.history[0]?.team

  return (
    <article className="public-player-card" aria-labelledby="public-player-name">
      <div className="public-player-heading">
        <PlayerPhoto ci={player.ci} name={player.fullName} className="result-photo" />
        <div>
          <span className="eyebrow">Jugador registrado</span>
          <h2 id="public-player-name">{player.fullName}</h2>
          <span className="public-player-ci">CI {player.ci}</span>
        </div>
      </div>

      {latestTeam && (
        <div className="transfer-team">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <span>Último club registrado</span>
            <strong>{latestTeam}</strong>
          </div>
        </div>
      )}

      <section className="history-section" aria-labelledby="history-title">
        <div className="section-title-row">
          <Trophy size={18} aria-hidden="true" />
          <h3 id="history-title">Historial de clubes</h3>
        </div>

        {player.history.length ? (
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
        ) : (
          <p className="empty-history">No existen participaciones vigentes registradas.</p>
        )}
      </section>
    </article>
  )
}

export default PublicPlayerCard
