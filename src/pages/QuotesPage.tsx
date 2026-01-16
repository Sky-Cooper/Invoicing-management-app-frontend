import  { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, BadgeCheck, Search, LayoutPanelTop, 
  Calendar, ChevronLeft, ChevronRight, X, Filter,
  ArrowUpDown, CheckCircle2, AlertCircle, Clock, 
  FileX, Download, Eye, Edit2 // Added Edit2 icon
} from 'lucide-react';

// --- REDUX & STORE ---
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchQuotes, type Quote } from '../store/slices/quoteSlice';
// We fetch clients/chantiers here too so the cache is ready for the modal
import { fetchClients } from '../store/slices/clientSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';

// --- COMPONENTS ---
import { CreateQuoteModal } from '../components/CreateQuoteModal'; 
import { QuoteDetailsModal } from '../components/QuoteDetailsModal';
import { QuoteEditModal } from '../components/QuoteEditModal'; // Ensure this path is correct

// --- TYPES ---
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
type StatusFilter = 'ALL' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export const QuotesPage = () => {
  const dispatch = useAppDispatch();
  const { items: quotes, isLoading } = useAppSelector((state) => state.quotes);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- STATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // View/Details State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Edit State (NEW)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  
  // Filters & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- DATA FETCHING ---
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchQuotes());
      // Pre-fetch data for the modal to ensure dropdowns are populated
      dispatch(fetchClients());
      dispatch(fetchChantiers());
    }
  }, [dispatch, accessToken]);

  // Reset pagination when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, statusFilter]);

  // --- FILTERING & SORTING LOGIC ---
  const processedQuotes = useMemo(() => {
    if (!quotes) return [];

    // 1. Filter
    let result = quotes.filter(q => {
      const term = searchTerm.toLowerCase();
      // Safe check for fields incase API returns null
      const quoteNum = q.quote_number?.toLowerCase() || "";
      const clientName = q.client_name?.toLowerCase() || "";
      
      const matchesSearch = quoteNum.includes(term) || clientName.includes(term);

      let matchesDate = true;
      if (startDate || endDate) {
        const qDate = new Date(q.issued_date).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        matchesDate = qDate >= start && qDate <= end;
      }

      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });

    // 2. Sort
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.issued_date).getTime() - new Date(b.issued_date).getTime();
        case 'date_desc':
          return new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime();
        case 'amount_desc':
          return parseFloat(b.total_ttc) - parseFloat(a.total_ttc);
        case 'amount_asc':
          return parseFloat(a.total_ttc) - parseFloat(b.total_ttc);
        default:
          return 0;
      }
    });

    return result;
  }, [quotes, searchTerm, startDate, endDate, statusFilter, sortBy]);

  // --- PAGINATION CALCS ---
  const totalPages = Math.ceil(processedQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = processedQuotes.slice(startIndex, startIndex + itemsPerPage);
  const hasActiveFilters = searchTerm !== "" || startDate !== "" || endDate !== "" || statusFilter !== 'ALL';

  // --- HANDLERS ---

  const handleView = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedQuote(null);
  };

  // NEW: Edit Handler
  const handleEdit = (quote: Quote) => {
    setQuoteToEdit(quote);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setQuoteToEdit(null);
  };

  // --- HELPER: STATUS BADGE ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700"><BadgeCheck size={12}/> Accepté</span>;
      case 'SENT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700"><CheckCircle2 size={12}/> Envoyé</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700"><FileX size={12}/> Refusé</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700"><AlertCircle size={12}/> Expiré</span>;
      default: // DRAFT
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600"><Clock size={12}/> Brouillon</span>;
    }
  };

  return (
    <div className="mx-auto p-4 lg:p-10 space-y-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      
      {/* --- MODALS --- */}
      <CreateQuoteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <QuoteDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        quote={selectedQuote}
      />

      <QuoteEditModal 
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        quote={quoteToEdit}
      />

      <AnimatePresence mode="wait">
        <motion.div 
          key="content"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-8"
        >
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-slate-800 blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                <div className="relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <FileText size={28} className="text-slate-900" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Devis
                </h1>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
                  Gestion Commerciale
                </p>
              </div>
            </div>

            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative overflow-hidden bg-white text-slate-900 border-2 border-slate-900 pl-6 pr-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 flex items-center gap-3"
            >
                <Plus size={18} className="relative z-10" strokeWidth={3} /> 
                <span className="relative z-10">Nouveau Devis</span>
            </button>
          </div>

          {/* --- CONTROL BAR --- */}
          <div className="bg-white p-1.5 rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col xl:flex-row gap-2">
            
            {/* Status Tabs */}
            <div className="bg-slate-100/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Tout', icon: LayoutPanelTop },
                { id: 'DRAFT', label: 'Brouillon', icon: Clock },
                { id: 'SENT', label: 'Envoyés', icon: CheckCircle2 },
                { id: 'ACCEPTED', label: 'Acceptés', icon: BadgeCheck },
                { id: 'REJECTED', label: 'Refusés', icon: FileX },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as StatusFilter)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
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

            <div className="h-px w-full xl:h-auto xl:w-px bg-slate-100 mx-2"></div>

            {/* Filters */}
            <div className="flex-1 flex flex-col md:flex-row items-center gap-2">
              <div className="relative group w-full md:flex-1 h-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Rechercher client, N°..."
                  className="w-full h-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:shadow-sm transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all w-full md:w-auto">
                  <Calendar size={16} className="text-slate-400" />
                  <input 
                    type="date" 
                    className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 uppercase cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-slate-300">/</span>
                  <input 
                    type="date" 
                    className="bg-transparent text-xs font-bold text-slate-600 outline-none w-24 uppercase cursor-pointer"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
              </div>

              <div className="flex items-center bg-slate-50 rounded-xl p-1 w-full md:w-auto">
                 <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-bold text-slate-600 py-2 pl-2 pr-6 outline-none cursor-pointer hover:text-slate-900 appearance-none w-full md:w-auto"
                 >
                    <option value="date_desc">📅 Plus récent</option>
                    <option value="date_asc">📅 Plus ancien</option>
                    <option value="amount_desc">💰 Montant High</option>
                    <option value="amount_asc">💰 Montant Low</option>
                 </select>
                 <ArrowUpDown size={14} className="text-slate-400 -ml-5 pointer-events-none" />
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
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    title="Tout effacer"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* --- DATA TABLE --- */}
          <div className="bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col ">
              
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultats</span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold">
                      {processedQuotes.length}
                    </span>
                 </div>
                 
                 {/* Pagination */}
                 <div className="flex items-center gap-1">
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

              <div className="flex-1 relative">
                  {processedQuotes.length === 0 && !isLoading ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                           <Filter size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">Aucun résultat</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs">
                           Aucun devis ne correspond à vos filtres actuels.
                        </p>
                     </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Numéro</th>
                                <th className="px-6 py-5">Client</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Montant TTC</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {paginatedQuotes.map((q) => (
                                <tr key={q.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                     <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                            <FileText size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                            {q.quote_number}
                                        </div>
                                     </td>
                                     <td className="px-6 py-5">
                                         <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">
                                                {q.client_name ? q.client_name[0].toUpperCase() : '?'}
                                            </div>
                                            <span className="font-semibold">{q.client_name || `Client #${q.client}`}</span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-5 text-slate-500 font-mono text-xs">{q.issued_date}</td>
                                     <td className="px-6 py-5">
                                        {getStatusBadge(q.status)}
                                     </td>
                                     <td className="px-6 py-5 text-right font-black text-slate-900">{q.total_ttc} DH</td>
                                     <td className="px-6 py-5 text-right">
                                         <div className="flex items-center justify-end gap-2">
                                             {q.download_url && (
                                                 <a 
                                                    href={`http://127.0.0.1:8000${q.download_url}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Télécharger PDF"
                                                 >
                                                     <Download size={16} />
                                                 </a>
                                             )}
                                             
                                             {/* VIEW BUTTON */}
                                             <button 
                                                onClick={() => handleView(q)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Voir Détails"
                                             >
                                                 <Eye size={16} />
                                             </button>

                                             {/* EDIT BUTTON (NEW) */}
                                             <button 
                                                onClick={() => handleEdit(q)}
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