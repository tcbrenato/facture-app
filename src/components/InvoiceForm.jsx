import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Save, Eye } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import useStore from '../store/useStore'
import { calculateLine, calculateTotals, formatCFA, generateDocNumber } from '../utils/calculations'

const emptyLine = () => ({ id: uuidv4(), designation: '', pu: '', qty: 1 })

const InvoiceForm = ({ onPreview }) => {
  const { documents, addDocument, updateDocument } = useStore()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = id ? documents.find((d) => d.id === id) : null

  const [type, setType] = useState(existing?.type || 'proforma')
  const [clientName, setClientName] = useState(existing?.clientName || '')
  const [clientAddress, setClientAddress] = useState(existing?.clientAddress || '')
  const [clientPhone, setClientPhone] = useState(existing?.clientPhone || '')
  const [clientEmail, setClientEmail] = useState(existing?.clientEmail || '')
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split('T')[0])
  const [validity, setValidity] = useState(existing?.validity || '15')
  const [lines, setLines] = useState(existing?.lines || [emptyLine()])
  const [discount, setDiscount] = useState(existing?.discount || 0)
  const [discountType, setDiscountType] = useState(existing?.discountType || 'fixed')
  const [applyTVA, setApplyTVA] = useState(existing?.applyTVA !== false)
  const [notes, setNotes] = useState(existing?.notes || '')

  const totals = calculateTotals(lines, discount, discountType, applyTVA)

  const addLine = () => setLines([...lines, emptyLine()])
  const removeLine = (lineId) => setLines(lines.filter((l) => l.id !== lineId))
  const updateLine = (lineId, field, value) => {
    setLines(lines.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)))
  }

  const buildDoc = () => ({
    id: existing?.id || uuidv4(),
    number: existing?.number || generateDocNumber(type, documents),
    type,
    clientName,
    clientAddress,
    clientPhone,
    clientEmail,
    date,
    validity,
    lines,
    discount,
    discountType,
    applyTVA,
    notes,
    ...totals,
    archived: false,
    createdAt: existing?.createdAt || new Date().toISOString(),
  })

  const handleSave = () => {
    const doc = buildDoc()
    if (existing) {
      updateDocument(doc.id, doc)
    } else {
      addDocument(doc)
    }
    navigate('/')
  }

  const handlePreview = () => {
    if (onPreview) onPreview(buildDoc())
  }

  return (
    <div className="space-y-6">

      {/* Type de document */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-700 mb-4">Type de document</h2>
        <div className="flex gap-3">
          {['proforma', 'facture'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition border-2 ${
                type === t
                  ? t === 'facture'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {t === 'facture' ? '🧾 Facture' : '📋 Proforma'}
            </button>
          ))}
        </div>
      </div>

      {/* Informations client */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-700 mb-4">Informations client</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nom / Raison sociale *', value: clientName, set: setClientName, placeholder: 'Ex: ACME SARL' },
            { label: 'Adresse', value: clientAddress, set: setClientAddress, placeholder: 'Adresse du client' },
            { label: 'Téléphone', value: clientPhone, set: setClientPhone, placeholder: '+229...' },
            { label: 'Email', value: clientEmail, set: setClientEmail, placeholder: 'client@email.com' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Validité (jours)</label>
            <input
              type="number"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lignes produits */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-700 mb-4">Produits / Services</h2>

        <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-400 uppercase px-1">
          <div className="col-span-5">Désignation</div>
          <div className="col-span-2 text-right">P.U (FCFA)</div>
          <div className="col-span-2 text-center">Qté</div>
          <div className="col-span-2 text-right">Montant</div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-12 sm:col-span-5">
                <input
                  type="text"
                  value={line.designation}
                  onChange={(e) => updateLine(line.id, 'designation', e.target.value)}
                  placeholder={`Produit / service ${index + 1}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <input
                  type="number"
                  value={line.pu}
                  onChange={(e) => updateLine(line.id, 'pu', e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  value={line.qty}
                  min="1"
                  onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-2 text-right text-sm font-semibold text-gray-700">
                {formatCFA(calculateLine(line.pu, line.qty))}
              </div>
              <div className="col-span-1 flex justify-center">
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(line.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLine}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
        >
          <Plus size={16} />
          Ajouter une ligne
        </button>
      </div>

      {/* Remise & Totaux */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700">Remise & Totaux</h2>
          {/* Toggle TVA */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setApplyTVA(!applyTVA)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                applyTVA ? 'bg-[#1e3a5f]' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                applyTVA ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              TVA 18% {applyTVA ? '✅' : '⬜'}
            </span>
          </label>
        </div>

        {/* Remise */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Remise</label>
            <input
              type="number"
              value={discount}
              min="0"
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fixed">FCFA</option>
              <option value="percent">%</option>
            </select>
          </div>
        </div>

        {/* Totaux */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span>
            <span>{formatCFA(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Remise</span>
              <span>- {formatCFA(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total HT</span>
            <span>{formatCFA(totals.totalHT)}</span>
          </div>
          {applyTVA && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (18%)</span>
              <span>{formatCFA(totals.tva)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-[#1e3a5f] border-t pt-2">
            <span>TOTAL TTC</span>
            <span>{formatCFA(totals.totalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-700 mb-3">Notes / Conditions</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Modalités de paiement, conditions particulières..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <button
          onClick={handlePreview}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1e3a5f] text-[#1e3a5f] py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
        >
          <Eye size={18} />
          Aperçu PDF
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          <Save size={18} />
          {existing ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

export default InvoiceForm