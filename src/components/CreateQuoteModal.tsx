import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  X, Plus, Trash2, Save, 
  User, Building2, Calendar, FileText, 
  Briefcase, Clock, Hash, Loader2
} from 'lucide-react';

// --- IMPORTS ---
import { createQuote, type CreateQuotePayload, type QuoteItem } from '../store/slices/quoteSlice';

// IMPORT FETCH ACTIONS FOR DROP DOWNS
import { fetchClients } from '../store/slices/clientSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';
import type { AppDispatch, RootState } from '../store/store';

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateQuoteModal = ({ isOpen, onClose }: CreateQuoteModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. SELECT DATA FROM REDUX
  const { items: clients, isLoading: loadingClients } = useSelector((state: RootState) => state.clients);
  const { items: chantiers, isLoading: loadingChantiers } = useSelector((state: RootState) => state.chantiers);
  const { isLoading: loadingQuote } = useSelector((state: RootState) => state.quotes);

  // 2. DEBUG LOGS (Check your Console F12)
  useEffect(() => {
    if(isOpen) {
        console.log("Modal Open - Clients from Store:", clients);
        console.log("Modal Open - Chantiers from Store:", chantiers);
    }
  }, [isOpen, clients, chantiers]);

  // 3. FORCE FETCH ON MOUNT (Fix for empty dropdowns)
  useEffect(() => {
    if (isOpen) {
        // If empty, try fetching again
        if (!clients || clients.length === 0) dispatch(fetchClients());
        if (!chantiers || chantiers.length === 0) dispatch(fetchChantiers());
    }
  }, [isOpen, dispatch]);


  // --- Form State ---
  const [formData, setFormData] = useState<CreateQuotePayload>({
    quote_number: '',
    client: 0,
    chantier: 0,
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    project_description: '',
    items: []
  });

  // Generate Quote Number on Open
  useEffect(() => {
    if (isOpen) {
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      setFormData(prev => ({
        ...prev,
        quote_number: `QT-${new Date().getFullYear()}-${randomNum}`,
        items: [] 
      }));
    }
  }, [isOpen]);

  // --- Handlers ---
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: 1, 
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.chantier) {
        alert("Veuillez sélectionner un client et un chantier.");
        return;
    }
    if (formData.items.length === 0) {
        alert("Veuillez ajouter au moins un article.");
        return;
    }

    try {
      await dispatch(createQuote(formData)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to create quote", error);
      alert("Erreur lors de la création du devis.");
    }
  };

  const totalHT = formData.items.reduce((acc, item) => acc + (parseFloat(String(item.subtotal)) || 0), 0);
  const totalTVA = formData.items.reduce((acc, item) => acc + ((parseFloat(String(item.subtotal)) || 0) * (parseFloat(String(item.tax_rate)) / 100)), 0);
  const totalTTC = totalHT + totalTVA;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
      >
        
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                 <FileText size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Devis</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium pl-12">Créer une proposition commerciale.</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-[#FAFAFA]">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Information Client
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* CLIENT SELECT */}
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
                      
                      {/* SAFE MAPPING: Checks if clients exists and is array */}
                      {Array.isArray(clients) && clients.length > 0 ? (
                          clients.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name || c.contact_person || c.company_name || `Client #${c.id}`}
                            </option>
                          ))
                      ) : (
                          <option disabled>Aucun client trouvé</option>
                      )}
                    </select>
                    <div className="absolute right-4 top-[38px] pointer-events-none text-slate-400">
                      <Briefcase size={16} />
                    </div>
                  </div>

                  {/* CHANTIER SELECT */}
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Chantier {loadingChantiers && <span className="text-xs animate-pulse">...</span>}
                    </label>
                    <select 
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer"
                      value={formData.chantier}
                      onChange={(e) => setFormData({...formData, chantier: Number(e.target.value)})}
                    >
                      <option value={0}>Sélectionner un chantier...</option>
                      
                      {/* SAFE MAPPING */}
                      {Array.isArray(chantiers) && chantiers.length > 0 ? (
                          chantiers.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name || `Chantier #${c.id}`}
                            </option>
                          ))
                      ) : (
                          <option disabled>Aucun chantier trouvé</option>
                      )}
                    </select>
                    <div className="absolute right-4 top-[38px] pointer-events-none text-slate-400">
                      <Building2 size={16} />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
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

            {/* Right Column: Meta Data */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-full">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Détails
                  </h3>

                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900/5 rounded-xl border border-slate-900/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">N° Devis</span>
                        <span className="font-black text-slate-900 tracking-wide">{formData.quote_number}</span>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Date d'émission</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 transition-all"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Valide Jusqu'au</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 transition-all"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* SECTION 2: ITEMS */}
          <div>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h3 className="text-lg font-black text-slate-900">Articles & Services</h3>
               </div>
               <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                  <Plus size={16} /> Ajouter Ligne
               </button>
            </div>

            <div className="space-y-3">
                  {formData.items.length === 0 && (
                    <div className="py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Plus size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium text-sm">Votre devis est vide.</p>
                        <p className="text-slate-300 text-xs">Cliquez sur "Ajouter Ligne" pour commencer.</p>
                    </div>
                  )}

                  {formData.items.map((item, index) => (
                    <div 
                      key={index}
                      className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-all"
                    >
                       <div className="hidden md:flex w-8 h-8 rounded-lg bg-slate-50 text-slate-400 font-bold text-xs items-center justify-center border border-slate-100">
                          {index + 1}
                       </div>

                       <div className="flex-1 w-full space-y-2">
                          <input 
                            placeholder="Nom de l'article / Service"
                            className="w-full bg-transparent font-bold text-slate-900 outline-none placeholder:text-slate-300"
                            value={item.item_name}
                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                          />
                          <input 
                            placeholder="Ajouter une description..."
                            className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none placeholder:text-slate-300"
                            value={item.item_description}
                            onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                          />
                       </div>

                       <div className="grid grid-cols-3 gap-2 w-full md:w-auto min-w-[300px]">
                           <div>
                              <label className="text-[9px] font-bold text-slate-300 uppercase block mb-1">Qté</label>
                              <input 
                                type="number" 
                                className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-center font-bold text-slate-700 text-sm outline-none focus:bg-white focus:border-slate-300"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              />
                           </div>
                           <div>
                              <label className="text-[9px] font-bold text-slate-300 uppercase block mb-1">Unité</label>
                              <input 
                                type="text" 
                                className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-center font-bold text-slate-500 text-sm outline-none focus:bg-white focus:border-slate-300"
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              />
                           </div>
                           <div>
                              <label className="text-[9px] font-bold text-slate-300 uppercase block mb-1">Prix U.</label>
                              <input 
                                type="number" 
                                className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-right font-bold text-slate-700 text-sm outline-none focus:bg-white focus:border-slate-300"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                              />
                           </div>
                       </div>

                       <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-4 border-l border-slate-100">
                          <div className="text-right min-w-[80px]">
                            <span className="text-[9px] font-bold text-slate-300 uppercase block">Total HT</span>
                            <span className="font-black text-slate-900 text-sm">{item.subtotal} DH</span>
                          </div>
                          <button 
                            onClick={() => removeItem(index)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
            </div>
          </div>
          
          {/* Summary / Totals */}
          {formData.items.length > 0 && (
            <div className="flex justify-end mt-6">
                <div className="w-full md:w-1/3 bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
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
                        <span className="text-xl font-black text-slate-900">{totalTTC.toFixed(2)} DH</span>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* --- FOOTER --- */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-4 z-10">
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loadingQuote}
            className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loadingQuote ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Enregistrer le Devis
          </button>
        </div>
      </motion.div>
    </div>
  );
};
