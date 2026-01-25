import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, DollarSign, Plus,
  Loader2, X,
  Clock, Pencil
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

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
      setRecentPayments(res.data); 
    } catch (e) { console.error(e); }
  };

  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.id.toString() === selectedInvoiceId), 
    [invoices, selectedInvoiceId]
  );

  useEffect(() => {
    if (selectedInvoice && !isEditing) {
      setPayData(prev => ({ 
        ...prev, 
        amount: selectedInvoice.remaining_balance.toString()
      }));
    }
  }, [selectedInvoice, isEditing]);

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

  const closeForm = () => {
    setIsModalOpen(false);
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
      } else {
        await dispatch(addPayment({ ...payData, invoice: parseInt(selectedInvoiceId) })).unwrap();
      }
      closeForm();
      dispatch(fetchInvoices());
      fetchGlobalRecentPayments();
    } catch (err: any) {
      alert("Erreur lors de l'opération");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Paiements</h1>
          <p className="text-slate-500 font-medium">Gérez l'historique et encaissez vos factures</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-lg shadow-rose-200 active:scale-95"
        >
          <Plus size={20} />
          NOUVEAU PAIEMENT
        </button>
      </div>

      {/* MAIN CONTENT: HISTORY */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-2">
            <Clock className="text-slate-400" size={18} />
            <h2 className="font-black text-slate-700 uppercase tracking-widest text-sm">Historique des transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client / Facture</th>
                  <th className="px-6 py-4">Méthode</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{p.payment_date}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">Facture #{p.invoice}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{p.reference || 'Sans référence'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-600">{p.payment_method}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{formatMoney(p.amount)} DH</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleStartEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentPayments.length === 0 && (
              <div className="p-20 text-center">
                <Wallet className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">Aucun paiement trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL (THE FORM) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className={`p-8 text-white flex justify-between items-start ${isEditing ? 'bg-blue-600' : 'bg-slate-900'}`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Saisie de transaction</span>
                  <h2 className="text-3xl font-black">{isEditing ? 'Modifier le paiement' : 'Nouvel Encaissement'}</h2>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Invoice Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sélectionner la Facture</label>
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl font-bold outline-none"
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    disabled={isEditing}
                  >
                    <option value="">Choisir un document...</option>
                    {invoices.filter(inv => inv.status !== 'PAID' || isEditing).map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.client_name} (Reste: {inv.remaining_balance} DH)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Montant (DH)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={20} />
                      <input 
                        type="number" step="0.01" required 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xl font-black outline-none border-2 border-transparent focus:border-rose-500"
                        value={payData.amount}
                        onChange={e => setPayData({...payData, amount: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Method */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Méthode</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                      value={payData.payment_method}
                      onChange={e => setPayData({...payData, payment_method: e.target.value as any})}
                    >
                      <option value="BANK_TRANSFER">🏦 Virement</option>
                      <option value="CHECK">✍️ Chèque</option>
                      <option value="CASH">💵 Espèces</option>
                      <option value="CREDIT_CARD">💳 Carte</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" required
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                      value={payData.payment_date}
                      onChange={e => setPayData({...payData, payment_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Référence</label>
                    <input 
                      type="text" placeholder="N° transaction / Chèque"
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                      value={payData.reference}
                      onChange={e => setPayData({...payData, reference: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all shadow-xl ${isEditing ? 'bg-blue-600 shadow-blue-100' : 'bg-rose-600 shadow-rose-100'}`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isEditing ? 'Mettre à jour' : 'Confirmer le paiement')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};