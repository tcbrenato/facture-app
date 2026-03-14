import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NewDocument from './pages/NewDocument'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        {/* padding-top sur mobile pour la topbar fixe */}
        <main className="flex-1 p-8 pt-20 md:pt-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nouveau" element={<NewDocument />} />
            <Route path="/modifier/:id" element={<NewDocument />} />
            <Route path="/parametres" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App