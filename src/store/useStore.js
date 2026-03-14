import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Paramètres de l'entreprise
      settings: {
        companyName: 'DOMOSECU ET COM',
        ifu: '0202011976429',
        rccm: 'RB/COT/26 A 115345',
        phone: '0167806547',
        address: 'Zogbohoué, Cotonou, Bénin',
        email: '',
        logo: null,
      },

      // Liste de tous les documents
      documents: [],

      // Mettre à jour les paramètres
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      // Ajouter un document
      addDocument: (doc) =>
        set((state) => ({ documents: [doc, ...state.documents] })),

      // Modifier un document
      updateDocument: (id, updatedDoc) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updatedDoc } : d
          ),
        })),

      // Supprimer un document
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      // Archiver / désarchiver
      toggleArchive: (id) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, archived: !d.archived } : d
          ),
        })),
    }),
    {
      name: 'facture-app-storage', // clé dans localStorage
    }
  )
)

export default useStore