function LoadingState({ message = 'Consultando información oficial…' }) {
  return (
    <section className="state-container" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </section>
  )
}

export default LoadingState
