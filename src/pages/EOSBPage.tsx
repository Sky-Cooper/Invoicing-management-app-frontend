import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Calendar, ChevronLeft, ChevronRight, 
  Download, Edit2, Calculator, Filter, X, TrendingDown, Eye // Added Eye icon
} from 'lucide-react';

// Redux
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchEOSB, type EOSB } from '../store/slices/eosbSlice';

// Components
import { EOSBModal } from '../components/EOSBModal';

// Helper
const formatMoney = (amount: string | number) => 
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(amount));

export const EOSBPage = () => {
  const dispatch = useAppDispatch();
  const { items: eosbList, isLoading } = useAppSelector((state) => state.eosb);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EOSB | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false); // New state for View Mode
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchEOSB());
  }, [dispatch]);

  const filteredList = useMemo(() => {
    return eosbList.filter(item => {
      const term = searchTerm.toLowerCase();
      const name = `${item.employee.user.first_name} ${item.employee.user.last_name}`.toLowerCase();
      return (
        name.includes(term) ||
        item.last_job_title.toLowerCase().includes(term)
      );
    });
  }, [eosbList, searchTerm]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleEdit = (record: EOSB) => {
    setSelectedRecord(record);
    setIsReadOnly(false); // Edit Mode
    setIsModalOpen(true);
  };

  const handleView = (record: EOSB) => {
    setSelectedRecord(record);
    setIsReadOnly(true); // View Mode (Read Only)
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      
      <AnimatePresence>
        {isModalOpen && (
          <EOSBModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            record={selectedRecord}
            readOnly={isReadOnly} // Pass readOnly prop
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <Calculator size={28} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Solde de Tout Compte</h1>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Gestion de Sortie
              </p>
            </div>
          </div>

          <button onClick={handleCreate} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
            <Plus size={18} strokeWidth={3} /> Nouveau Calcul
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 max-w-md">
          <div className="p-2 text-slate-400"><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="Chercher employé..." 
            className="w-full bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* GRID */}
        {filteredList.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Filter className="text-slate-300" size={40} />
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-2">Aucun dossier trouvé</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedList.map((item) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-lg">
                      {item.employee.user.first_name[0]}{item.employee.user.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {item.employee.user.first_name} {item.employee.user.last_name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.last_job_title}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                    {item.total_years_of_service} Ans
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Date Sortie</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                         <Calendar size={12} className="text-red-400" /> {item.exit_date}
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dernier Salaire</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                         <TrendingDown size={12} className="text-emerald-400" /> {formatMoney(item.last_salary)}
                      </div>
                   </div>
                </div>

                {/* Net Payment Big */}
                <div className="mt-auto pt-6 border-t border-slate-50">
                   <div className="flex justify-between items-end mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase">Net à Payer</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{formatMoney(item.net_payment)}</span>
                   </div>

                   {/* Actions */}
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* EDIT BUTTON */}
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
                            <Edit2 size={18}/>
                        </button>
                        
                        {/* VIEW DETAILS BUTTON (REPLACED DELETE) */}
                        <button onClick={() => handleView(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir Détails">
                            <Eye size={18}/>
                        </button>
                      </div>
                      
                      {item.eosb_pdf ? (
                        <a href={item.eosb_pdf} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors">
                          <Download size={14} /> Reçu
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 italic">Pas de document</span>
                      )}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center pt-8">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold px-4 text-slate-600">Page {currentPage} / {totalPages || 1}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};