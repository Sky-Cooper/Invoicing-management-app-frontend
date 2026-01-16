import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Building2, Eye, Fingerprint, 
  Trash2, Edit3, Briefcase, BadgeCheck, Hash, 
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types et Redux
import type { AppDispatch, RootState } from '../store/store';
import { fetchClients, deleteClient, type Client } from '../store/slices/clientSlice';

// Composants Modaux
import ClientModal from '../components/ClientModal';
import { ClientDetailsModal } from '../components/ClientDetailsModal';

export const ClientsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: clients } = useSelector((state: RootState) => state.clients);
  const { accessToken } = useSelector((state: RootState) => state.auth); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<'edit' | 'view' | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // --- NOUVEAU STATE POUR LA SUPPRESSION ---
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => { 
    if (accessToken) {
      dispatch(fetchClients()); 
    }
  }, [dispatch, accessToken]);

  const handleOpenView = (client: Client) => { setSelectedClient(client); setActiveModal('view'); };
  const handleOpenEdit = (client: Client | null) => { setSelectedClient(client); setActiveModal('edit'); };
  
  // Ouvre la modale de confirmation
  const handleRequestDelete = (client: Client) => {
    setClientToDelete(client);
  };

  // Exécute la suppression réelle
  const confirmDelete = () => {
    if (clientToDelete && clientToDelete.id) {
      dispatch(deleteClient(clientToDelete.id));
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ice?.includes(searchTerm)
  );

  return (
    <div className="max-w-400 mx-auto p-6 lg:p-10 space-y-12 min-h-screen bg-slate-50/50">
      
      {/* VIBRANT RED HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200/60">
        <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-600 to-red-800 tracking-tighter uppercase">
            Répertoire <span className="text-slate-900">Identités</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 italic">
            <BadgeCheck size={16} className="text-red-500" />
            Certification des entités TOURTRA
            </p>
        </div>
        
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 group-focus-within:text-red-600 transition-colors" size={20} />
            <input 
              className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-semibold text-slate-700 shadow-sm"
              placeholder="ICE ou Nom de l'entité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenEdit(null)} 
            className="hidden md:flex bg-linear-to-r from-red-600 to-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] items-center gap-3 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nouveau
          </button>
        </div>
      </div>

      {/* CLIENTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredClients.map((client) => (
            <motion.div 
              layout key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white rounded-[2.5rem] p-1 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.15)] transition-all duration-300 border border-slate-100"
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white rounded-[2.3rem] overflow-hidden h-full flex flex-col sm:flex-row p-6 gap-8 z-10 group-hover:border-red-100/50 transition-colors">
                
                {/* Left Side: Photo / ID Box */}
                <div className="w-full sm:w-40 shrink-0 flex flex-col gap-4">
                  <div className="w-full aspect-square bg-linear-to-br from-red-50 to-white rounded-2xl border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden group-hover:from-red-100 transition-colors">
                    <Building2 size={56} className="text-red-200 group-hover:text-red-400 transition-colors drop-shadow-sm" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-red-100">
                      <Fingerprint size={18} className="text-red-600" />
                    </div>
                  </div>

                  <div className="flex justify-between items-end h-8 px-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    {[...Array(14)].map((_, i) => (
                        <div key={i} className="bg-red-900 rounded-full" style={{ width: i%4===0 ? '3px' : '1px', height: `${Math.random() * 60 + 40}%` }} />
                    ))}
                  </div>
                </div>

                {/* Right Side: Identity Data */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                       <Hash size={12} className="text-red-500" />
                       <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Référence ICE</label>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 truncate tracking-tighter leading-none font-mono uppercase">
                      {client.ice || "NON-SPEC"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                    <div className="min-w-0">
                      <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <Briefcase size={12} /> Raison Sociale
                      </label>
                      <p className="text-[13px] font-bold text-slate-700 truncate pl-3 border-l-2 border-red-100">{client.company_name}</p>
                    </div>
                    <div className="min-w-0">
                      <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <UserCircle size={12} /> Contact
                      </label>
                      <p className="text-[13px] font-bold text-slate-700 truncate pl-3 border-l-2 border-red-100">{client.contact_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <InfoPill label="IF" value={client.tax_id} />
                    <InfoPill label="RC" value={client.rc} />
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 mt-auto">
                    <button 
                      onClick={() => handleOpenView(client)}
                      className="h-12 w-12 flex items-center justify-center bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95"
                      title="Voir Dossier"
                    >
                      <Eye size={20} strokeWidth={2.5} />
                    </button>
                    
                    <button 
                      onClick={() => handleOpenEdit(client)}
                      className="h-12 flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                      <Edit3 size={16} /> Édite
                    </button>

                    <button 
                      onClick={() => handleRequestDelete(client)}
                      className="h-12 w-12 flex items-center justify-center border-2 border-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                      title="Révoquer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ClientModal isOpen={activeModal === 'edit'} onClose={() => setActiveModal(null)} initialData={selectedClient} />
      <ClientDetailsModal isOpen={activeModal === 'view'} onClose={() => setActiveModal(null)} client={selectedClient} onEdit={handleOpenEdit} />
      
      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
      <DeleteConfirmationModal 
        isOpen={!!clientToDelete} 
        onClose={() => setClientToDelete(null)}
        onConfirm={confirmDelete}
        clientName={clientToDelete?.company_name || ""}
      />

    </div>
  );
};

// --- SOUS-COMPOSANTS ---

const InfoPill = ({ label, value }: { label: string, value?: string }) => (
  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold font-mono text-slate-600">{value || "---"}</span>
  </div>
);

const UserCircle = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

// --- NOUVEAU COMPOSANT : MODALE DE SUPPRESSION ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, clientName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; clientName: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      {/* Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-4xl p-8 w-full max-w-md shadow-2xl border border-red-100 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100%] -mr-10 -mt-10 z-0" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <AlertTriangle size={32} className="text-red-600" strokeWidth={2.5} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
            Révoquer l'accès ?
          </h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
            Vous êtes sur le point de supprimer <span className="text-slate-800 font-bold">"{clientName}"</span>. 
            Cette action est <span className="text-red-600 font-bold">irréversible</span> et supprimera toutes les données associées.
          </p>

          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
            >
              Confirmer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};