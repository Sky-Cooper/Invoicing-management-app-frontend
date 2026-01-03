import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  X, Loader2, Package, Tag, Info, 
  Banknote, Percent, CheckCircle2, Layers, BadgeCheck, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Redux
import { createItem, updateItem, resetItemStatus, type Item } from '../store/slices/itemSlice';
import type { RootState } from '../store/store';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Item | null;
}

const ItemModal = ({ isOpen, onClose, initialData }: ItemModalProps) => {
  const dispatch = useAppDispatch();
  const { isLoading, success } = useAppSelector((state: RootState) => state.items);

  const [formData, setFormData] = useState<Partial<Item>>({
    code: '',
    name: '',
    description: '',
    unit_price: '',
    unit: 'unité',
    tax_rate: '20.00'
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(resetItemStatus());
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ code: '', name: '', description: '', unit_price: '', unit: 'unité', tax_rate: '20.00' });
      }
    }
  }, [initialData, isOpen, dispatch]);

  useEffect(() => {
    if (success && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        dispatch(resetItemStatus());
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      dispatch(updateItem({ id: initialData.id, data: formData }));
    } else {
      dispatch(createItem(formData as Item));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay optimisé pour la visibilité de l'en-tête */}
      <div className="fixed inset-0 z-[150] flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-6 overflow-y-auto font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          /* mt-20 pour s'assurer que le header rouge n'est jamais caché par Google */
          className="bg-white rounded-[3rem] w-full max-w-4xl mt-20 mb-12 overflow-hidden shadow-[0_40px_100px_-15px_rgba(220,38,38,0.35)] ring-1 ring-white/50 relative"
        >
          {/* HEADER ROUGE VIBRANT - Identité TOURTRA */}
          <div className="bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#991b1b] p-10 flex justify-between items-center text-white relative overflow-hidden shrink-0 shadow-lg">
            {/* Effets visuels de fond pour le dynamisme */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.2)]">
                <Package className="text-white drop-shadow-md" size={32} />
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic text-white drop-shadow-sm">
                    {initialData ? "Modifier l'Item" : 'Nouvel Article'}
                </h2>
                <p className="text-red-100 text-[10px] font-bold uppercase tracking-[0.35em] mt-3 flex items-center gap-2 opacity-90">
                    <BadgeCheck size={14} className="text-emerald-400" />
                    VOTRE STRUCTURE, NOTRE EXCELLENCE
                </p>
              </div>
            </div>
            <button onClick={onClose} className="group p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all relative z-10 border border-white/10 hover:rotate-90 duration-300">
                <X size={28} />
            </button>
          </div>

          {/* FORMULAIRE - Style Pro Vibrant avec fond clair */}
          <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-10 bg-slate-50/40 relative">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputField 
                label="CODE RÉFÉRENCE" 
                icon={<Tag size={20}/>} 
                value={formData.code} 
                onChange={(v: any) => setFormData({...formData, code: v})} 
                required 
                placeholder="ex: TR-2025-001" 
              />
              <InputField 
                label="DÉSIGNATION DE L'ARTICLE" 
                icon={<Info size={20}/>} 
                value={formData.name} 
                onChange={(v: any) => setFormData({...formData, name: v})} 
                required 
                placeholder="Nom du produit ou service" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <InputField 
                label="PRIX UNITAIRE (MAD)" 
                icon={<Banknote size={20} className="text-red-600"/>} 
                type="number" 
                step="0.01" 
                value={formData.unit_price} 
                onChange={(v: any) => setFormData({...formData, unit_price: v})} 
                required 
              />
              
              <div className="space-y-3 flex-1 group text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors italic">UNITÉ DE MESURE</label>
                <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 z-10 pointer-events-none transition-colors">
                        <Layers size={20}/>
                    </div>
                    <select 
                        className="w-full pl-16 pr-12 py-5 rounded-[2.2rem] bg-white border-2 border-slate-200 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-800 shadow-sm transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/5 focus:bg-white"
                        value={formData.unit} 
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    >
                        <option value="unité">Unité (u)</option>
                        <option value="heure">Heure (h)</option>
                        <option value="jour">Jour (j)</option>
                        <option value="m²">Mètre Carré (m²)</option>
                        <option value="m³">Mètre Cube (m³)</option>
                        <option value="forfait">Forfait (f)</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-focus-within:rotate-180 duration-300">
                        <ChevronDown size={18} />
                    </div>
                </div>
              </div>

              <InputField 
                label="TAUX TVA (%)" 
                icon={<Percent size={20}/>} 
                type="number" 
                value={formData.tax_rate} 
                onChange={(v: any) => setFormData({...formData, tax_rate: v})} 
                required 
              />
            </div>

            <div className="space-y-3 text-left group">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] flex items-center gap-2 italic group-focus-within:text-red-600 transition-colors">
                <Info size={14} className="text-red-600" /> DESCRIPTION TECHNIQUE DÉTAILLÉE
              </label>
              <textarea 
                rows={4} 
                className="w-full px-8 py-6 rounded-[2.5rem] bg-white border-2 border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none font-bold text-sm transition-all resize-none shadow-sm text-slate-800 placeholder:text-slate-300"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Précisez les spécificités de cet article..." 
              />
            </div>

            {/* FOOTER ACTIONS - Harmonisé avec le thème rouge */}
            <div className="flex items-center justify-between pt-10 border-t border-slate-200/50">
              <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-10 py-5 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-[2rem]"
              >
                  Annuler
              </button>
              <button 
                  type="submit" 
                  disabled={isLoading || success}
                  className={`min-w-[320px] py-6 px-10 rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-[0_20px_40px_-15px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:scale-95 relative overflow-hidden group
                  ${success 
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-red-500/40'}`}
              >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <span className="relative z-10 flex items-center gap-3">
                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : success ? <CheckCircle2 size={20}/> : <Package size={20}/>}
                    {success ? 'ENREGISTRÉ AVEC SUCCÈS' : initialData ? 'VALIDER LES MODIFICATIONS' : 'AJOUTER AU CATALOGUE'}
                  </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const InputField = ({ label, icon, value, onChange, type = "text", step = "1", required = false, placeholder = "" }: any) => (
  <div className="space-y-3 flex-1 group text-left">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors italic">
        {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-all duration-300 drop-shadow-sm">{icon}</div>
      <input 
        type={type} 
        step={step} 
        required={required} 
        placeholder={placeholder}
        className="w-full pl-16 pr-8 py-5 rounded-[2.2rem] bg-white border-2 border-slate-200 outline-none font-bold text-sm transition-all text-slate-800 shadow-sm placeholder:text-slate-300
        hover:border-red-300
        focus:border-red-500 focus:ring-4 focus:ring-red-500/5"
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  </div>
);

export default ItemModal;