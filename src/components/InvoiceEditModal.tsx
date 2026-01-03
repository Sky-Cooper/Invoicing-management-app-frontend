import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, Save, BadgeCheck, FileEdit, Loader2,
  ShieldBan, User, HardHat, Briefcase, FileText,
  Box, AlertCircle, ChevronDown, Lock // Replaced Plus/Trash with Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { updateInvoice, type Invoice } from '../store/slices/invoiceSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const UNIT_TYPES = ["day", "bag", "M", "unité", "heure", "m²", "m³", "kg", "ton"] as const;

// Keeping types compatible with backend, but we will only use DRAFT and PAID in UI
type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

export const InvoiceEditModal = ({ isOpen, onClose, invoice }: Props) => {
  const dispatch = useAppDispatch();
  
  // Data from Store
  const { items: clients } = useAppSelector((state) => state.clients);
  const { items: chantiers } = useAppSelector((state) => state.chantiers);
  const { isLoading } = useAppSelector((state) => state.invoices);

  // --- LOCAL STATE ---
  const [formData, setFormData] = useState({
    invoice_number: '',
    client: '',
    chantier: '',
    project_description: '', 
    contract_number: '',
    issued_date: '',
    due_date: '',
    status: 'DRAFT' as InvoiceStatus,
    discount_percentage: '0.00',
    tax_rate: '20.00',
    Subject: '',
    notes: '' 
  });

  const [items, setItems] = useState<any[]>([]);

  // --- LOAD DATA ---
  useEffect(() => {
    if (invoice && isOpen) {
      
      const getId = (item: any) => {
        if (!item) return '';
        if (typeof item === 'object' && item.id) return String(item.id); 
        return String(item);
      };

      setFormData({
        invoice_number: invoice.invoice_number,
        client: getId(invoice.client),
        chantier: getId(invoice.chantier),
        project_description: invoice.project_description || '', 
        contract_number: invoice.contract_number || '',
        issued_date: invoice.issued_date ? invoice.issued_date.split('T')[0] : '',
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        status: invoice.status as InvoiceStatus, 
        discount_percentage: invoice.discount_percentage || '0.00',
        tax_rate: invoice.tax_rate || '20.00',
        Subject: invoice.Subject || '',
        notes: (invoice as any).notes || ''
      });
      
      if (invoice.invoice_items) {
        setItems(invoice.invoice_items.map(item => ({
          id: item.id,
          item_id: item.item_code, 
          item_name: item.item_name,
          item_description: item.item_description,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          subtotal: item.subtotal
        })));
      }
    }
  }, [invoice, isOpen]);

  // --- CALCULATIONS ---
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || '0') * parseFloat(item.unit_price || '0')), 0);
    const discAmount = subtotal * (parseFloat(formData.discount_percentage) / 100);
    const total_ht = subtotal - discAmount;
    const tax_amount = total_ht * (parseFloat(formData.tax_rate) / 100);
    const total_ttc = total_ht + tax_amount;
    
    return { 
      subtotal: subtotal.toFixed(2), 
      discount_amount: discAmount.toFixed(2),
      total_ht: total_ht.toFixed(2), 
      tax_amount: tax_amount.toFixed(2), 
      total_ttc: total_ttc.toFixed(2),
      remaining_balance: invoice?.remaining_balance || total_ttc.toFixed(2)
    };
  }, [items, formData.discount_percentage, formData.tax_rate, invoice]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const payload = {
      ...formData,
      client: parseInt(formData.client),
      chantier: parseInt(formData.chantier),
      Subject: formData.Subject,
      notes: formData.notes,
      // We pass items back exactly as they are since they are immutable in this view
      items: items.map(item => ({
        item_id: item.item_id ? parseInt(item.item_id) : null,
        item_name: item.item_name,
        item_description: item.item_description || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate
      }))
    };

    const result = await dispatch(updateInvoice({ id: invoice.id, data: payload as any }));
    if (updateInvoice.fulfilled.match(result)) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-6 overflow-y-auto font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-7xl bg-[#fcfcfc] border border-white rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(220,38,38,0.4)] overflow-hidden mt-10 mb-10 flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-10 flex justify-between items-center text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/20 rounded-[1.8rem] backdrop-blur-md border border-white/30 shadow-inner">
                <FileEdit size={32} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Mode Correction</h2>
              <p className="text-red-100 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <ShieldBan size={14} className="text-emerald-400" /> Sécurité Anti-Abus Activée
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 border border-white/10 group">
            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="flex-1 p-10 lg:p-14 space-y-12 bg-slate-50/30 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: CONTEXT */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full flex flex-col gap-6">
                  
                  {/* Invoice Number (Locked) */}
                  <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <BadgeCheck size={12} /> N° Facture (Fixe)
                      </label>
                      <input 
                          value={formData.invoice_number} 
                          readOnly
                          className="w-full bg-slate-100 border-2 border-slate-100 text-slate-500 rounded-xl py-4 px-6 font-mono font-black text-sm outline-none cursor-not-allowed" 
                      />
                  </div>

                  <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <User size={12} /> Client Facturé
                      </label>
                      <div className="relative">
                          <select required value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-4 pr-10 font-bold text-sm text-slate-800 outline-none focus:border-red-500 appearance-none cursor-pointer">
                              <option value="">Sélectionner...</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                  </div>

                  <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <HardHat size={12} /> Projet Lié
                      </label>
                      <div className="relative">
                          <select required value={formData.chantier} onChange={(e) => setFormData({...formData, chantier: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-4 pr-10 font-bold text-sm text-slate-800 outline-none focus:border-red-500 appearance-none cursor-pointer">
                              <option value="">Sélectionner...</option>
                              {chantiers.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                  </div>

                  {/* Subject */}
                  <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FileText size={12} /> Objet / Titre
                      </label>
                      <input 
                        type="text"
                        placeholder="ex: Installation Électrique..."
                        value={formData.Subject} 
                        onChange={(e) => setFormData({...formData, Subject: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-red-500" 
                      />
                  </div>

                  <div className="flex-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Briefcase size={12}/> Description Détaillée
                      </label>
                      <textarea required value={formData.project_description} onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-600 h-24 outline-none focus:bg-white focus:border-red-500 transition-all resize-none" />
                  </div>

                  <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FileText size={12} /> N° Contrat
                      </label>
                      <input required value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-red-500" />
                  </div>
               </div>
            </div>

            {/* RIGHT: ITEMS & TOTALS */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* ITEMS LIST (IMMUTABLE) */}
               <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                          <BadgeCheck size={16} className="text-red-600"/> Lignes de prestations (Verrouillées)
                      </h3>
                      {/* --- ADD BUTTON REMOVED FOR IMMUTABILITY --- */}
                      <span className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                          <Lock size={12} /> Modification Interdite
                      </span>
                  </div>

                  <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="col-span-5">Désignation</div>
                          <div className="col-span-2">Unité</div>
                          <div className="col-span-2 text-center">Qté</div>
                          <div className="col-span-2 text-right">Prix U.</div>
                          <div className="col-span-1"></div>
                      </div>

                      {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start group">
                          
                          {/* Item Name (Disabled) */}
                          <div className="md:col-span-5 relative">
                              <input 
                                  value={item.item_name} 
                                  disabled
                                  className="w-full bg-slate-100/50 border border-transparent rounded-xl py-3 px-4 text-sm font-bold text-slate-500 outline-none cursor-not-allowed" 
                              />
                              {/* --- Catalog Select Logic Removed --- */}
                              {item.item_id && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Box size={16} className="text-slate-300" />
                                </div>
                              )}
                          </div>

                          {/* Unit (Disabled) */}
                          <div className="md:col-span-2">
                              <select 
                                  value={item.unit} 
                                  disabled
                                  className="w-full bg-slate-100/50 border border-transparent rounded-xl py-3 px-2 text-[10px] font-bold text-slate-500 outline-none cursor-not-allowed uppercase appearance-none"
                              >
                                  {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                          </div>

                          {/* Quantity (Disabled) */}
                          <div className="md:col-span-2">
                              <input 
                                  type="number" 
                                  value={item.quantity} 
                                  disabled
                                  className="w-full bg-slate-100/50 rounded-xl py-3 text-center text-sm font-black text-slate-500 outline-none cursor-not-allowed" 
                              />
                          </div>

                          {/* Price (Disabled) */}
                          <div className="md:col-span-2">
                              <input 
                                  type="number" 
                                  value={item.unit_price} 
                                  disabled
                                  className="w-full bg-slate-100/50 rounded-xl py-3 text-right px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed" 
                              />
                          </div>

                          {/* Delete Button Removed (Immutable) */}
                          <div className="md:col-span-1 flex justify-center pt-3">
                              <Lock size={16} className="text-slate-200" />
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="bg-slate-50 p-4 text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Sous-total Lignes</span>
                      <span className="text-sm font-black text-slate-800">{totals.subtotal} DH</span>
                  </div>
               </div>

               {/* TOTALS & Dates */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Dates & Status */}
                   <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                       <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Date Émission</label>
                           <input type="date" value={formData.issued_date} onChange={(e) => setFormData({...formData, issued_date: e.target.value})} 
                               className="w-full bg-slate-50 rounded-xl py-3 px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-2 block">Échéance</label>
                           <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                               className="w-full bg-red-50/50 rounded-xl py-3 px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500/10 text-red-900 cursor-pointer" />
                       </div>
                       <div className="space-y-2 pt-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Statut</label>
                           <select value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value as InvoiceStatus})} 
                               className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-xs font-black text-slate-700 outline-none cursor-pointer">
                               <option value="DRAFT">Non Payé</option>
                               <option value="PAID">Payé</option>
                           </select>
                       </div>
                   </div>

                   {/* Totals Card */}
                   <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                       
                       <div className="space-y-4 relative z-10">
                           <div className="flex justify-between items-center text-slate-400">
                               <span className="text-[10px] font-black uppercase tracking-widest">Total HT</span>
                               <span className="font-mono font-bold">{totals.total_ht} DH</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">TVA</span>
                                   <input type="number" className="w-10 bg-slate-800 border-none rounded text-center text-[10px] font-bold text-white outline-none" 
                                       value={formData.tax_rate} onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}/>
                                   <span className="text-[10px] text-slate-500">%</span>
                               </div>
                               <span className="font-mono font-bold text-slate-300">+{totals.tax_amount} DH</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remise</span>
                                   <input type="number" className="w-10 bg-slate-800 border-none rounded text-center text-[10px] font-bold text-white outline-none" 
                                       value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}/>
                                   <span className="text-[10px] text-slate-500">%</span>
                               </div>
                               <span className="font-mono font-bold text-red-400">-{totals.discount_amount} DH</span>
                           </div>
                       </div>

                       <div className="pt-6 border-t border-slate-700">
                           <div className="flex justify-between items-end">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 block mb-1">Total TTC</span>
                               <span className="text-3xl font-black tracking-tighter leading-none">{totals.total_ttc} <span className="text-lg text-slate-500">DH</span></span>
                           </div>
                           
                           <div className="mt-4 pt-4 border-t border-slate-800 text-right">
                               <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-500 flex items-center justify-end gap-1">
                                   <AlertCircle size={10} /> Reste à payer: {totals.remaining_balance} DH
                               </span>
                           </div>
                       </div>
                   </div>
               </div>

            </div>
          </div>
        </form>

        <div className="p-10 border-t border-slate-100 bg-white flex justify-end gap-6 shrink-0">
          <button type="button" onClick={onClose} className="px-10 py-5 text-slate-400 hover:text-red-600 font-black uppercase text-xs tracking-[0.2em] transition-colors">
            Fermer
          </button>
          <button onClick={handleUpdate} disabled={isLoading} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-red-600 hover:to-red-700 text-white px-16 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl active:scale-95 group disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} className="group-hover:scale-110 transition-transform" />} Enregistrer Corrections
          </button>
        </div>
      </motion.div>
    </div>
  );
};