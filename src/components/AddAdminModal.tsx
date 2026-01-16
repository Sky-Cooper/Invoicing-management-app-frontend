import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShieldCheck, Receipt, User, Mail, Phone, Key, Building2, Loader2, AlertCircle } from 'lucide-react';
import { createDeptAdmin, updateDeptAdmin, resetStatus } from '../store/slices/deptAdminSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';
import type { AppDispatch, RootState } from '../store/store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; 
}

export const AddAdminModal = ({ isOpen, onClose, initialData }: ModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: departments } = useSelector((state: RootState) => state.departments);
  
  // ✅ 1. Get ERROR from Redux
  const { isLoading, error } = useSelector((state: RootState) => state.deptAdmins);

  const [formData, setFormData] = useState({
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    phone_number: '+212', 
    role: 'INVOICING_ADMIN', 
    department: '' 
  });

  // --- LOGIQUE DE PRÉ-REMPLISSAGE ---
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
      dispatch(resetStatus());
      
      if (initialData) {
        setFormData({
          ...initialData,
          password: '', 
          department: initialData.department?.toString() || '',
          role: initialData.role || 'INVOICING_ADMIN'
        });
      } else {
        setFormData({
          first_name: '', last_name: '', email: '', password: '', phone_number: '+212', role: 'INVOICING_ADMIN', department: ''
        });
      }
    }
  }, [isOpen, initialData, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, department: Number(formData.department) };

    if (initialData?.id) {
      dispatch(updateDeptAdmin({ id: initialData.id, data: payload })).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') onClose();
      });
    } else {
      dispatch(createDeptAdmin(payload as any)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') onClose();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialData ? "Modifier l'Accès" : "Nouveau Privilège"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuration des permissions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>

        {/* ✅ 2. ERROR DISPLAY SECTION */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-pulse">
            <AlertCircle className="text-red-600 mt-0.5 shrink-0" size={18} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-red-800 uppercase tracking-wider">
                Erreur
              </span>
              <div className="text-sm font-medium text-red-600 space-y-1">
                {/* Logic to handle string errors vs object errors (Django style) */}
                {typeof error === 'string' ? (
                  <p>{error}</p>
                ) : (
                  Object.entries(error).map(([key, messages]: [string, any]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-bold text-red-800 capitalize text-xs">{key.replace('_', ' ')}:</span>
                      <span className="text-xs">{Array.isArray(messages) ? messages[0] : messages}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- SÉLECTEUR DE RÔLE (Design Radio Cards) --- */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'INVOICING_ADMIN' })}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'INVOICING_ADMIN' 
                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-sm' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <Receipt size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Invoicing Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'HR_ADMIN' })}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'HR_ADMIN' 
                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-sm' 
                : 'border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <ShieldCheck size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Dept Admin</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" placeholder="Prénom" required value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" placeholder="Nom" required value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="email" placeholder="Email professionnel" required value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="password" 
                  placeholder={initialData ? "Nouveau MDP" : "Mot de passe"} 
                  required={!initialData}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" value={formData.phone_number} required
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>

            <div className="relative">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <select 
                required value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full rounded-xl border border-slate-100 p-4 pl-12 bg-slate-50/50 focus:bg-white outline-none transition-all font-bold text-sm appearance-none"
              >
                <option value="">Choisir un département</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit" disabled={isLoading}
            className="w-full rounded-2xl bg-linear-to-r from-red-600 to-red-700 py-5 font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              initialData ? "Mettre à jour les privilèges" : "Confirmer la création"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;