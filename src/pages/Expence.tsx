import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, DollarSign, Search, Briefcase, Pencil, X,
  Loader2, TrendingDown, ChevronDown, Building2, AlertCircle, CheckCircle2,
  Tags, Truck, Hammer, Users, Upload, Image as ImageIcon, Trash2, Plus,
  Filter, Calendar as CalendarIcon, RotateCcw
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchExpenses, addExpense, updateExpense } from '../store/slices/expensesSlice'; 
import { fetchChantiers } from '../store/slices/chantierSlice'; 

// --- CONFIGURATION ---
const API_BASE_URL = 'https://api.tourtra.ma'; 

// --- HELPER ---
const getFullImageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined; 
  if (path.startsWith('http')) return path; 
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

interface ExpenseFormData {
  chantier: string;
  title: string;
  category: string;
  amount: string;
  description: string;
  expense_date: string;
  image: File | null; 
}

const formatMoney = (amount: string | number) => {
  return new Intl.NumberFormat('fr-MA', { 
    style: 'decimal', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
   }).format(Number(amount));
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'TRANSPORT': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'Transport' };
    case 'MATERIAL': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Briefcase, label: 'Matériaux' };
    case 'EQUIPMENT': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: Hammer, label: 'Équipement' };
    case 'LABOR': return { color: 'text-purple-600', bg: 'bg-purple-50', icon: Users, label: "Main d'œuvre" };
    default: return { color: 'text-slate-600', bg: 'bg-slate-50', icon: Tags, label: 'Autre' };
  }
};

