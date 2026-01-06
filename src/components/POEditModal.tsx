import React, { useEffect, useState } from 'react';
import { 
  X, Save, BadgeCheck, FileEdit, Loader2,
  ShieldBan, Briefcase, Trash2, Plus, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';

// Redux
import { updatePurchaseOrder, type PurchaseOrder, type UpdatePOPayload, type POStatus } from '../store/slices/purchaseOrderSlice';
import { fetchClients } from '../store/slices/clientSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
}

export const POEditModal = ({ isOpen, onClose, po }: Props) => {
  const dispatch = useAppDispatch();
  
  const { items: clients } = useAppSelector((state) => state.clients);
  // Chantier selector removed
  const { isLoading } = useAppSelector((state) => state.purchaseOrders);

  const [formData, setFormData] = useState<UpdatePOPayload>({
    po_number: '',
    client: 0,
    chantier: 0, // Kept as 0 internally
    project_description: '', 
    issued_date: '',
    expected_delivery_date: '',
    status: 'DRAFT',
    items: []
  });

  useEffect(() => {
    if (isOpen) {
        if (!clients || clients.length === 0) dispatch(fetchClients());
        // fetchChantiers dispatch removed

        if (po) {
            setFormData({
                po_number: po.po_number,
                client: po.client,
                chantier: 0, // Ignored
                project_description: po.project_description || '', 
                issued_date: po.issued_date ? po.issued_date.split('T')[0] : '',
                expected_delivery_date: po.expected_delivery_date ? po.expected_delivery_date.split('T')[0] : '',
                status: po.status,
                items: po.items.map(item => ({
                    ...item,
                    item_id: item.item_id || undefined,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal,
                    tax_rate: item.tax_rate || 20
                }))
            });
        }
    }
  }, [po, isOpen, dispatch]);

  const handleItemChange = (index: number, field: string, value: any) => {
    if (!formData.items) return;
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(String(currentItem.quantity) || '0');
      const p = parseFloat(String(currentItem.unit_price) || '0');
      currentItem.subtotal = (q * p).toFixed(2);
    }
    
    newItems[index] = currentItem;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
      setFormData(prev => ({
          ...prev,
          items: [
              ...(prev.items || []),
              { item_name: '', unit: 'u', quantity: 1, unit_price: 0, tax_rate: 20, subtotal: 0, item_description: '' }
          ]
      }));
  };

  const removeItem = (index: number) => {
      setFormData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!po) return;

    const payload: UpdatePOPayload = {
      ...formData,
      client: Number(formData.client),
      chantier: 0, // Always 0
      items: formData.items?.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        tax_rate: Number(item.tax_rate)
      }))
    };

    try {
        await dispatch(updatePurchaseOrder({ id: po.id, data: payload })).unwrap();
        onClose();
    } catch (err) {
        console.error("Update failed", err);
        alert("Erreur lors de la mise à jour.");
    }
  };

  const calculateTotals = () => {
      const items = formData.items || [];
      const subtotal = items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
      const tax = items.reduce((acc, item) => acc + ((Number(item.subtotal) || 0) * (Number(item.tax_rate) / 100)), 0);
      return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-6 overflow-y-auto font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-7xl bg-[#fcfcfc] border border-white rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(15,23,42,0.4)] overflow-hidden mt-10 mb-10 flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-10 flex justify-between items-center text-white relative overflow-hidden shrink-0">
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/20 rounded-[1.8rem] backdrop-blur-md border border-white/30 shadow-inner">
                <FileEdit size={32} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Mode Édition</h2>
              <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <ShieldBan size={14} className="text-emerald-400" /> Bon de Commande
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 border border-white/10">
            <X size={28} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleUpdate} className="flex-1 p-10 lg:p-14 space-y-12 bg-slate-50/30 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: INFO */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full flex flex-col gap-6">
                 
                 <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Statut du BC</label>
                     <select 
                       value={formData.status} 
                       onChange={(e) => setFormData({...formData, status: e.target.value as POStatus})}
                       className="w-full bg-slate-100 border border-slate-200 rounded-xl py-4 px-4 font-bold text-sm text-slate-900 outline-none focus:border-slate-900 cursor-pointer"
                     >
                         <option value="DRAFT">Brouillon</option>
                         <option value="SENT">Envoyé</option>
                         <option value="CONFIRMED">Confirmé</option>
                         <option value="COMPLETED">Livré/Terminé</option>
                         <option value="CANCELLED">Annulé</option>
                     </select>
                 </div>

                 <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Hash size={12} /> N° Commande
                     </label>
                     <input value={formData.po_number} readOnly className="w-full bg-slate-50 border-2 border-slate-100 text-slate-500 rounded-xl py-4 px-6 font-mono font-black text-sm outline-none cursor-not-allowed" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Date</label>
                         <input type="date" value={formData.issued_date} onChange={(e) => setFormData({...formData, issued_date: e.target.value})} className="w-full bg-slate-50 rounded-xl py-3 px-4 font-bold text-xs outline-none" />
                     </div>
                     <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Livraison</label>
                         <input type="date" value={formData.expected_delivery_date} onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})} className="w-full bg-slate-50 rounded-xl py-3 px-4 font-bold text-xs outline-none" />
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fournisseur</label>
                         <select value={formData.client} onChange={(e) => setFormData({...formData, client: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs outline-none">
                             {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.company_name}</option>)}
                         </select>
                     </div>
                     {/* Chantier Select Removed */}
                 </div>

                 <div className="flex-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={12}/> Description</label>
                     <textarea value={formData.project_description} onChange={(e) => setFormData({...formData, project_description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-600 h-32 outline-none resize-none" />
                 </div>
               </div>
            </div>

            {/* RIGHT SIDE: ITEMS */}
            <div className="lg:col-span-8 space-y-6">
               <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                 <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><BadgeCheck size={16}/> Articles Commandés</h3>
                     <button type="button" onClick={addItem} className="flex items-center gap-2 bg-indigo-900 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"><Plus size={12} /> Ajouter</button>
                 </div>

                 <div className="p-6 space-y-4">
                     {formData.items?.map((item, index) => (
                       <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-4 border-b border-slate-50 last:border-0">
                         <div className="md:col-span-5 space-y-1">
                             <input value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} placeholder="Nom" className="w-full bg-slate-50 rounded-lg py-2 px-3 text-sm font-bold outline-none" />
                             <input value={item.item_description} onChange={(e) => handleItemChange(index, 'item_description', e.target.value)} placeholder="Description" className="w-full bg-transparent text-xs text-slate-400 outline-none px-1" />
                         </div>
                         <div className="md:col-span-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-slate-50 rounded-lg py-2 text-center text-sm font-bold outline-none" placeholder="Qté" /></div>
                         <div className="md:col-span-2"><input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-full bg-slate-50 rounded-lg py-2 text-right px-3 text-sm font-bold outline-none" placeholder="Prix" /></div>
                         <div className="md:col-span-2 text-right pt-2 font-black text-sm text-slate-700">{item.subtotal} DH</div>
                         <div className="md:col-span-1 flex justify-center pt-2"><button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>
                       </div>
                     ))}
                 </div>
               </div>

               <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                   <div className="flex justify-between items-end relative z-10">
                       <div className="text-right w-full space-y-1">
                           <p className="text-xs text-indigo-300 font-medium">Total HT: <span className="text-white font-bold">{totals.subtotal.toFixed(2)} DH</span></p>
                           <p className="text-xs text-indigo-300 font-medium">TVA: <span className="text-white font-bold">{totals.tax.toFixed(2)} DH</span></p>
                           <p className="text-3xl font-black tracking-tighter mt-2">{totals.total.toFixed(2)} <span className="text-lg text-indigo-300">DH</span></p>
                       </div>
                   </div>
               </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-10 border-t border-slate-100 bg-white flex justify-end gap-6 shrink-0">
          <button type="button" onClick={onClose} className="px-10 py-5 text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-[0.2em] transition-colors">Fermer</button>
          <button onClick={handleUpdate} disabled={isLoading} className="bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-black hover:to-indigo-900 text-white px-16 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />} Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
};