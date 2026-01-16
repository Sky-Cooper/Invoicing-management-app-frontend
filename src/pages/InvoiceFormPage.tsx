import  { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ArrowLeft, Receipt,
  Search, LayoutPanelTop, Calendar, 
  ChevronLeft, ChevronRight, X, Filter,
  ArrowUpDown, CheckCircle2, AlertCircle
} from 'lucide-react';

// Hooks et Redux
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchInvoices, type Invoice } from '../store/slices/invoiceSlice';
import { fetchItems } from '../store/slices/itemSlice';

// COMPOSANTS
import { InvoiceForm } from '../components/InvoiceForm'; 
import { InvoiceTable } from '../components/InvoiceTable'; 
import { InvoiceDetailsModal } from '../components/InvoiceDetailsModal';
import { InvoiceEditModal } from '../components/InvoiceEditModal';

// --- TYPES LOCAUX ---
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
type StatusFilter = 'ALL' | 'PAID' | 'DRAFT' | 'CANCELLED'; 

export const InvoicesPage = () => {
  const dispatch = useAppDispatch();
  const { invoices, isLoading } = useAppSelector((state) => state.invoices);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- NAVIGATION & MODALES ---
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- CONTROL BAR STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  
  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchInvoices());
      dispatch(fetchItems());
    }
  }, [dispatch, accessToken]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, statusFilter]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setStatusFilter('ALL');
    setSortBy('date_desc');
  };

  // --- MOTEUR DE FILTRAGE & TRI (Memoized) ---
  const processedInvoices = useMemo(() => {
    if (!invoices) return [];
    
    // 1. FILTER
    let result = invoices.filter(inv => {
      const term = searchTerm.toLowerCase();
      // Ensure we check existance before toLowerCase to avoid crashes
      const matchesSearch = (inv.invoice_number || "").toLowerCase().includes(term) || 
                            (inv.client_name || "").toLowerCase().includes(term);
      
      let matchesDate = true;
      if (startDate || endDate) {
        const invDate = new Date(inv.issued_date).getTime();
        const start = startDate ? new Date(startDate).getTime() : -Infinity;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        matchesDate = invDate >= start && invDate <= end;
      }

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });

    // 2. SORT
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
  }, [invoices, searchTerm, startDate, endDate, statusFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(processedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = processedInvoices.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = searchTerm !== "" || startDate !== "" || endDate !== "" || statusFilter !== 'ALL';

  // --- HANDLERS ---
  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-400 mx-auto p-4 lg:p-10 space-y-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div 
            key="list" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* --- HEADER: TITLE & KPI --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                  <div className="relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <Receipt size={28} className="text-red-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Factures
                  </h1>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tourtra Financial
                  </p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                  onClick={() => setShowForm(true)}
                  className="group relative overflow-hidden bg-slate-900 text-white pl-6 pr-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-3"
              >
                  <div className="absolute inset-0 bg-linear-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus size={18} className="relative z-10" strokeWidth={3} /> 
                  <span className="relative z-10">Nouvelle Facture</span>
              </button>
            </div>

            {/* --- ELITE CONTROL BAR --- */}
            <div className="bg-white p-1.5 rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col xl:flex-row gap-2">
              
              {/* STATUS TABS */}
              <div className="bg-slate-100/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tout', icon: LayoutPanelTop },
                  { id: 'PAID', label: 'Payées', icon: CheckCircle2 },
                  { id: 'DRAFT', label: 'Impayées', icon: AlertCircle }, 
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as StatusFilter)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                      ${statusFilter === tab.id 
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}
                    `}
                  >
                    <tab.icon size={14} className={statusFilter === tab.id ? 'text-red-600' : ''} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="h-px w-full xl:h-auto xl:w-px bg-slate-100 mx-2"></div>

              {/* SEARCH & DATE & SORT */}
              <div className="flex-1 flex flex-col md:flex-row items-center gap-2">
                
                {/* Search */}
                <div className="relative group w-full md:flex-1 h-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="Rechercher un client, N°..."
                    className="w-full h-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:shadow-sm transition-all placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Date Picker Group */}
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

                {/* Sort Toggle */}
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

                {/* Reset Button */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={handleResetFilters}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      title="Tout effacer"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* --- MAIN CONTENT CARD --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-150">
                
                {/* Table Header */}
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultats</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold">
                        {processedInvoices.length}
                      </span>
                   </div>
                   
                   {/* Pagination (Compact) */}
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

                {/* Table Content */}
                <div className="flex-1 relative">
                    {processedInvoices.length === 0 && !isLoading ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                             <Filter size={32} className="text-slate-300" />
                          </div>
                          <h3 className="text-slate-900 font-bold text-lg">Aucun résultat</h3>
                          <p className="text-slate-400 text-sm mt-1 max-w-xs">
                             Aucune facture ne correspond à vos filtres actuels.
                          </p>
                          <button 
                             onClick={handleResetFilters} 
                             className="mt-6 text-xs font-bold text-red-600 uppercase tracking-wider hover:underline"
                          >
                             Réinitialiser
                          </button>
                       </div>
                    ) : (
                      <div className="p-2">
                        <InvoiceTable 
                            invoices={paginatedInvoices} 
                            isLoading={isLoading} 
                            onView={handleOpenDetails} 
                            onEdit={handleEdit} 
                        />
                      </div>
                    )}
                </div>

                {/* Footer Gradient */}
                <div className="h-2 bg-linear-to-r from-red-500/10 via-slate-100 to-red-500/10"></div>
            </div>
          </motion.div>
        ) : (
          // --- FORMULAIRE VIEW (Clean & Centered) ---
          <motion.div 
            key="form" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="max-w-5xl mx-auto pt-4"
          >
            <div className="flex items-center gap-6 mb-8">
              <button 
                onClick={() => setShowForm(false)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-bold uppercase tracking-wide">Retour</span>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle Facture</h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-8 lg:p-12">
                    <InvoiceForm onCancel={() => setShowForm(false)} />
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InvoiceDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        invoice={selectedInvoice} 
      />

      <InvoiceEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setInvoiceToEdit(null);
        }} 
        invoice={invoiceToEdit} 
      />
    </div>
  );
};

export default InvoicesPage;