import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Save, 
  User, Hash, FileText, 
  Tag, ShieldCheck, Loader2,
  Box, AlertCircle, AlertTriangle 
} from 'lucide-react';

import { createQuote, type CreateQuotePayload, type QuoteItem } from '../store/slices/quoteSlice';
import { fetchClients } from '../store/slices/clientSlice';
import type { AppDispatch, RootState } from '../store/store';

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateQuoteModal = ({ isOpen, onClose }: CreateQuoteModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: clients, isLoading: loadingClients } = useSelector((state: RootState) => state.clients);
  // Chantier selector removed
  const { isLoading: loadingQuote } = useSelector((state: RootState) => state.quotes);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (!clients || clients.length === 0) dispatch(fetchClients());
        // fetchChantiers dispatch removed
    }
  }, [isOpen, dispatch, clients]);

  const [formData, setFormData] = useState<CreateQuotePayload>({
    quote_number: '',
    client: 0,
    chantier: 0, // Kept as 0 (optional/hidden)
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    project_description: '',
    items: []
  });

  useEffect(() => {
    if (isOpen) {
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      
      // Reset validation states
      setAttemptedSubmit(false);
      setFormError(null);

      setFormData(prev => ({
        ...prev,
        quote_number: `QT-${new Date().getFullYear()}-${randomNum}`,
        items: [] 
      }));
    }
  }, [isOpen]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: undefined,
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

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
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

    // --- CHANGED HERE: Removed Chantier check ---
    if (!formData.client) {
        setFormError("Attention : Veuillez sélectionner un client.");
        return;
    }
    // ---------------------------------------------

    if (formData.items.length === 0) {
        setFormError("Attention : Veuillez ajouter au moins un article au devis.");
        return;
    }

    const hasInvalidItems = formData.items.some(item => !item.item_name || item.item_name.trim() === '');
    
    if (hasInvalidItems) {
        setFormError("Action Requise : Veuillez renseigner la désignation pour tous les articles marqués en rouge.");
        return;
    }

    try {
      await dispatch(createQuote(formData)).unwrap();
      onClose();
    } catch (error: any) {
      console.error("Failed to create quote", error);
      const msg = typeof error === 'string' ? error : "Erreur serveur lors de la création.";
      setFormError(`Erreur : ${msg}`);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
      >
        
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
               <FileText size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Nouveau Devis</h2>
               <p className="text-sm text-slate-500 font-medium">Création d'une proposition commerciale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-[#FAFAFA] custom-scrollbar">
          
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
                  <AlertTriangle size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-red-900 font-bold text-sm">Impossible d'enregistrer</h4>
                  <p className="text-red-700 text-sm mt-0.5 font-medium">{formError}</p>
                </div>
                <button 
                  onClick={() => setFormError(null)}
                  className="p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Client & Project */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Information Client
                </h3>
                
                {/* --- CHANGED: Removed Grid, now just Client Select --- */}
                <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Client {loadingClients && <span className="text-xs animate-pulse">...</span>}
                    </label>
                    <select 
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer"
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: Number(e.target.value)})}
                    >
                      <option value={0}>Sélectionner un client...</option>
                      {Array.isArray(clients) && clients.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name || c.contact_person || c.company_name || `Client #${c.id}`}
                        </option>
                      ))}
                    </select>
                </div>
                {/* --------------------------------------------------- */}

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description du Projet</label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Rénovation complète..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-slate-900 transition-all resize-none"
                      value={formData.project_description}
                      onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                    />
                </div>
              </div>
            </div>

            {/* Right Column - Dates & Info */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-full">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Détails
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-xl flex items-center justify-between text-white shadow-lg shadow-slate-200">
                        <span className="text-xs font-bold opacity-70">N° Devis</span>
                        <span className="font-black tracking-wide text-lg">{formData.quote_number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Émission</label>
                            <input 
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-900"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Validité</label>
                            <input 
                                type="date"
                                className="w-full bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs font-bold text-amber-800 outline-none focus:border-amber-300"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                            />
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* --- ARTICLES & SERVICES (PROFESSIONAL TABLE) --- */}
          <div>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Tag size={20} className="text-slate-400"/> Articles & Services</h3>
               </div>
               <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
               >
                  <Plus size={14} /> Ajouter Ligne
               </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Description <span className="text-red-500">*</span></div>
                    <div className="col-span-1 text-center">Qté</div>
                    <div className="col-span-1 text-center">Unité</div>
                    <div className="col-span-2 text-right">Prix U. (DH)</div>
                    <div className="col-span-2 text-right pr-4">Total HT</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {formData.items.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Box size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium text-sm">Aucun article ajouté.</p>
                        </div>
                    )}

                    {formData.items.map((item, index) => {
                        const isNameMissing = attemptedSubmit && (!item.item_name || item.item_name.trim() === '');
                        
                        return (
                            <div key={index} className={`grid grid-cols-12 gap-4 p-4 items-center group transition-colors ${isNameMissing ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                                {/* Number */}
                                <div className="col-span-1 flex justify-center">
                                    <span className={`text-xs font-bold ${isNameMissing ? 'text-red-500' : 'text-slate-400'}`}>
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Description Inputs */}
                                <div className="col-span-5 space-y-1">
                                    <div className="relative">
                                        <input 
                                            placeholder="Désignation"
                                            className={`w-full bg-transparent font-bold text-sm outline-none rounded px-1 transition-all
                                                ${isNameMissing 
                                                    ? 'text-red-900 placeholder:text-red-300 border-b border-red-300' 
                                                    : 'text-slate-900 placeholder:text-slate-300 focus:text-blue-700'
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

                                {/* Quantity */}
                                <div className="col-span-1">
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-center font-bold text-slate-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 rounded"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>

                                {/* Unit */}
                                <div className="col-span-1">
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent text-center font-bold text-slate-500 text-xs uppercase outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 rounded"
                                        value={item.unit}
                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                    />
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-2">
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-right font-medium text-slate-600 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 rounded"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                    />
                                </div>

                                {/* Total & Delete */}
                                <div className="col-span-2 flex items-center justify-end gap-3">
                                    <span className="font-black text-slate-900 text-sm tabular-nums">{item.subtotal}</span>
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                <div className="w-full md:w-1/3 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                    {/* Summary Calculations */}
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                        <span>Total HT</span>
                        <span className="font-bold text-slate-900">{formData.items.reduce((acc, item) => acc + (parseFloat(String(item.subtotal)) || 0), 0).toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                        <span>TVA (20%)</span>
                        <span className="font-bold text-slate-900">
                            {formData.items.reduce((acc, item) => acc + ((parseFloat(String(item.subtotal)) || 0) * (parseFloat(String(item.tax_rate)) / 100)), 0).toFixed(2)} DH
                        </span>
                    </div>
                    <div className="h-px bg-slate-100"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total TTC</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                            {(
                                formData.items.reduce((acc, item) => acc + (parseFloat(String(item.subtotal)) || 0), 0) + 
                                formData.items.reduce((acc, item) => acc + ((parseFloat(String(item.subtotal)) || 0) * (parseFloat(String(item.tax_rate)) / 100)), 0)
                            ).toFixed(2)} <span className="text-sm text-slate-400">DH</span>
                        </span>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-slate-300" />
             Création Sécurisée
          </div>
          <div className="flex gap-3">
            <button 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs"
            >
                Annuler
            </button>
            <button 
                onClick={handleSubmit}
                disabled={loadingQuote}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 text-xs"
            >
                {loadingQuote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Enregistrer
            </button>
          </div>
        </div>

      </motion.div>
    </div>,
    document.body
  );
};