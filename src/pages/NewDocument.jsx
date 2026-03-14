import { useState } from 'react'
import { FilePlus } from 'lucide-react'
import InvoiceForm from '../components/InvoiceForm'
import PreviewModal from '../components/PreviewModal'

const NewDocument = () => {
  const [previewDoc, setPreviewDoc] = useState(null)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
          <FilePlus size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Nouveau Document</h1>
          <p className="text-gray-500 text-sm">Créez une facture ou un proforma</p>
        </div>
      </div>
      <InvoiceForm onPreview={(doc) => setPreviewDoc(doc)} />
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  )
}

export default NewDocument