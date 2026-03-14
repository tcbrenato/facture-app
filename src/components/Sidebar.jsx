import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FilePlus, Settings, FileText, Menu, X } from 'lucide-react'
import useStore from '../store/useStore'

const Sidebar = () => {
  const { settings } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { to: '/nouveau', icon: <FilePlus size={20} />, label: 'Nouveau document' },
    { to: '/parametres', icon: <Settings size={20} />, label: 'Paramètres' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Nom entreprise */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="logo" className="w-10 h-10 object-contain rounded" />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
              <FileText size={20} />
            </div>
          )}
          <div>
            <p className="font-bold text-sm leading-tight">{settings.companyName}</p>
            <p className="text-xs text-blue-300">Gestion Factures</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="p-4 border-t border-blue-800 text-xs text-blue-400 space-y-2">
        <p>IFU : {settings.ifu}</p>
        <p>RCCM : {settings.rccm}</p>
        <div className="border-t border-blue-800 pt-2 text-center">
          <p className="text-blue-500">Propulsé par</p>
          <p className="font-semibold text-blue-300">Rénato TCHOBO</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#1e3a5f] text-white flex-col">
        <SidebarContent />
      </aside>

      {/* MOBILE */}
      <div className="md:hidden">
        {/* Topbar mobile */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a5f] text-white flex items-center justify-between px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            {settings.logo ? (
              <img src={settings.logo} alt="logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <FileText size={16} />
              </div>
            )}
            <span className="font-bold text-sm">{settings.companyName}</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-blue-800 transition"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1e3a5f] text-white transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <X size={20} />
            </button>
          </div>
          <SidebarContent />
        </aside>
      </div>
    </>
  )
}

export default Sidebar