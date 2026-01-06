import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, MapPin, 
  Edit3, HardHat, Link2, UserCheck,
  BadgeCheck, Hash, Briefcase, Trash2, AlertTriangle, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Store & Slices
import type { AppDispatch, RootState } from '../store/store';
import { fetchChantiers, deleteChantier, type Chantier } from '../store/slices/chantierSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';

// Composants Modaux
import ChantierModal from '../components/ChantierModal';
import { ChantierDetailsModal } from '../components/ChantierDetailsModal'; 

// API Root for images
import { API_ROOT } from '../api/client';

export const ChantiersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: chantiers } = useSelector((state: RootState) => state.chantiers);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- STATE MODALS ---
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // --- DELETE MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chantierToDelete, setChantierToDelete] = useState<number | null>(null);
  
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);

  useEffect(() => { 
    if (accessToken) {
      dispatch(fetchChantiers()); 
      dispatch(fetchEmployees()); 
    }
  }, [dispatch, accessToken]);

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setSelectedChantier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (chantier: Chantier) => {
    setSelectedChantier(chantier);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (chantier: Chantier) => {
    setSelectedChantier(chantier);
    setIsDetailsOpen(true);
  };

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (id: number) => {
    setChantierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (chantierToDelete) {
      dispatch(deleteChantier(chantierToDelete));
      setIsDeleteModalOpen(false);
      setChantierToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setChantierToDelete(null);
  };

  // --- FILTERS & HELPERS ---

  const filteredChantiers = chantiers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_ROOT}${imagePath}`;
  };

  const formatResponsibles = (chantier: Chantier) => {
    if (!chantier.responsible || !Array.isArray(chantier.responsible) || chantier.responsible.length === 0) {
        return "Non assigné";
    }
    return chantier.responsible.map(r => `${r.first_name} ${r.last_name}`).join(', ');
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-12 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 tracking-tighter uppercase">
            Projets <span className="text-slate-900">& Opérations</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 italic">
            <BadgeCheck size={16} className="text-red-500" />
            Gestion des infrastructures TOURTRA v2.5
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 group-focus-within:text-red-600 transition-colors" size={20} />
            <input 
              className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-semibold text-slate-700 shadow-sm"
              placeholder="Marché ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="hidden md:flex bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] items-center gap-3 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nouveau Projet
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredChantiers.map((chantier) => (
            <motion.div 
              layout key={chantier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white rounded-[2.5rem] p-1 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.15)] transition-all duration-300 border border-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white rounded-[2.3rem] overflow-hidden h-full flex flex-col sm:flex-row p-6 gap-8 z-10 group-hover:border-red-100/50 transition-colors">
                
                {/* Left Side: Visual */}
                <div className="w-full sm:w-40 shrink-0 flex flex-col gap-4">
                  <div className="w-full aspect-square bg-gradient-to-br from-red-50 to-white rounded-2xl border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden group-hover:from-red-100 transition-colors">
                    {chantier.image ? (
                        <img 
                            src={getImageUrl(chantier.image) || ''} 
                            alt={chantier.name} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <HardHat size={56} className="text-red-200 group-hover:text-red-400 transition-colors drop-shadow-sm" />
                    )}
                  </div>
                </div>

                {/* Right Side: Data */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Hash size={12} className="text-red-500" />
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">N° de Marché</label>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 truncate tracking-tighter leading-none font-mono uppercase">
                      {chantier.contract_number}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                    <div className="min-w-0">
                      <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <Briefcase size={12} /> Nom du Projet
                      </label>
                      <p className="text-[13px] font-bold text-slate-700 truncate pl-3 border-l-2 border-red-100">{chantier.name}</p>
                    </div>
                    <div className="min-w-0">
                      <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        <UserCheck size={12} /> Responsables
                      </label>
                      <div 
                        className="text-[13px] font-bold text-slate-700 truncate pl-3 border-l-2 border-red-100" 
                        title={formatResponsibles(chantier)}
                      >
                        {formatResponsibles(chantier)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3 mb-8">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                          <MapPin size={16} className="text-red-600" />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localisation</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{chantier.location}</p>
                      </div>
                    </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 mt-auto">
                    
                    <button 
                      onClick={() => handleOpenDetails(chantier)}
                      className="h-12 w-12 flex items-center justify-center bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95"
                      title="Voir Détails & Documents"
                    >
                      <Link2 size={20} strokeWidth={2.5} />
                    </button>

                    {/* DELETE BUTTON - Opens Modal */}
                    <button 
                        onClick={() => handleDeleteClick(chantier.id)}
                        className="h-12 w-12 flex items-center justify-center border-2 border-red-50 text-red-300 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
                        title="Supprimer le Chantier"
                    >
                        <Trash2 size={20} />
                    </button>
                    
                    <button 
                      onClick={() => handleOpenEdit(chantier)}
                      className="h-12 flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                      <Edit3 size={16} /> Éditer Projet
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. EDIT/CREATE FORM MODAL */}
      <ChantierModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={selectedChantier} 
      />

      {/* 2. DETAILS VIEW MODAL */}
      <ChantierDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        chantier={selectedChantier}
        onEdit={(chantier) => {
            setIsDetailsOpen(false);
            handleOpenEdit(chantier);
        }}
      />

      {/* 3. CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-6"
            >
              <div className="h-20 w-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={40} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Supprimer le projet ?</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Cette action est irréversible. Toutes les données, documents et historiques liés à ce chantier seront effacés.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={cancelDelete}
                  className="py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-red-600/40 transition-all"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChantiersPage;