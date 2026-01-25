import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  X, Plus, Trash2, Save, 
  User, Calendar, FileText, 
  Briefcase, Truck, Loader2, Box,
  AlertTriangle, AlertCircle 
} from 'lucide-react';

import type { AppDispatch, RootState } from '../store/store';
import { createPurchaseOrder, type CreatePOPayload, type PurchaseOrderItem } from '../store/slices/purchaseOrderSlice';
import { fetchClients } from '../store/slices/clientSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Constant kept to avoid deleting code, but not used in the UI anymore

const DEFAULT_FORM_STATE: CreatePOPayload = {
  po_number: '',
  client: 0,
  issued_date: new Date().toISOString().split('T')[0],
  expected_delivery_date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
  project_description: '',
  items: [],
  chantier: 0
};

export const CreatePOModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: clients } = useSelector((state: RootState) => state.clients);
  const { isLoading } = useSelector((state: RootState) => state.purchaseOrders);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (!clients || clients.length === 0) dispatch(fetchClients());
    }
  }, [isOpen, dispatch]);

  const [formData, setFormData] = useState<CreatePOPayload>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (isOpen) {
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      setAttemptedSubmit(false);
      setFormError(null); 
      setFormData({
        ...DEFAULT_FORM_STATE,
        po_number: `PO-${new Date().getFullYear()}-${randomNum}`
      });
    }
  }, [isOpen]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: undefined, 
          item_name: '',
          item_description: '',
          unit: 'u',
          quantity: 1,
          unit_price: 0,
          subtotal: 0,
          tax_rate: 20
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const qty = parseFloat(String(currentItem.quantity)) || 0;
      const price = parseFloat(String(currentItem.unit_price)) || 0;
      currentItem.subtotal = (qty * price).toFixed(2);
    }

    newItems[index] = currentItem;
    setFormData({ ...formData, items: newItems });
    
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setFormError(null); 

    if (!formData.client) {
        setFormError("Attention : Veuillez sélectionner un fournisseur.");
        return;
    }

    if (formData.items.length === 0) {
        setFormError("Attention : Veuillez ajouter au moins un article à la commande.");
        return;
    }

    const hasInvalidItems = formData.items.some(item => !item.item_name || item.item_name.trim() === '');
    
    if (hasInvalidItems) {
        setFormError("Action Requise : Veuillez renseigner le nom (désignation) pour tous les articles marqués en rouge.");
        return;
    }

    try {
      await dispatch(createPurchaseOrder(formData)).unwrap();
      onClose();
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err.message || "Une erreur serveur est survenue.");
      setFormError(`Erreur Système : ${msg}`);
    }
  };

  const totalHT = formData.items.reduce((acc, item) => acc + (parseFloat(String(item.subtotal)) || 0), 0);
  const totalTVA = formData.items.reduce((acc, item) => acc + ((parseFloat(String(item.subtotal)) || 0) * (parseFloat(String(item.tax_rate)) / 100)), 0);
  const totalTTC = totalHT + totalTVA;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-250 flex items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm h-screen w-screen overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white sm:rounded-3xl shadow-2xl w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
      >
        {/* HEADER */}
        <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white shadow-md shadow-slate-200">
                 <FileText size={20} />
            </div>
            <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Bon de Commande</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Nouveau document d'achat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6 sm:space-y-8 bg-[#FAFAFA] custom-scrollbar">
          
          {/* REMINDER CARD (ERROR BANNER) */}
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm"
              >
                <div className="p-2 bg-white rounded-full text-red-500 shadow-sm shrink-0">
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-red-900 font-bold text-sm">Impossible d'enregistrer</h4>
                  <p className="text-red-700 text-xs sm:text-sm mt-0.5 font-medium">{formError}</p>
                </div>
                <button 
                  onClick={() => setFormError(null)}
                  className="p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Informations
                </h3>
                
                <div className="relative group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Fournisseur / Client</label>
                  <select 
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: Number(e.target.value)})}
                  >
                    <option value={0}>Sélectionner...</option>
                    {clients?.map(c => (
                      <option key={c.id} value={c.id}>
                          {c.company_name || c.name || c.contact_person || `Client #${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Achat de matériaux pour rénovation..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-700 outline-none focus:border-slate-900 resize-none placeholder:text-slate-300"
                      value={formData.project_description}
                      onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                    />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-5 h-full">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={14} /> Détails Commande
                  </h3>

                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900/5 rounded-xl border border-slate-900/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">N° BC</span>
                        <span className="font-black text-slate-900 tracking-wide text-sm sm:text-base">{formData.po_number}</span>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Date Commande</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Livraison Prévue</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-700 outline-none focus:border-slate-900 transition-colors"
                                value={formData.expected_delivery_date}
                                onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                            />
                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* --- ARTICLES & SERVICES --- */}
          <div>
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2"><Briefcase size={20} className="text-slate-400"/> Articles</h3>
               <button 
                 type="button" 
                 onClick={addItem}
                 className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
               >
                 <Plus size={14} /> <span className="hidden sm:inline">Ajouter Ligne</span><span className="sm:hidden">Ajouter</span>
               </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header (Desktop Only) */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Désignation <span className="text-red-500">*</span></div>
                    <div className="col-span-1 text-center">Qté</div>
                    <div className="col-span-1 text-center">Unité</div>
                    <div className="col-span-2 text-right">Prix U. (DH)</div>
                    <div className="col-span-2 text-right pr-4">Total HT</div>
                </div>

                {/* Table Body (Responsive) */}
                <div className="divide-y divide-slate-100">
                    {formData.items.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Box size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium text-sm">Aucun article ajouté.</p>
                        </div>
                    )}

                    {formData.items.map((item, index) => {
                        const isNameMissing = attemptedSubmit && (!item.item_name || item.item_name.trim() === '');
                        
                        return (
                            <div 
                              key={index} 
                              className={`
                                relative p-4 group transition-colors flex flex-col gap-4 
                                md:grid md:grid-cols-12 md:gap-4 md:items-center 
                                ${isNameMissing ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}
                              `}
                            >
                                {/* Mobile Delete Button */}
                                <button 
                                    onClick={() => removeItem(index)}
                                    className="md:hidden absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>

                                {/* Index (Desktop Only) */}
                                <div className="hidden md:flex col-span-1 justify-center">
                                    <span className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center ${isNameMissing ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Description Inputs */}
                                <div className="col-span-12 md:col-span-5 space-y-1">
                                    {/* Mobile Label */}
                                    <div className="flex items-center gap-2 md:hidden mb-1">
                                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{index + 1}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Désignation</span>
                                    </div>

                                    <div className="relative">
                                        <input 
                                            placeholder="Nom de l'article"
                                            className={`w-full bg-transparent font-bold text-sm outline-none placeholder:text-slate-300 rounded px-1 transition-all
                                                ${isNameMissing 
                                                    ? 'border border-red-300 text-red-900 placeholder:text-red-300 bg-white focus:border-red-500' 
                                                    : 'text-slate-800 border border-transparent focus:border-slate-200'
                                                }`}
                                            value={item.item_name}
                                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                        />
                                        {isNameMissing && <AlertCircle size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />}
                                    </div>
                                    <input 
                                        placeholder="Description détaillée (optionnel)"
                                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none placeholder:text-slate-300 px-1"
                                        value={item.item_description}
                                        onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                    />
                                </div>

                                {/* Mobile Grid for Quantities */}
                                <div className="col-span-12 grid grid-cols-3 gap-3 md:contents">
                                  
                                  {/* Quantity */}
                                  <div className="col-span-1 md:col-span-1">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Qté</label>
                                      <input 
                                          type="number" 
                                          className="w-full p-2 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 text-center font-bold text-slate-700 text-sm outline-none focus:bg-white focus:border-slate-300 transition-all"
                                          value={item.quantity}
                                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                      />
                                  </div>

                                  {/* Unit (Changed to Manual Input) */}
                                  <div className="col-span-1 md:col-span-1">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Unité</label>
                                      <input 
                                          type="text"
                                          placeholder="Unité"
                                          className="w-full p-2 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 text-center font-bold text-slate-700 text-xs uppercase outline-none focus:bg-white focus:border-slate-300 transition-all"
                                          value={item.unit}
                                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                      />
                                  </div>

                                  {/* Unit Price */}
                                  <div className="col-span-1 md:col-span-2">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Prix U.</label>
                                      <input 
                                          type="number" 
                                          className="w-full p-2 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 text-right font-bold text-slate-700 text-sm outline-none focus:bg-white focus:border-slate-300 transition-all"
                                          value={item.unit_price}
                                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                      />
                                  </div>
                                </div>

                                {/* Total & Delete (Desktop) */}
                                <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                                    <span className="md:hidden text-xs font-black text-slate-400 uppercase">Total HT</span>
                                    <span className="font-black text-slate-900 text-sm">{item.subtotal}</span>
                                    
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="hidden md:block opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
          
          {/* Summary / Totals */}
          {formData.items.length > 0 && (
            <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Total HT</span>
                        <span className="font-bold text-slate-900">{totalHT.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">TVA (20%)</span>
                        <span className="font-bold text-slate-900">{totalTVA.toFixed(2)} DH</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total TTC</span>
                        <span className="text-lg sm:text-xl font-black text-slate-900">{totalTTC.toFixed(2)} DH</span>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-4 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 z-10 shrink-0">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs sm:text-sm order-2 sm:order-1"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 text-xs sm:text-sm order-1 sm:order-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer Commande
          </button>
        </div>
      </motion.div>
    </div>
  );
};