export const ExpensesPage = () => {
  const dispatch = useAppDispatch();
  const { expenses } = useAppSelector((state) => state.expenses);
  const { items: realChantiers, isLoading: loadingChantiers } = useAppSelector((state) => state.chantiers);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfig, setFilterConfig] = useState({
    category: '',
    chantierId: '',
    startDate: '',
    endDate: ''
  });

  // --- OTHER STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; expense: any | null }>({ isOpen: false, expense: null });
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string; }>({ isOpen: false, type: 'success', title: '', message: '' });
  const [isTotalModalOpen, setIsTotalModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); 

  const [formData, setFormData] = useState<ExpenseFormData>({
    chantier: '', title: '', category: 'MATERIAL', amount: '', description: '',
    expense_date: new Date().toISOString().split('T')[0], image: null, 
  });

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchExpenses());
      dispatch(fetchChantiers());
    }
  }, [dispatch, accessToken]);

  // --- FILTERING LOGIC ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const chantierName = typeof exp.chantier === 'object' ? exp.chantier.name : '';
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            chantierName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterConfig.category === '' || exp.category === filterConfig.category;
      
      const expChantierId = typeof exp.chantier === 'object' ? exp.chantier.id.toString() : exp.chantier?.toString();
      const matchesChantier = filterConfig.chantierId === '' || expChantierId === filterConfig.chantierId;

      const matchesDate = (!filterConfig.startDate || exp.expense_date >= filterConfig.startDate) &&
                          (!filterConfig.endDate || exp.expense_date <= filterConfig.endDate);

      return matchesSearch && matchesCategory && matchesChantier && matchesDate;
    });
  }, [expenses, searchTerm, filterConfig]);

  const totalFilteredAmount = useMemo(() => 
    filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0), 
  [filteredExpenses]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterConfig({ category: '', chantierId: '', startDate: '', endDate: '' });
  };

  // ... (handleFileChange, handleRemoveFile, handleEdit, cancelEdit, handleSubmit logic remains identical to your original code)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreviewUrl(null);
  };

  const handleEdit = (exp: any) => {
    setIsEditing(true);
    setEditId(exp.id);
    const chantierId = typeof exp.chantier === 'object' ? exp.chantier?.id : exp.chantier;
    setFormData({
      chantier: chantierId?.toString() || '',
      title: exp.title,
      category: exp.category,
      amount: exp.amount.toString(),
      description: exp.description || '',
      expense_date: exp.expense_date,
      image: null, 
    });
    setPreviewUrl(exp.document ? getFullImageUrl(exp.document) || null : null);
    setIsFormModalOpen(true); 
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setPreviewUrl(null);
    setFormData({
      chantier: '', title: '', category: 'MATERIAL', amount: '', description: '',
      expense_date: new Date().toISOString().split('T')[0], image: null,
    });
    setIsFormModalOpen(false); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...formData, chantier: Number(formData.chantier) };
    try {
      if (isEditing && editId) {
        await dispatch(updateExpense({ id: editId, data: payload as any })).unwrap();
        setFeedbackModal({ isOpen: true, type: 'success', title: 'Mise à jour réussie', message: `La dépense "${formData.title}" a été modifiée.` });
      } else {
        await dispatch(addExpense(payload as any)).unwrap();
        setFeedbackModal({ isOpen: true, type: 'success', title: 'Dépense Enregistrée', message: `La dépense "${formData.title}" a été ajoutée.` });
      }
      cancelEdit();
      dispatch(fetchExpenses()); 
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', title: 'Erreur', message: typeof err === 'string' ? err : "Une erreur est survenue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeFeedback = () => setFeedbackModal(prev => ({ ...prev, isOpen: false }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 relative">
      
      {/* 1. FEEDBACK MODAL */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeFeedback} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-4xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden" >
              <div className={`p-8 text-center space-y-6 ${feedbackModal.type === 'success' ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
                <div className="flex justify-center">
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg mb-2 ${feedbackModal.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {feedbackModal.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black tracking-tight ${feedbackModal.type === 'success' ? 'text-emerald-900' : 'text-rose-900'}`}>{feedbackModal.title}</h3>
                  <p className="text-slate-500 font-medium text-sm px-4">{feedbackModal.message}</p>
                </div>
                <button onClick={closeFeedback} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${feedbackModal.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}>Continuer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOTAL MODAL (Same as original) */}
      <AnimatePresence>
        {isTotalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTotalModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden">
              <div className="p-10 text-center space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 shadow-inner"><TrendingDown size={48} strokeWidth={2.5} /></div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.25em]">Filtré / Total</h3>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <p className="text-4xl sm:text-5xl font-black text-slate-900 break-all leading-tight">{formatMoney(totalFilteredAmount)} <span className="text-lg text-slate-400 font-bold">DH</span></p>
                  </div>
                  <button onClick={() => setIsTotalModalOpen(false)} className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl">Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORM MODAL (Same as original but with cancelEdit fixes) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelEdit} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col">
                <div className={`px-8 py-6 text-white relative overflow-hidden shrink-0 ${isEditing ? 'bg-[#2563EB]' : 'bg-slate-900'}`}>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2"><div className={`h-2 w-2 rounded-full animate-pulse ${isEditing ? 'bg-white' : 'bg-rose-500'}`} /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{isEditing ? 'Mode Édition' : 'Nouveau'}</span></div>
                            <h2 className="text-2xl font-black">{isEditing ? 'Modifier Dépense' : 'Ajouter une Dépense'}</h2>
                        </div>
                        <button onClick={cancelEdit} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md"><X size={20} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Chantier Affecté</label>
                            <div className="relative">
                                <select required disabled={loadingChantiers} className="w-full pl-5 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-slate-200 outline-none appearance-none transition-all cursor-pointer" value={formData.chantier} onChange={e => setFormData({...formData, chantier: e.target.value})}>
                                    <option value="">Sélectionner un chantier...</option>
                                    {realChantiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Titre</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-slate-200 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                            <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label><select className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm focus:border-slate-200 outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option value="MATERIAL">Matériaux</option><option value="TRANSPORT">Transport</option><option value="LABOR">Main d'œuvre</option><option value="EQUIPMENT">Équipement</option><option value="OTHER">Autre</option></select></div>
                        </div>
                        <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Montant (MAD TTC)</label><div className="relative"><div className="absolute inset-y-0 left-6 flex items-center"><DollarSign className={isEditing ? 'text-[#2563EB]' : 'text-rose-500'} size={24} /></div><input type="number" step="0.01" required className="block w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl text-3xl font-black text-slate-900 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</label><input type="date" required className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm" value={formData.expense_date} onChange={e => setFormData({...formData, expense_date: e.target.value})} /></div>
                            <div className="sm:col-span-2 space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Note</label><input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-medium text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Justificatif</label>
                            {!previewUrl ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-rose-400 hover:bg-slate-50 transition-all"><input type="file" accept="image/*" className="hidden" onChange={handleFileChange} /><Upload className="text-slate-400 mb-2" /><p className="text-xs font-bold text-slate-500">Ajouter une photo</p></label>
                            ) : (
                                <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden group"><img src={previewUrl} className="w-full h-full object-cover" /><button type="button" onClick={handleRemoveFile} className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-all"><Trash2 size={16} /></button></div>
                            )}
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-slate-100 bg-white"><button form="expense-form" type="submit" disabled={isSubmitting} className={`w-full py-4 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${isEditing ? 'bg-[#2563EB]' : 'bg-rose-600'}`}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}{isEditing ? 'Sauvegarder' : 'Enregistrer'}</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
               <h1 className="text-2xl font-black tracking-tight text-slate-800">Gestion Dépenses</h1>
               <p className="text-slate-400 text-sm font-medium">Historique des frais déclarés</p>
            </div>
            
            <button 
                onClick={() => {
                    setFormData({ chantier: '', title: '', category: 'MATERIAL', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0], image: null });
                    setPreviewUrl(null); setIsEditing(false); setIsFormModalOpen(true);
                }}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <Plus size={18} strokeWidth={3} /> Ajouter Dépense
            </button>
          </div>

          {/* --- NEW FILTERS SECTION --- */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                <input type="text" placeholder="Titre ou chantier..." className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 transition-all outline-none border-transparent font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="sm:col-span-3 relative">
                <select className="w-full pl-4 pr-10 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors" value={filterConfig.category} onChange={e => setFilterConfig({...filterConfig, category: e.target.value})}>
                  <option value="">Toutes catégories</option>
                  <option value="MATERIAL">Matériaux</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="LABOR">Main d'œuvre</option>
                  <option value="EQUIPMENT">Équipement</option>
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>

              <div className="sm:col-span-4 relative">
                <select className="w-full pl-4 pr-10 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors" value={filterConfig.chantierId} onChange={e => setFilterConfig({...filterConfig, chantierId: e.target.value})}>
                  <option value="">Tous les chantiers</option>
                  {realChantiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-50">
               <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input type="date" className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none focus:ring-1 focus:ring-rose-200 transition-all" value={filterConfig.startDate} onChange={e => setFilterConfig({...filterConfig, startDate: e.target.value})} />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-300 font-bold">→</span>
                  <div className="relative flex-1 sm:flex-none">
                    <input type="date" className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none focus:ring-1 focus:ring-rose-200 transition-all" value={filterConfig.endDate} onChange={e => setFilterConfig({...filterConfig, endDate: e.target.value})} />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
               </div>

               <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 flex items-center gap-2 transition-colors">
                  <RotateCcw size={14} /> Réinitialiser
               </button>
            </div>
          </div>

          {/* --- LIST SECTION --- */}
          <div className="flex-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp, idx) => {
                  const style = getCategoryStyle(exp.category);
                  const Icon = style.icon;
                  const chantierName = typeof exp.chantier === 'object' ? exp.chantier.name : 'N/A';

                  return (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(idx * 0.03, 0.5) }} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-rose-200 shadow-sm transition-all group relative cursor-pointer" onClick={() => setViewModal({ isOpen: true, expense: exp })}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}><Icon size={20} /></div>
                            <div className="space-y-1 text-left">
                                <p className="font-black text-sm text-slate-800 line-clamp-1">{exp.title}</p>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{chantierName}</span>
                                  <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1"><Users size={10} />{exp.created_by?.full_name || exp.created_by?.username || 'Collaborateur'}</span>
                                  <span className="text-[9px] font-bold text-slate-400">{exp.expense_date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-black text-sm text-rose-600">-{formatMoney(exp.amount)}</p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleEdit(exp)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-all"><Pencil size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center space-y-4">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300"><Search size={32} /></div>
                    <div className="space-y-1">
                        <p className="text-slate-900 font-black">Aucune dépense trouvée</p>
                        <p className="text-slate-400 text-sm font-medium">Ajustez vos filtres ou lancez une nouvelle recherche</p>
                    </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SIDEBAR (Total Widget) */}
        <div className="lg:col-span-4 space-y-8 text-left">
          <div onClick={() => setIsTotalModalOpen(true)} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group sticky top-8" >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors"><TrendingDown size={24} className="text-rose-500" /></div>
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-rose-500">Total Filtré</h3>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-slate-900 truncate">{formatMoney(totalFilteredAmount)} <small className="text-lg text-slate-400 font-medium">DH</small></p>
                {filteredExpenses.length !== expenses.length && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">Sur {expenses.length} dépenses au total</p>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* VIEW MODAL (Logic updated for full_name) */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.expense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal({ isOpen: false, expense: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                   <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 bg-slate-200 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest">{getCategoryStyle(viewModal.expense.category).label}</span></div>
                   <h2 className="text-2xl font-black text-slate-900">{viewModal.expense.title}</h2>
                   <p className="text-rose-600 font-bold text-lg mt-1">-{formatMoney(viewModal.expense.amount)} MAD</p>
                </div>
                <button onClick={() => setViewModal({ isOpen: false, expense: null })} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={20} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chantier</p><div className="flex items-center gap-2 text-slate-700 font-bold"><Building2 size={16} className="text-slate-400" />{typeof viewModal.expense.chantier === 'object' ? viewModal.expense.chantier.name : `ID: ${viewModal.expense.chantier}`}</div></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ajouté par</p><div className="flex items-center gap-2 text-slate-700 font-bold"><Users size={16} className="text-slate-400" />{viewModal.expense.created_by?.full_name || viewModal.expense.created_by?.username || 'Collaborateur'}</div></div>
                 </div>
                 {viewModal.expense.description && (<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Note / Description</p><p className="text-sm text-slate-600 font-medium leading-relaxed">{viewModal.expense.description}</p></div>)}
                 <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ImageIcon size={14} />Justificatif</p><div className="rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 min-h-50 flex items-center justify-center">{viewModal.expense.document ? <img src={getFullImageUrl(viewModal.expense.document)} className="w-full h-auto max-h-100" /> : <div className="text-slate-300 font-bold">Aucun justificatif joint</div>}</div></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};