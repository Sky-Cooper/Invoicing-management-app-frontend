import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Building2, Calendar, Coins, Tag, Truck, HardHat, Package } from 'lucide-react';
import { addFixedCharge, updateFixedCharge, resetFixedChargeStatus } from '../store/slices/fixedChargeSlice';
import { fetchChantiers } from '../store/slices/chantierSlice'; // Assuming you have this
import type { AppDispatch, RootState } from '../store/store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const CATEGORIES = [
  { id: 'LABOR', label: 'Main d\'œuvre', icon: HardHat, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'MATERIAL', label: 'Matériaux', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'TRANSPORT', label: 'Transport', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'OTHER', label: 'Autre', icon: Tag, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
];

export const AddFixedChargeModal = ({ isOpen, onClose, initialData }: ModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: chantiers } = useSelector((state: RootState) => state.chantiers);
  const { isLoading, success } = useSelector((state: RootState) => state.fixedCharges);

  const [formData, setFormData] = useState({
    title: '',
    chantier: '',
    category: 'LABOR',
    amount: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchChantiers());
      dispatch(resetFixedChargeStatus());

      if (initialData) {
        setFormData({
          title: initialData.title || '',
          chantier: initialData.chantier?.toString() || '',
          category: initialData.category || 'LABOR',
          amount: initialData.amount || '',
          start_date: initialData.start_date || '',
          end_date: initialData.end_date || '',
          is_active: initialData.is_active ?? true
        });
      } else {
        setFormData({
          title: '', chantier: '', category: 'LABOR', amount: '', 
          start_date: new Date().toISOString().split('T')[0], // Default Today
          end_date: '', is_active: true
        });
      }
    }
  }, [isOpen, initialData, dispatch]);

  // --- CLOSE ON SUCCESS ---
  useEffect(() => {
    if (success) {
      onClose();
    }
  }, [success, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, chantier: Number(formData.chantier) };

    if (initialData?.id) {
      dispatch(updateFixedCharge({ id: initialData.id, data: payload as any }));
    } else {
      dispatch(addFixedCharge(payload as any));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialData ? "Modifier la Charge" : "Nouvelle Charge Fixe"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dépenses récurrentes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- CATEGORY SELECTION --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.category === cat.id
                  ? `${cat.border} ${cat.bg} ${cat.color} shadow-sm`
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <cat.icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Title & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" placeholder="Titre de la charge (ex: Gardiennage)" required value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="relative">
                <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="number" step="0.01" placeholder="Montant (DH)" required value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Chantier Select */}
            <div className="relative">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <select 
                required value={formData.chantier}
                onChange={(e) => setFormData({...formData, chantier: e.target.value})}
                className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white outline-none transition-all font-bold text-sm appearance-none"
              >
                <option value="">Sélectionner le chantier associé</option>
                {chantiers.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-2">Date début</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="date" required value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-2">Date fin</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="date" required value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <input 
                type="checkbox" 
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
               />
               <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Charge active (Générer automatiquement)
               </label>
            </div>

          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 py-5 font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              initialData ? "Sauvegarder les modifications" : "Créer la charge fixe"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};