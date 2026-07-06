import { Navigate, Route, Routes } from 'react-router-dom'
import KardexView from './pages/KardexView'
import SearchPage from './pages/SearchPage'
import './App.css'

function App() {
  return (
    <main className="app-layout">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/:ci" element={<KardexView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App
