import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Search, Calendar, ChevronLeft, ChevronRight, 
  Download, Edit2, Briefcase, DollarSign, Filter, X, Eye 
} from 'lucide-react';

// Redux
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchContracts, type WorkingContract } from '../store/slices/contractSlice';

// Components
import { ContractModal } from '../components/ContractModal';

// Helper to format currency
const formatMoney = (amount: string | number) => 
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(amount));

// Helper to check status
const getContractStatus = (endDate: string) => {
  const end = new Date(endDate).getTime();
  const today = new Date().getTime();
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Expiré', color: 'bg-red-100 text-red-700 border-red-200' };
  if (diffDays <= 30) return { label: 'Bientôt Fin', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  return { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
};

export const ContractsPage = () => {
  const dispatch = useAppDispatch();
  const { items: contracts, isLoading } = useAppSelector((state) => state.contracts);
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<WorkingContract | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false); // View mode
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchContracts());
  }, [dispatch]);

  // Filtering
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const term = searchTerm.toLowerCase();
      return (
        c.contract_number.toLowerCase().includes(term) ||
        c.employee.user.first_name.toLowerCase().includes(term) ||
        c.employee.user.last_name.toLowerCase().includes(term) ||
        c.job_title.toLowerCase().includes(term)
      );
    });
  }, [contracts, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleEdit = (contract: WorkingContract) => {
    setSelectedContract(contract);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (contract: WorkingContract) => {
    setSelectedContract(contract);
    setIsReadOnly(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedContract(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      
      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ContractModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            contract={selectedContract}
            readOnly={isReadOnly}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <FileText size={28} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contrats de Travail</h1>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span> Gestion RH
              </p>
            </div>
          </div>

          <button onClick={handleCreate} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
            <Plus size={18} strokeWidth={3} /> Nouveau Contrat
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 max-w-md">
          <div className="p-2 text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher par nom, n° contrat..." 
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

        {/* CONTRACTS GRID */}
        {filteredContracts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Filter className="text-slate-300" size={40} />
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-2">Aucun contrat trouvé</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedContracts.map((contract) => {
              const status = getContractStatus(contract.contract_end_date);
              return (
                <motion.div 
                  key={contract.id} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Top Row: Employee & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                        {contract.employee.user.first_name[0]}{contract.employee.user.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">
                          {contract.employee.user.first_name} {contract.employee.user.last_name}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{contract.contract_number}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500 font-medium"><Briefcase size={14}/> Poste</span>
                      <span className="font-bold text-slate-800">{contract.job_title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500 font-medium"><Calendar size={14}/> Période</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {contract.contract_start_date} <span className="text-slate-300 mx-1">→</span> {contract.contract_end_date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-2 text-slate-500 font-medium"><DollarSign size={14}/> Salaire</span>
                      <span className="font-black text-slate-900">{formatMoney(contract.salary)}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      {/* EDIT BUTTON */}
                      <button onClick={() => handleEdit(contract)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
                        <Edit2 size={18} />
                      </button>
                      
                      {/* VIEW BUTTON (REPLACED DELETE) */}
                      <button onClick={() => handleView(contract)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir détails">
                        <Eye size={18} />
                      </button>
                    </div>
                    
                    {contract.contract_pdf ? (
                      <a 
                        href={contract.contract_pdf} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        <Download size={14} /> PDF
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-slate-300 uppercase italic px-4">Aucun PDF</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
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