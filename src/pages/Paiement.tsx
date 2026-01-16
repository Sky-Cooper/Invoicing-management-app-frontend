import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, DollarSign, Search, 
  Loader2, CheckCircle2,
  Clock, AlertCircle, Pencil
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

export const PaymentsPage = () => {
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector((state) => state.invoices);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- STATES ---
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean; type: 'success' | 'error'; title: string; message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const [payData, setPayData] = useState({
    amount: '',
    payment_method: 'BANK_TRANSFER' as any,
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  // --- LOGIC ---
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchInvoices());
      fetchGlobalRecentPayments();
    }
  }, [dispatch, accessToken]);

  const fetchGlobalRecentPayments = async () => {
    try {
      const res = await safeApi.get('payments/');
      setRecentPayments(res.data.slice(0, 8)); 
    } catch (e) { console.error(e); }
  };

  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.id.toString() === selectedInvoiceId), 
    [invoices, selectedInvoiceId]
  );

  // ✅ UPDATE 1: Auto-fill amount with REMAINING_BALANCE instead of TOTAL_TTC
  useEffect(() => {
    if (selectedInvoice && !isEditing) {
      setPayData(prev => ({ 
        ...prev, 
        amount: selectedInvoice.remaining_balance.toString() // Changed from total_ttc
      }));
    }
  }, [selectedInvoice, isEditing]);

  // Handle Edit Trigger
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingPaymentId(null);
    setSelectedInvoiceId('');
    setPayData({
      amount: '', payment_method: 'BANK_TRANSFER',
      payment_date: new Date().toISOString().split('T')[0],
      reference: '', notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    setIsSubmitting(true);

    try {
      if (isEditing && editingPaymentId) {
        await dispatch(updatePayment({ 
            id: editingPaymentId, 
            data: { ...payData, invoice: parseInt(selectedInvoiceId) } 
        })).unwrap();
        
        setFeedbackModal({
          isOpen: true, type: 'success', title: 'Règlement Modifié',
          message: 'Les informations du paiement ont été mises à jour.'
        });
      } else {
        await dispatch(addPayment({ ...payData, invoice: parseInt(selectedInvoiceId) })).unwrap();
        setFeedbackModal({
          isOpen: true, type: 'success', title: 'Paiement Enregistré',
          message: `Le règlement de ${formatMoney(payData.amount)} DH a été validé.`
        });
      }

      cancelEdit();
      dispatch(fetchInvoices()); // Refresh invoices to get new remaining balance
      fetchGlobalRecentPayments();

    } catch (err: any) {
      setFeedbackModal({
        isOpen: true, type: 'error', title: 'Erreur',
        message: "Une erreur est survenue lors de l'opération."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 relative">
      
      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFeedbackModal({...feedbackModal, isOpen: false})} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-4xl p-8 shadow-2xl w-full max-w-md relative z-10 text-center space-y-6">
              <div className={`h-20 w-20 mx-auto rounded-full flex items-center justify-center ${feedbackModal.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {feedbackModal.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
              </div>
              <div>
                <h3 className="text-2xl font-black">{feedbackModal.title}</h3>
                <p className="text-slate-500 text-sm mt-2">{feedbackModal.message}</p>
              </div>
              <button onClick={() => setFeedbackModal({...feedbackModal, isOpen: false})} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Continuer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-400 mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. LEFT: LIST */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-120px)] sticky top-8 text-left">
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-slate-800">Facturation</h1>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500" size={18} />
              <input type="text" placeholder="Rechercher..." className="w-full bg-white ring-1 ring-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-rose-500 shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {invoices
              .filter(inv => inv.status !== 'PAID' && (inv.invoice_number.includes(searchTerm) || inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())))
              .map((inv) => (
                <button key={inv.id} onClick={() => { if(!isEditing) setSelectedInvoiceId(inv.id.toString()) }} className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative ${selectedInvoiceId === inv.id.toString() ? 'border-rose-500 bg-white shadow-xl shadow-rose-500/10' : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}>
                   <div className="flex justify-between items-start mb-1">
                      <p className="font-black text-sm text-slate-700">{inv.invoice_number}</p>
                      {/* Optional: Show remaining balance in list too */}
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Reste: {formatMoney(inv.remaining_balance)}</span>
                   </div>
                   <p className="text-xs font-semibold text-slate-400 truncate mb-2">{inv.client_name}</p>
                   <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                      <span className="text-[10px] text-slate-400 font-bold">Total TTC</span>
                      <p className="text-right font-black text-slate-900">{formatMoney(inv.total_ttc)} DH</p>
                   </div>
                </button>
              ))}
          </div>
        </div>

        {/* 2. CENTER: FORM (ADD/EDIT) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedInvoice ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-4xl shadow-2xl border border-slate-100 overflow-hidden sticky top-8">
                <div className={`p-8 text-white relative transition-colors duration-500 ${isEditing ? 'bg-blue-600' : 'bg-slate-900'}`}>
                  <div className="relative z-10 text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {isEditing ? 'Modification du règlement' : 'Nouveau règlement'}
                    </span>
                    <h2 className="text-3xl font-black mt-1">{isEditing ? 'Éditer' : 'Encaisser'}</h2>
                    <p className="text-sm opacity-70 mt-1 mb-4">{selectedInvoice.invoice_number} • {selectedInvoice.client_name}</p>
                    
                    {/* ✅ UPDATE 2: Visual Indicator for Remaining Balance */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <AlertCircle size={16} className="text-yellow-400" />
                        <span className="text-xs font-bold uppercase tracking-wide">Reste à payer : <span className="text-white text-sm">{formatMoney(selectedInvoice.remaining_balance)} DH</span></span>
                    </div>

                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Montant</label>
                        {/* ✅ UPDATE 3: Button fills REMAINING balance, not TOTAL */}
                        {!isEditing && (
                            <button 
                                type="button" 
                                onClick={() => setPayData({...payData, amount: selectedInvoice.remaining_balance.toString()})} 
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            >
                                PAYER LE RESTE
                            </button>
                        )}
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500" size={28} />
                      <input type="number" step="0.01" required className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent rounded-3xl text-4xl font-black text-slate-900 focus:bg-white focus:border-rose-500 outline-none" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Méthode</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={payData.payment_method} onChange={e => setPayData({...payData, payment_method: e.target.value as any})}>
                        <option value="BANK_TRANSFER">🏦 Virement</option>
                        <option value="CHECK">✍️ Chèque</option>
                        <option value="CASH">💵 Espèces</option>
                        <option value="CREDIT_CARD">💳 Carte</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                      <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={payData.payment_date} onChange={e => setPayData({...payData, payment_date: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Référence / Notes</label>
                    <input type="text" placeholder="Référence transaction..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={payData.reference} onChange={e => setPayData({...payData, reference: e.target.value})} />
                  </div>

                  <div className="pt-4 space-y-3">
                    <button type="submit" disabled={isSubmitting} className={`w-full py-5 rounded-[20px] text-white font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 ${isEditing ? 'bg-blue-600 shadow-blue-200' : 'bg-rose-600 shadow-rose-200'}`}>
                      {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEditing ? 'Enregistrer les modifications' : "Confirmer l'encaissement")}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={cancelEdit} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Annuler la modification</button>
                    )}
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="h-full min-h-150 flex flex-col items-center justify-center p-12 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 sticky top-8">
                <Wallet size={40} className="text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-800">Sélectionnez une facture</h3>
                <p className="text-slate-400 text-sm mt-2">Choisissez un document à gauche pour traiter le paiement.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. RIGHT: HISTORY */}
        <div className="lg:col-span-3 space-y-8 sticky top-8 text-left">
          <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <Clock size={14} /> Historique
            </h3>
            <div className="space-y-6">
              {recentPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <CheckCircle2 size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{formatMoney(p.amount)} DH</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{p.payment_method}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartEdit(p)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};