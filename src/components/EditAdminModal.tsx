import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShieldCheck, Phone, Mail, User, Building2, AlertCircle } from 'lucide-react';
import { updateDeptAdmin, resetStatus } from '../store/slices/deptAdminSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { DeptAdmin } from '../store/slices/deptAdminSlice';

interface EditProps {
  isOpen: boolean;
  onClose: () => void;
  admin: DeptAdmin | null;
}

export const EditAdminModal = ({ isOpen, onClose, admin }: EditProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { isUpdating, error } = useSelector((state: RootState) => state.deptAdmins);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: '',
    department: ''
  });

  const [] = useState<string | null>(null);

  // Synchronisation des données quand l'admin sélectionné change
  useEffect(() => {
    if (isOpen && admin) {
      dispatch(fetchDepartments());
      dispatch(resetStatus());
      setFormData({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        phone_number: admin.phone_number,
        role: admin.role,
        department: admin.department.toString()
      });
    }
  }, [isOpen, admin, dispatch]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+212')) value = '+212';
    const numbersOnly = value.slice(4).replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phone_number: '+212' + numbersOnly });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;

    const payload = {
      ...formData,
      department: Number(formData.department)
    };

    dispatch(updateDeptAdmin({ id: admin.id, data: payload })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        onClose();
      }
    });
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Modifier le profil</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-100 text-red-700 text-xs font-medium">
            <AlertCircle size={16} /> {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input 
                type="text" value={formData.first_name} required
                className="w-full rounded-xl border border-slate-200 p-4 pl-12 outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <input 
              type="text" value={formData.last_name} required
              className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input 
              type="email" value={formData.email} required
              className="w-full rounded-xl border border-slate-200 p-4 pl-12 outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input 
                type="text" value={formData.phone_number} required
                className="w-full rounded-xl border border-slate-200 p-4 pl-12 outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50 font-medium"
                onChange={handlePhoneChange}
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-4 top-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <select 
                required value={formData.department}
                className="w-full rounded-xl border border-slate-200 p-4 pl-12 outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50 font-medium"
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit" disabled={isUpdating}
            className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {isUpdating ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
};