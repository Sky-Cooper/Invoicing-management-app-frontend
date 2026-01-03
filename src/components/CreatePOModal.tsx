import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  X, Plus, Trash2, Save, 
  User, Building2, Calendar, FileText, 
  Briefcase, Truck, Loader2
} from 'lucide-react';

// Adjust paths to your store
import type { AppDispatch, RootState } from '../store/store';
import { createPurchaseOrder, type CreatePOPayload, type PurchaseOrderItem } from '../store/slices/purchaseOrderSlice';
import { fetchClients } from '../store/slices/clientSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UNIT_TYPES = ["u", "m", "m2", "m3", "kg", "t", "h", "j", "ens", "bag"] as const;

export const CreatePOModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: clients } = useSelector((state: RootState) => state.clients);
  const { items: chantiers } = useSelector((state: RootState) => state.chantiers);
  const { isLoading, error: reduxError } = useSelector((state: RootState) => state.purchaseOrders);

  // Force fetch data on open
  useEffect(() => {
    if (isOpen) {
        if (!clients || clients.length === 0) dispatch(fetchClients());
        if (!chantiers || chantiers.length === 0) dispatch(fetchChantiers());
    }
  }, [isOpen, dispatch]);

  // Form State
  const [formData, setFormData] = useState<CreatePOPayload>({
    po_number: '',
    client: 0,
    chantier: 0,
    issued_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
    project_description: '',
    items: []
  });

  // Generate PO Number on open
  useEffect(() => {
    if (isOpen) {
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      setFormData(prev => ({
        ...prev,
        po_number: `PO-${new Date().getFullYear()}-${randomNum}`,
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
          // FIX: Set to undefined so we don't send a fake ID (like 1) that might not exist
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.chantier) {
        alert("Veuillez sélectionner un fournisseur/client et un chantier.");
        return;
    }
    if (formData.items.length === 0) {
        alert("Veuillez ajouter au moins un article.");
        return;
    }

    try {
      // We unwrap the result to catch errors directly here
      await dispatch(createPurchaseOrder(formData)).unwrap();
      onClose();
    } catch (err: any) {
      console.error("SERVER ERROR:", err);
      // This will print the specific field causing the 400 error
      alert(`Erreur: ${JSON.stringify(err)}`); 
    }
  };

  const totalHT = formData.items.reduce((acc, item) => acc + (parseFloat(String(item.subtotal)) || 0), 0);
  const totalTVA = formData.items.reduce((acc, item) => acc + ((parseFloat(String(item.subtotal)) || 0) * (parseFloat(String(item.tax_rate)) / 100)), 0);
  const totalTTC = totalHT + totalTVA;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
                 <FileText size={20} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bon de Commande</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nouveau document d'achat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-[#FAFAFA]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Informations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Fournisseur / Client</label>
                    <select 
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 cursor-pointer"
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: Number(e.target.value)})}
                    >
                      <option value={0}>Sélectionner...</option>
                      {/* FIX: Client Name Display */}
                      {clients?.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.company_name || c.name || c.contact_person || `Client #${c.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Chantier</label>
                    <select 
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900 cursor-pointer"
                      value={formData.chantier}
                      onChange={(e) => setFormData({...formData, chantier: Number(e.target.value)})}
                    >
                      <option value={0}>Sélectionner...</option>
                      {chantiers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Achat de matériaux pour rénovation..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-slate-900 resize-none"
                      value={formData.project_description}
                      onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                    />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-full">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={14} /> Détails Commande
                  </h3>

                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900/5 rounded-xl border border-slate-900/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">N° BC</span>
                        <span className="font-black text-slate-900 tracking-wide">{formData.po_number}</span>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Date Commande</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900"
                                value={formData.issued_date}
                                onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Date Livraison Prévue</label>
                        <div className="relative">
                            <input 
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-slate-900"
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

          {/* ITEMS SECTION */}
          <div>
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-lg font-black text-slate-900">Articles</h3>
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
                        <p className="text-slate-400 font-medium text-sm">Votre commande est vide.</p>
                    </div>
                  )}

                  {formData.items.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="hidden md:flex w-8 h-8 rounded-lg bg-slate-50 text-slate-400 font-bold text-xs items-center justify-center border border-slate-100">
                          {index + 1}
                       </div>

                       <div className="flex-1 w-full space-y-2">
                          <input 
                            placeholder="Nom de l'article"
                            className="w-full bg-transparent font-bold text-slate-900 outline-none placeholder:text-slate-300"
                            value={item.item_name}
                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                          />
                          <input 
                            placeholder="Description..."
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
                              <select 
                                className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-center font-bold text-slate-500 text-sm outline-none focus:bg-white focus:border-slate-300 uppercase"
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              >
                                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
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
                            <span className="font-black text-slate-900 text-sm">{item.subtotal}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== index)})}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
            </div>
          </div>
          
          {/* Summary */}
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

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-4 z-10">
          <button onClick={onClose} className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-sm">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 text-sm">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Enregistrer Commande
          </button>
        </div>
      </motion.div>
    </div>
  );
};