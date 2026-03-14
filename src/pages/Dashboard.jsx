import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus, FileText, Archive, Trash2, Pencil, LayoutDashboard, Download, Eye } from 'lucide-react'
import useStore from '../store/useStore'
import { formatCFA } from '../utils/calculations'
import { generatePDF } from '../utils/pdfGenerator'
import PreviewModal from '../components/PreviewModal'

const Dashboard = () => {
  const { documents, deleteDocument, toggleArchive, settings } = useStore()
  const navigate = useNavigate()
  const [showArchived, setShowArchived] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  const actifs = documents.filter((d) => !d.archived)
  const archives = documents.filter((d) => d.archived)
  const factures = documents.filter((d) => d.type === 'facture' && !d.archived)
  const proformas = documents.filter((d) => d.type === 'proforma' && !d.archived)
  const totalCA = factures.reduce((sum, d) => sum + (d.totalTTC || 0), 0)

  const stats = [
    { label: 'Documents actifs', value: actifs.length, color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
    { label: 'Factures', value: factures.length, color: 'text-green-700', border: 'border-green-200', bg: 'bg-green-50' },
    { label: 'Proformas', value: proformas.length, color: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50' },
    { label: 'Archivés', value: archives.length, color: 'text-gray-600', border: 'border-gray-200', bg: 'bg-gray-50' },
  ]

  const displayed = showArchived ? archives : actifs

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Tableau de bord</h1>
            <p className="text-gray-500 text-sm">Gérez vos factures et proformas</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/nouveau')}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition shadow-sm"
        >
          <FilePlus size={18} />
          Nouveau document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* CA total */}
      <div className="bg-[#1e3a5f] text-white rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-blue-200 text-sm">Chiffre d'affaires total (factures)</p>
        <p className="text-3xl font-bold mt-1">{formatCFA(totalCA)}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            !showArchived ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          Actifs ({actifs.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            showArchived ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          Archivés ({archives.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={48} className="mb-3 opacity-30" />
            <p className="font-semibold">Aucun document</p>
            <p className="text-sm mt-1">
              {showArchived ? 'Aucun document archivé' : 'Créez votre premier document'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Numéro</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden sm:table-cell">Client</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Total TTC</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-mono font-semibold text-[#1e3a5f] text-xs">{doc.number}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        doc.type === 'facture'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {doc.type === 'facture' ? 'Facture' : 'Proforma'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 hidden sm:table-cell">{doc.clientName || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{doc.date}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      {formatCFA(doc.totalTTC || 0)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition"
                          title="Aperçu"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => generatePDF(doc, settings)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition"
                          title="Télécharger PDF"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/modifier/${doc.id}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => toggleArchive(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                          title={doc.archived ? 'Désarchiver' : 'Archiver'}
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer ce document ?')) deleteDocument(doc.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  )
}

export default Dashboard