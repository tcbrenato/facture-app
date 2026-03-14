import { X, Download } from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { formatCFA } from '../utils/calculations'
import useStore from '../store/useStore'

const PreviewModal = ({ doc, onClose }) => {
  const { settings } = useStore()
  if (!doc) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#1e3a5f] text-lg">
            Aperçu — {doc.type === 'facture' ? 'Facture' : 'Proforma'} {doc.number}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => generatePDF(doc, settings)}
              className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
            >
              <Download size={16} />
              Télécharger PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 text-sm">

          {/* Header doc */}
          <div className="bg-[#1e3a5f] text-white rounded-xl p-5 mb-5 flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{settings.companyName}</p>
              <p className="text-blue-200 text-xs mt-1">IFU : {settings.ifu}</p>
              <p className="text-blue-200 text-xs">RCCM : {settings.rccm}</p>
              <p className="text-blue-200 text-xs">Tél : {settings.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{doc.type === 'facture' ? 'FACTURE' : 'PRO FORMA'}</p>
              <p className="text-blue-200 text-xs mt-1">N° {doc.number}</p>
              <p className="text-blue-200 text-xs">Date : {doc.date}</p>
              <p className="text-blue-200 text-xs">Validité : {doc.validity} jours</p>
            </div>
          </div>

          {/* Client */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-[#1e3a5f] mb-1">CLIENT</p>
            <p className="font-semibold">{doc.clientName || '—'}</p>
            {doc.clientAddress && <p className="text-gray-500 text-xs">{doc.clientAddress}</p>}
            {doc.clientPhone && <p className="text-gray-500 text-xs">Tél : {doc.clientPhone}</p>}
            {doc.clientEmail && <p className="text-gray-500 text-xs">{doc.clientEmail}</p>}
          </div>

          {/* Tableau */}
          <table className="w-full text-xs mb-5 border-collapse">
            <thead>
              <tr className="bg-[#1e3a5f] text-white">
                <th className="px-3 py-2 text-left rounded-tl-lg">N°</th>
                <th className="px-3 py-2 text-left">Désignation</th>
                <th className="px-3 py-2 text-right">P.U (FCFA)</th>
                <th className="px-3 py-2 text-center">Qté</th>
                <th className="px-3 py-2 text-right rounded-tr-lg">Montant</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((line, i) => (
                <tr key={line.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2">{line.designation}</td>
                  <td className="px-3 py-2 text-right">{formatCFA(parseFloat(line.pu) || 0)}</td>
                  <td className="px-3 py-2 text-center">{line.qty}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {formatCFA((parseFloat(line.pu) || 0) * (parseFloat(line.qty) || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end mb-5">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Sous-total HT</span><span>{formatCFA(doc.subtotal)}</span>
              </div>
              {doc.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-red-500">
                  <span>Remise</span><span>- {formatCFA(doc.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total HT</span><span>{formatCFA(doc.totalHT)}</span>
              </div>
              {doc.applyTVA && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>TVA (18%)</span><span>{formatCFA(doc.tva)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-white bg-[#1e3a5f] px-3 py-2 rounded-lg">
                <span>TOTAL TTC</span><span>{formatCFA(doc.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Modalités */}
          <div className="bg-blue-50 rounded-xl p-4 text-xs">
            <p className="font-bold text-[#1e3a5f] mb-1">MODALITÉS DE PAIEMENT</p>
            <p>• 70% à la commande</p>
            <p>• 30% à la livraison</p>
            {doc.notes && <p className="mt-2 text-gray-500 italic">{doc.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal