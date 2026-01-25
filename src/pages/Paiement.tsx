import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Search, 
  Loader2, 
  Clock, Plus, X, ArrowUpDown, Pencil, Calendar, CreditCard
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchInvoices } from '../store/slices/invoiceSlice';
import { addPayment, updatePayment } from '../store/slices/paymentSlice';
import { safeApi } from '../api/client';

const formatMoney = (amount: string | number) => {
  return new Intl.NumberFormat('fr-MA', { 
    style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 
  }).format(Number(amount));
};

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';

export const PaymentsPage = () => {
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector((state) => state.invoices);
  const { accessToken } = useAppSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [historySort, setHistorySort] = useState<SortOption>('date-desc');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  const [payData, setPayData] = useState({
    amount: '',
    payment_method: 'BANK_TRANSFER' as any,
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchInvoices());
      fetchGlobalRecentPayments();
    }
  }, [dispatch, accessToken]);

  const fetchGlobalRecentPayments = async () => {
    try {
      const res = await safeApi.get('payments/');
      setRecentPayments(res.data); 
    } catch (e) { console.error(e); }
  };

  const sortedHistory = useMemo(() => {
    const data = [...recentPayments];
    switch (historySort) {
      case 'date-desc': return data.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
      case 'date-asc': return data.sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
      case 'price-desc': return data.sort((a, b) => b.amount - a.amount);
      case 'price-asc': return data.sort((a, b) => a.amount - b.amount);
      default: return data;
    }
  }, [recentPayments, historySort]);

  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.id.toString() === selectedInvoiceId), 
    [invoices, selectedInvoiceId]
  );

  const openAddPayment = (inv: any) => {
    setIsEditing(false);
    setSelectedInvoiceId(inv.id.toString());
    setPayData({
      amount: inv.remaining_balance.toString(),
      payment_method: 'BANK_TRANSFER',
      payment_date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleStartEdit = (payment: any) => {
    setIsEditing(true);
    setEditingPaymentId(payment.id);
    setSelectedInvoiceId(payment.invoice.toString());
    setPayData({
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      reference: payment.reference,
      notes: payment.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingPaymentId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && editingPaymentId) {
        await dispatch(updatePayment({ id: editingPaymentId, data: { ...payData, invoice: parseInt(selectedInvoiceId) } })).unwrap();
      } else {
        await dispatch(addPayment({ ...payData, invoice: parseInt(selectedInvoiceId) })).unwrap();
      }
      closeModal();
      dispatch(fetchInvoices());
      fetchGlobalRecentPayments();
    } catch (err: any) {
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-4xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <button onClick={closeModal} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-20"><X size={24} /></button>
              <div className={`p-8 text-white ${isEditing ? 'bg-blue-600' : 'bg-slate-900'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{isEditing ? 'Modification' : 'Nouvel Encaissement'}</span>
                <h2 className="text-2xl font-black mt-1">{selectedInvoice?.invoice_number || 'Paiement'}</h2>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-xs font-bold">Reste: {formatMoney(selectedInvoice?.remaining_balance || 0)} DH</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Montant</label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500" size={24} />
                    <input type="number" step="0.01" required className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-2xl font-black focus:bg-white focus:border-rose-500 outline-none" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Méthode</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200" value={payData.payment_method} onChange={e => setPayData({...payData, payment_method: e.target.value as any})}>
                      <option value="BANK_TRANSFER">Virement</option>
                      <option value="CHECK">Chèque</option>
                      <option value="CASH">Espèces</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Date</label>
                    <input type="date" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-slate-200" value={payData.payment_date} onChange={e => setPayData({...payData, payment_date: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-xl text-white font-black uppercase text-xs tracking-widest transition-all ${isEditing ? 'bg-blue-600' : 'bg-rose-600'}`}>
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEditing ? 'Enregistrer' : 'Valider')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-350 mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: INVOICE LIST --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Paiements</h1>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Numéro ou client..." className="w-full bg-white rounded-2xl pl-12 pr-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500 shadow-sm transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices
              .filter(inv => inv.status !== 'PAID' && (inv.invoice_number.includes(searchTerm) || inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())))
              .map((inv) => (
                <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="max-w-[60%]">
                            <p className="font-black text-slate-800 truncate">{inv.invoice_number}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{inv.client_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-rose-600">{formatMoney(inv.remaining_balance)} DH</p>
                            <span className="inline-block text-[9px] font-bold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full uppercase">Reste</span>
                        </div>
                    </div>
                    <button onClick={() => openAddPayment(inv)} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">
                        <Plus size={14} /> Nouveau Paiement
                    </button>
                </div>
              ))}
          </div>
        </div>

        {/* --- RIGHT: HISTORY (MODERNIZED) --- */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-4xl p-6 lg:p-8 sticky top-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-lg text-slate-800">Historique</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dernières transactions</p>
              </div>
              <div className="relative">
                <select 
                  className="appearance-none bg-slate-100 text-[10px] font-black uppercase pl-4 pr-10 py-2.5 rounded-xl outline-none border-none hover:bg-slate-200 transition-colors"
                  value={historySort}
                  onChange={(e) => setHistorySort(e.target.value as SortOption)}
                >
                  <option value="date-desc">Récent</option>
                  <option value="date-asc">Ancien</option>
                  <option value="price-desc">Prix: +</option>
                  <option value="price-asc">Prix: -</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {sortedHistory.map((p, i) => (
                <div key={i} className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                      <CreditCard size={20} className="text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{formatMoney(p.amount)} DH</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Calendar size={10} /> {p.payment_date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-blue-600 uppercase">{p.payment_method.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleStartEdit(p)} 
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                    title="Modifier ce paiement"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}

              {sortedHistory.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <Clock size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">Aucun historique</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};