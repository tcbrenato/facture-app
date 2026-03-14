import { useState, useRef } from 'react'
import { Settings as SettingsIcon, Upload, Save } from 'lucide-react'
import useStore from '../store/useStore'

const Settings = () => {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm({ ...form, logo: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
          <SettingsIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Paramètres</h1>
          <p className="text-gray-500 text-sm">Informations de votre entreprise</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Logo de l'entreprise</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <Upload size={24} className="text-gray-400" />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current.click()}
                className="px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-blue-800 transition"
              >
                Choisir un logo
              </button>
              {form.logo && (
                <button
                  onClick={() => setForm({ ...form, logo: null })}
                  className="ml-2 px-4 py-2 bg-red-50 text-red-500 text-sm rounded-lg hover:bg-red-100 transition"
                >
                  Supprimer
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">PNG, JPG recommandé</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>
        </div>

        <hr />

        {/* Champs */}
        {[
          { name: 'companyName', label: 'Nom / Raison sociale', placeholder: 'DOMOSECU ET COM' },
          { name: 'ifu', label: 'Numéro IFU', placeholder: '0202011976429' },
          { name: 'rccm', label: 'Numéro RCCM', placeholder: 'RB/COT/26 A 115345' },
          { name: 'phone', label: 'Téléphone', placeholder: '0167806547' },
          { name: 'email', label: 'Email', placeholder: 'contact@domosecu.com' },
          { name: 'address', label: 'Adresse complète', placeholder: 'Zogbohoué, Cotonou, Bénin' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
            <input
              type="text"
              name={field.name}
              value={form[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          <Save size={18} />
          {saved ? '✅ Paramètres sauvegardés !' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}

export default Settings