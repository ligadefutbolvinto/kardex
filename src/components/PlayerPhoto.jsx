import { useEffect, useState } from 'react'
import { getPlayerPhotoUrl } from '../config'

const FALLBACK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 280'%3E%3Crect width='240' height='280' fill='%23e5e7eb'/%3E%3Ccircle cx='120' cy='92' r='48' fill='%239ca3af'/%3E%3Cpath d='M35 260c4-65 37-103 85-103s81 38 85 103' fill='%239ca3af'/%3E%3C/svg%3E"

function PlayerPhoto({ ci, name, className = '' }) {
  const [source, setSource] = useState(() => getPlayerPhotoUrl(ci))

  useEffect(() => {
    setSource(getPlayerPhotoUrl(ci))
  }, [ci])

  const useFallback = () => {
    if (source !== FALLBACK_AVATAR) setSource(FALLBACK_AVATAR)
  }

  return (
    <img
      src={source}
      alt={`Fotografía de ${name}`}
      className={className}
      onError={useFallback}
    />
  )
}

export default PlayerPhoto
