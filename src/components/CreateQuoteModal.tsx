import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Save, 
  User, Hash, FileText, 
  Tag, ShieldCheck, Loader2,
  Box, AlertTriangle, AlertCircle
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
  const { isLoading: loadingQuote } = useSelector((state: RootState) => state.quotes);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (!clients || clients.length === 0) dispatch(fetchClients());
    }
  }, [isOpen, dispatch, clients]);

  const [formData, setFormData] = useState<CreateQuotePayload>({
    quote_number: '',
    client: 0,
    chantier: 0,
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    project_description: '',
    items: []
  });

  useEffect(() => {
    if (isOpen) {
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      
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

    if (!formData.client) {
        setFormError("Attention : Veuillez sélectionner un client.");
        return;
    }

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
    <div className="fixed inset-0 z-9999 flex items-center justify-center sm:p-4 font-sans h-screen w-screen overflow-hidden">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl bg-white sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden border border-slate-100"
      >
        
        {/* --- HEADER --- */}
        <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 shrink-0">
               <FileText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
               <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Nouveau Devis</h2>
               <p className="text-xs sm:text-sm text-slate-500 font-medium">Proposition commerciale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6 sm:space-y-8 bg-[#FAFAFA] custom-scrollbar">
          
          {/* ERROR BANNER */}
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 sm:gap-4 shadow-sm"
              >
                <div className="p-2 bg-white rounded-full text-red-500 shadow-sm shrink-0">
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-red-900 font-bold text-sm">Impossible d'enregistrer</h4>
                  <p className="text-red-700 text-xs sm:text-sm mt-0.5 font-medium leading-relaxed">{formError}</p>
                </div>
                <button 
                  onClick={() => setFormError(null)}
                  className="p-1 sm:p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Client & Project */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Information Client
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                          Client {loadingClients && <span className="text-xs animate-pulse">...</span>}
                      </label>
                      <select 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer hover:bg-slate-100"
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

                  <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description du Projet</label>
                      <textarea 
                        rows={2}
                        placeholder="Ex: Rénovation complète..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-700 outline-none focus:border-slate-900 transition-all resize-none placeholder:text-slate-300"
                        value={formData.project_description}
                        onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                      />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dates & Info */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-5 h-full">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Détails
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-xl flex items-center justify-between text-white shadow-lg shadow-slate-200">
                        <span className="text-xs font-bold opacity-70">N° Devis</span>
                        <span className="font-black tracking-wide text-lg">{formData.quote_number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Émission</label>
                            <input 
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Validité</label>
                            <input 
                                type="date"
                                className="w-full bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs font-bold text-amber-800 outline-none focus:border-amber-300 transition-all"
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

          {/* --- ARTICLES & SERVICES (RESPONSIVE TABLE) --- */}
          <div>
            <div className="flex flex-row justify-between items-end mb-4 gap-4">
               <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Tag size={20} className="text-slate-400"/> Articles & Services
                  </h3>
               </div>
               <button 
                 type="button" 
                 onClick={addItem}
                 className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm shrink-0"
               >
                 <Plus size={14} /> <span className="hidden sm:inline">Ajouter Ligne</span><span className="sm:hidden">Ajouter</span>
               </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Desktop Header (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Description <span className="text-red-500">*</span></div>
                    <div className="col-span-1 text-center">Qté</div>
                    <div className="col-span-1 text-center">Unité</div>
                    <div className="col-span-2 text-right">Prix U. (DH)</div>
                    <div className="col-span-2 text-right pr-4">Total HT</div>
                </div>

                {/* Body */}
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
                                relative p-4 group transition-colors 
                                flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-4 md:items-start
                                ${isNameMissing ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}
                              `}
                            >
                                {/* Mobile: Delete Button (Absolute Top Right) */}
                                <button 
                                    onClick={() => removeItem(index)}
                                    className="md:hidden absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>

                                {/* Number */}
                                <div className="hidden md:flex col-span-1 justify-center pt-2">
                                    <span className={`text-xs font-bold ${isNameMissing ? 'text-red-500' : 'text-slate-400'}`}>
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Description Inputs */}
                                <div className="col-span-12 md:col-span-5 space-y-2">
                                    <div className="flex items-center gap-2 md:hidden mb-1">
                                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{index + 1}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Désignation</span>
                                    </div>

                                    <div className="relative">
                                        <input 
                                            placeholder="Titre de l'article"
                                            className={`w-full bg-transparent font-bold text-sm outline-none rounded px-2 py-1 transition-all border-b
                                                ${isNameMissing 
                                                    ? 'text-red-900 placeholder:text-red-300 border-red-300' 
                                                    : 'text-slate-900 placeholder:text-slate-300 border-transparent focus:border-slate-200'
                                                }`}
                                            value={item.item_name}
                                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                        />
                                        {isNameMissing && <AlertCircle size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />}
                                    </div>
                                    <textarea 
                                        rows={1}
                                        placeholder="Description détaillée (optionnel)"
                                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none placeholder:text-slate-300 px-2 py-1 resize-y"
                                        value={item.item_description}
                                        onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                    />
                                </div>

                                {/* Mobile Grid for Numbers */}
                                <div className="col-span-12 grid grid-cols-3 gap-3 md:contents">
                                  
                                  {/* Quantity */}
                                  <div className="col-span-1 md:col-span-1">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Qté</label>
                                      <input 
                                          type="number" 
                                          className="w-full bg-white md:bg-transparent border md:border-0 border-slate-200 p-2 md:p-0 text-center font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-100 rounded-lg md:rounded-none"
                                          value={item.quantity}
                                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                      />
                                  </div>

                                  {/* Unit */}
                                  <div className="col-span-1 md:col-span-1">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Unité</label>
                                      <input 
                                          type="text" 
                                          className="w-full bg-white md:bg-transparent border md:border-0 border-slate-200 p-2 md:p-0 text-center font-bold text-slate-500 text-xs uppercase outline-none focus:ring-2 focus:ring-blue-100 rounded-lg md:rounded-none"
                                          value={item.unit}
                                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                      />
                                  </div>

                                  {/* Unit Price */}
                                  <div className="col-span-1 md:col-span-2">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase block mb-1">Prix U.</label>
                                      <input 
                                          type="number" 
                                          className="w-full bg-white md:bg-transparent border md:border-0 border-slate-200 p-2 md:p-0 text-right font-medium text-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-100 rounded-lg md:rounded-none"
                                          value={item.unit_price}
                                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                      />
                                  </div>
                                </div>

                                {/* Total & Delete (Desktop) */}
                                <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 mt-2 md:mt-0">
                                    <span className="md:hidden text-xs font-black text-slate-400 uppercase">Total HT</span>
                                    <span className="font-black text-slate-900 text-sm tabular-nums">{item.subtotal} DH</span>
                                    
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
                <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-4 shadow-sm">
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
                        <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
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
        <div className="px-4 py-4 sm:px-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <ShieldCheck size={14} className="text-slate-300" />
             Création Sécurisée
          </div>
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <button 
                onClick={onClose} 
                className="px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs w-full sm:w-auto text-center"
            >
                Annuler
            </button>
            <button 
                onClick={handleSubmit}
                disabled={loadingQuote}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 text-xs w-full sm:w-auto"
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