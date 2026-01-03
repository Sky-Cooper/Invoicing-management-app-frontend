import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trash2, Save, BadgeCheck, ChevronDown, 
  User, HardHat, Plus, Loader2,
  Briefcase, AlertCircle, Box, FileText 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
// Import the types we created in the slice
import { createInvoice, clearInvoiceError, type InvoicePayload, type InvoiceItem } from '../store/slices/invoiceSlice';
import { fetchClients } from '../store/slices/clientSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';
import { fetchItems } from '../store/slices/itemSlice';

const UNIT_TYPES = ["day", "bag", "M", "unité", "heure", "m²", "m³", "kg", "ton"] as const;

export const InvoiceForm = ({ onCancel }: { onCancel: () => void }) => {
  const dispatch = useAppDispatch();
  
  const { items: clients } = useAppSelector((state) => state.clients);
  const { items: chantiers } = useAppSelector((state) => state.chantiers);
  const { items: catalogItems } = useAppSelector((state) => state.items);
  const { isLoading, error } = useAppSelector((state) => state.invoices);
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchClients());
      dispatch(fetchChantiers());
      dispatch(fetchItems());
    }
    return () => { dispatch(clearInvoiceError()); };
  }, [dispatch, accessToken]);

  const [formData, setFormData] = useState({
    client: '',
    chantier: '',
    project_description: '', 
    contract_number: '',
    issued_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'DRAFT' as const,
    discount_percentage: '0.00',
    tax_rate: '20.00', 
    Subject: '',
  });

  // ✅ FIX: Use strict typing for items state
  const [items, setItems] = useState<InvoiceItem[]>([
    { 
        item_id: null, // Start with null (Custom Item)
        item_name: '', 
        item_description: '', 
        unit: 'unité', 
        quantity: '1.00', 
        unit_price: '0.00', 
        tax_rate: '20.00', 
        subtotal: '0.00',
        item_code: null // Added to match interface
    }
  ]);

  const handleLoadFromCatalog = (index: number, catalogId: string) => {
    if (!catalogId) return;
    const product = catalogItems.find(i => i.id === parseInt(catalogId));
    
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        item_id: product.id, // ✅ Sets the Catalog ID (3, 4, etc.)
        item_name: product.name,
        item_description: product.description || '',
        unit: product.unit,
        unit_price: product.unit_price,
        tax_rate: product.tax_rate,
        // Calculate subtotal for UI display
        subtotal: (parseFloat(String(product.unit_price)) * parseFloat(String(newItems[index].quantity || '1'))).toFixed(2)
      };
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // ✅ If name changes manually, reset item_id to null (It becomes a Custom Item)
    if (field === 'item_name') {
        newItems[index].item_id = null; 
    }

    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(String(newItems[index].quantity || '0'));
      const p = parseFloat(String(newItems[index].unit_price || '0'));
      newItems[index].subtotal = (q * p).toFixed(2);
    }
    setItems(newItems);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(String(item.quantity || '0')) * parseFloat(String(item.unit_price || '0'))), 0);
    const discPercent = parseFloat(formData.discount_percentage) || 0;
    const discAmount = subtotal * (discPercent / 100);
    const totalHT = subtotal - discAmount;
    const taxRate = parseFloat(formData.tax_rate) || 0;
    const taxAmount = totalHT * (taxRate / 100);
    const totalTTC = totalHT + taxAmount;
    
    return { 
      subtotal: subtotal.toFixed(2), 
      discount_amount: discAmount.toFixed(2),
      total_ht: totalHT.toFixed(2), 
      tax_amount: taxAmount.toFixed(2), 
      total_ttc: totalTTC.toFixed(2),
      remaining_balance: totalTTC.toFixed(2) 
    };
  }, [items, formData.discount_percentage, formData.tax_rate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ PREPARE PAYLOAD
    // We construct the object using the Slice Interface
    const payload: InvoicePayload = {
      ...formData,
      client: parseInt(formData.client),
      chantier: parseInt(formData.chantier),
      
      // ✅ We map local 'items' to 'invoice_items'
      // The Slice sanitizer will see this, rename it to 'items', and handle the IDs
      invoice_items: items.map(item => ({
        item_id: item.item_id || null, // null for custom, number for catalog
        item_name: item.item_name,
        item_description: item.item_description || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        item_code: null 
      }))
    };

    const result = await dispatch(createInvoice(payload));
    if (createInvoice.fulfilled.match(result)) {
        onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-24 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                    <BadgeCheck size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Nouvelle Facture</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N° sera généré automatiquement</p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date Émission</label>
                    <input type="date" value={formData.issued_date} onChange={(e) => setFormData({...formData, issued_date: e.target.value})} 
                        className="w-full bg-slate-50 rounded-xl py-3 px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer" />
                </div>
                <div className="flex-1">
                    <label className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Échéance</label>
                    <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                        className="w-full bg-red-50/50 rounded-xl py-3 px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-red-500/10 text-red-900 cursor-pointer" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: CLIENT & PROJECT INFO */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full flex flex-col gap-6">
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
                <div className="h-px bg-slate-100 w-full my-2" />
                <div className="flex-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Briefcase size={12}/> Objet de la mission
                   </label>
                   <textarea required placeholder="Description détaillée..." value={formData.project_description} onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-600 h-32 outline-none focus:bg-white focus:border-red-500 transition-all resize-none" />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={12} /> N° Contrat
                    </label>
                    <input required placeholder="ex: 0113Y/24" value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-red-500" />
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: ITEMS & TOTALS */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm min-h-[400px] flex flex-col">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                        <BadgeCheck size={16} className="text-red-600"/> Lignes de prestations
                    </h3>
                    <button type="button" onClick={() => setItems([...items, { item_id: null, item_name: '', unit: 'day', quantity: '1.00', unit_price: '0.00', tax_rate: '20.00', subtotal: '0.00' }])}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-slate-200">
                        <Plus size={12} strokeWidth={3} /> Ajouter
                    </button>
                </div>

                <div className="p-6 space-y-4 flex-1">
                    <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="col-span-5">Désignation (Catalogue ou Libre)</div>
                        <div className="col-span-2">Unité</div>
                        <div className="col-span-2 text-center">Qté</div>
                        <div className="col-span-2 text-right">Prix U.</div>
                        <div className="col-span-1"></div>
                    </div>

                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start group">
                        <div className="md:col-span-5 relative">
                            <input 
                                placeholder="Désignation..." 
                                value={item.item_name} 
                                onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} 
                                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-red-500 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 outline-none transition-all" 
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                    <Box size={16} className="text-indigo-500 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                                    <select 
                                            onChange={(e) => handleLoadFromCatalog(index, e.target.value)}
                                            value=""
                                            className="w-8 h-8 opacity-0 cursor-pointer absolute right-0 top-0"
                                            title="Charger depuis le catalogue"
                                    >
                                            <option value="">Charger...</option>
                                            {catalogItems.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.unit_price} DH)</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-2 text-[10px] font-bold text-slate-600 outline-none cursor-pointer uppercase">
                                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                className="w-full bg-slate-50 rounded-xl py-3 text-center text-sm font-black outline-none focus:ring-2 focus:ring-red-500/20" />
                        </div>
                        <div className="md:col-span-2">
                            <input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} 
                                className="w-full bg-slate-50 rounded-xl py-3 text-right px-3 text-sm font-black outline-none focus:ring-2 focus:ring-red-500/20" />
                        </div>
                        <div className="md:col-span-1 flex justify-center pt-3">
                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} 
                                className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="bg-slate-50 p-4 text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Sous-total Lignes</span>
                    <span className="text-sm font-black text-slate-800">{totals.subtotal} DH</span>
                </div>
             </div>

             <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total HT</span>
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
                    <div className="flex flex-col justify-between border-l border-slate-700 pl-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 block mb-1">Total TTC</span>
                            <span className="text-4xl font-black tracking-tighter leading-none">{totals.total_ttc} <span className="text-lg text-slate-500">DH</span></span>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle size={12} className="text-yellow-500" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-500">Reste à payer (Solde Initial)</span>
                            </div>
                            <span className="font-mono font-bold text-xl text-yellow-100">{totals.remaining_balance} DH</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
      </div>

      <div className="flex justify-end items-center gap-6 pt-4 border-t border-slate-100">
        {error && <p className="text-red-500 font-bold text-xs bg-red-50 px-4 py-2 rounded-lg">{typeof error === 'string' ? error : 'Erreur de validation'}</p>}
        <button type="button" onClick={onCancel} className="px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            Abandonner
        </button>
        <button type="submit" disabled={isLoading} className="bg-red-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-red-600/30 hover:bg-red-700 hover:scale-105 transition-all disabled:opacity-50">
          {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
          Enregistrer Facture
        </button>
      </div>
    </form>
  );
};