import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, BadgeCheck, Search, LayoutPanelTop, 
  Filter, CheckCircle2, Clock, 
  FileX, Download, Eye, Truck, Edit2, 
  ChevronLeft, ChevronRight, X, ArrowUpDown, Calendar
} from 'lucide-react';

// Redux
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchPurchaseOrders, type PurchaseOrder } from '../store/slices/purchaseOrderSlice';
import { fetchClients } from '../store/slices/clientSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';

// Components
import { CreatePOModal } from '../components/CreatePOModal'; 
import { PODetailsModal } from '../components/PODetailsModal';
import { POEditModal } from '../components/POEditModal'; 

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
type StatusFilter = 'ALL' | 'DRAFT' | 'SENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const PurchaseOrdersPage = () => {
  const dispatch = useAppDispatch();
  const { items: pos, isLoading } = useAppSelector((state) => state.purchaseOrders);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- STATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // View Details State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [poToEdit, setPoToEdit] = useState<PurchaseOrder | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchPurchaseOrders());
      // Pre-fetch related data
      dispatch(fetchClients());
      dispatch(fetchChantiers());
    }
  }, [dispatch, accessToken]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, statusFilter]);

  // --- FILTERING ---
  const processedPOs = useMemo(() => {
    if (!pos) return [];

    let result = pos.filter(p => {
      const term = searchTerm.toLowerCase();
      const poNum = p.po_number?.toLowerCase() || "";
      const clientName = p.client_name?.toLowerCase() || "";
      const matchesSearch = poNum.includes(term) || clientName.includes(term);

      let matchesDate = true;
      if (startDate || endDate) {
        const pDate = new Date(p.issued_date).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        matchesDate = pDate >= start && pDate <= end;
      }

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });

    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return new Date(a.issued_date).getTime() - new Date(b.issued_date).getTime();
        case 'date_desc': return new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime();
        case 'amount_desc': return parseFloat(b.total_ttc) - parseFloat(a.total_ttc);
        case 'amount_asc': return parseFloat(a.total_ttc) - parseFloat(b.total_ttc);
        default: return 0;
      }
    });

    return result;
  }, [pos, searchTerm, startDate, endDate, statusFilter, sortBy]);

  const totalPages = Math.ceil(processedPOs.length / itemsPerPage);
  const paginatedPOs = processedPOs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const hasActiveFilters = searchTerm !== "" || startDate !== "" || endDate !== "" || statusFilter !== 'ALL';

  // --- HANDLERS ---
  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPO(null);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setPoToEdit(po);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setPoToEdit(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700"><BadgeCheck size={12}/> Confirmé</span>;
      case 'SENT': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700"><CheckCircle2 size={12}/> Envoyé</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white"><Truck size={12}/> Livré</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700"><FileX size={12}/> Annulé</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600"><Clock size={12}/> Brouillon</span>;
    }
  };

  return (
    <div className="mx-auto p-4 lg:p-10 space-y-6 lg:space-y-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      
      {/* MODALS */}
      <CreatePOModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      <PODetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={closeDetailsModal} 
        po={selectedPO} 
      />

      <POEditModal 
        isOpen={isEditModalOpen} 
        onClose={closeEditModal} 
        po={poToEdit} 
      />

      <AnimatePresence mode="wait">
        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 lg:space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-slate-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                <div className="relative p-3 lg:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <FileText size={24} className="text-slate-900 lg:w-7 lg:h-7" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Bons de Commande</h1>
                <p className="text-slate-500 text-[10px] lg:text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span> Gestion des Achats
                </p>
              </div>
            </div>

            <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="group relative overflow-hidden bg-white text-slate-900 border-2 border-slate-900 pl-5 pr-6 py-3 rounded-xl lg:rounded-2xl font-bold text-sm transition-all hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
            >
                <Plus size={18} className="relative z-10" strokeWidth={3} /> 
                <span className="relative z-10">Créer BC</span>
            </button>
          </div>

          {/* CONTROLS */}
          <div className="bg-white p-1.5 rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col xl:flex-row gap-4 xl:gap-2">
            
            {/* Status Tabs (Scrollable on mobile) */}
            <div className="bg-slate-100/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar w-full xl:w-auto pb-2 xl:pb-1">
              {[
                { id: 'ALL', label: 'Tout', icon: LayoutPanelTop },
                { id: 'DRAFT', label: 'Brouillon', icon: Clock },
                { id: 'SENT', label: 'Envoyés', icon: CheckCircle2 },
                { id: 'CONFIRMED', label: 'Confirmés', icon: BadgeCheck },
                { id: 'COMPLETED', label: 'Livrés', icon: Truck },
              ].map((tab) => (
                <button 
                    key={tab.id} 
                    onClick={() => setStatusFilter(tab.id as StatusFilter)} 
                    className={`
                        flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0
                        ${statusFilter === tab.id 
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}
                    `}
                >
                  <tab.icon size={14} className={statusFilter === tab.id ? 'text-white' : ''} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden xl:block h-auto w-px bg-slate-100 mx-2"></div>

            {/* Filters */}
            <div className="flex-1 flex flex-col md:flex-row items-center gap-2 w-full">
              <div className="relative group w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Rechercher BC, Fournisseur..." 
                    className="w-full h-full bg-slate-50 border border-transparent rounded-xl py-3 lg:py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:shadow-sm transition-all placeholder:text-slate-400" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all w-full md:w-auto justify-between md:justify-start">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <div className="flex items-center gap-2 w-full justify-center">
                    <input 
                        type="date" 
                        className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full md:w-24 uppercase cursor-pointer text-center md:text-left"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-slate-300">/</span>
                    <input 
                        type="date" 
                        className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full md:w-24 uppercase cursor-pointer text-center md:text-left"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
              </div>

              <div className="flex items-center bg-slate-50 rounded-xl p-1 w-full md:w-auto relative">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as SortOption)}
                   className="bg-transparent text-xs font-bold text-slate-600 py-3 lg:py-2 pl-3 pr-8 outline-none cursor-pointer hover:text-slate-900 appearance-none w-full md:w-auto"
                 >
                    <option value="date_desc">📅 Plus récent</option>
                    <option value="date_asc">📅 Plus ancien</option>
                    <option value="amount_desc">💰 Montant High</option>
                    <option value="amount_asc">💰 Montant Low</option>
                 </select>
                 <ArrowUpDown size={14} className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => {
                        setSearchTerm("");
                        setStartDate("");
                        setEndDate("");
                        setStatusFilter('ALL');
                    }}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors w-full md:w-auto flex justify-center"
                    title="Tout effacer"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              
              <div className="px-4 lg:px-8 py-4 lg:py-5 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 gap-4">
                 <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultats</span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold">{processedPOs.length}</span>
                 </div>
                 
                 {/* Pagination */}
                 <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button 
                        onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 w-12 text-center">
                        {currentPage}/{totalPages || 1}
                    </span>
                    <button 
                        onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                 </div>
              </div>

              <div className="flex-1 relative min-h-75">
                  {processedPOs.length === 0 && !isLoading ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Filter size={24} className="text-slate-300 lg:w-8 lg:h-8" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-base lg:text-lg">Aucun résultat</h3>
                        <p className="text-slate-400 text-xs lg:text-sm mt-1 max-w-xs">
                           Aucun bon de commande ne correspond à vos filtres actuels.
                        </p>
                     </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-225">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 lg:px-8 py-5">N° Commande</th>
                                <th className="px-6 py-5">Fournisseur</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Livraison Prévue</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Montant TTC</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {paginatedPOs.map((p) => (
                                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                     <td className="px-6 lg:px-8 py-5 font-bold text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                            {p.po_number}
                                        </div>
                                     </td>
                                     <td className="px-6 py-5 font-semibold truncate max-w-37.5">{p.client_name || `ID #${p.client}`}</td>
                                     <td className="px-6 py-5 text-slate-500 font-mono text-xs whitespace-nowrap">{p.issued_date}</td>
                                     <td className="px-6 py-5 text-slate-500 font-mono text-xs whitespace-nowrap">{p.expected_delivery_date || '-'}</td>
                                     <td className="px-6 py-5">{getStatusBadge(p.status)}</td>
                                     <td className="px-6 py-5 text-right font-black text-slate-900 whitespace-nowrap">{p.total_ttc} DH</td>
                                     <td className="px-6 py-5 text-right">
                                         <div className="flex items-center justify-end gap-2">
                                              {p.download_url && (
                                                 <a 
                                                    href={`https://api.tourtra.ma${p.download_url}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Télécharger PDF"
                                                 >
                                                     <Download size={16} />
                                                 </a>
                                              )}
                                              
                                              {/* VIEW */}
                                              <button 
                                                onClick={() => handleView(p)} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Voir Détails"
                                              >
                                                 <Eye size={16} />
                                              </button>

                                              {/* EDIT */}
                                              <button 
                                                onClick={() => handleEdit(p)} 
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Modifier"
                                              >
                                                 <Edit2 size={16} />
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
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};