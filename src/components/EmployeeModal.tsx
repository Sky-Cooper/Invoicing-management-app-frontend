import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  X, Loader2, User, Mail, Phone, ShieldCheck, 
  Fingerprint, CheckCircle2, Briefcase, Calendar, Key, Building2, ChevronDown,
  Edit3, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Redux
import { createEmployee, updateEmployee, resetEmployeeStatus, type Employee } from '../store/slices/employeeSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';
import type { RootState } from '../store/store';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Employee | null;
}

const EmployeeModal = ({ isOpen, onClose, initialData }: EmployeeModalProps) => {
  const dispatch = useAppDispatch();
  
  const { isCreating, isUpdating, success, error: rawError } = useAppSelector((state: RootState) => state.employees);
  const { items: departments } = useAppSelector((state: RootState) => state.departments);

  const storedUser = useMemo(() => {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const isCompanyAdmin = storedUser?.role === 'COMPANY_ADMIN' || storedUser?.role === 'SUPER_ADMIN';
  const myDeptId = storedUser?.department; 

  const emptyForm = {
    user: {
      first_name: '', 
      last_name: '', 
      email: '', 
      phone_number: '+212', 
      password: '',
      department: '', 
      company: ''
    },
    cin: '',
    job_title: '', 
    hire_date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
      
      if (initialData) {
        const deptValue = initialData.user.department 
          ? String(initialData.user.department) 
          : ''; 

        setFormData({
          ...initialData,
          user: {
            ...initialData.user,
            password: '', 
            phone_number: initialData.user.phone_number || '+212', 
            department: deptValue, 
            company: initialData.user.company ? String(initialData.user.company) : (storedUser?.company || '')
          }
        } as any);
      } else {
        setFormData({
            ...emptyForm,
            user: {
                ...emptyForm.user,
                company: storedUser?.company || '',
                department: !isCompanyAdmin && myDeptId ? String(myDeptId) : ''
            }
        });
      }
    }
  }, [initialData, isOpen, dispatch, isCompanyAdmin, myDeptId, storedUser]);

  useEffect(() => {
    if (success && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        dispatch(resetEmployeeStatus());
        setFormData(emptyForm);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose, isOpen]);

  const handlePhoneChange = (value: string) => {
    let rawValue = value.replace(/[^0-9]/g, "");
    if (rawValue.startsWith("06")) {
      rawValue = "2126" + rawValue.substring(2);
    } else if (rawValue.startsWith("07")) {
      rawValue = "2127" + rawValue.substring(2);
    }
    if (!rawValue.startsWith("212")) {
       rawValue = "212";
    }
    if (rawValue.length > 12) {
        rawValue = rawValue.slice(0, 12);
    }
    const formattedPhone = "+" + rawValue;
    setFormData((prev: any) => ({
        ...prev,
        user: { ...prev.user, phone_number: formattedPhone }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDepartmentId = isCompanyAdmin 
        ? (formData.user.department ? Number(formData.user.department) : null)
        : (myDeptId ? Number(myDeptId) : null);

    const userData: any = {
      first_name: formData.user.first_name,
      last_name: formData.user.last_name,
      department: finalDepartmentId,
      company: Number(storedUser?.company),
    };

    const payload: any = {
      user: userData,
      job_title: formData.job_title,
      hire_date: formData.hire_date
    };

    if (initialData && initialData.user.id) {
      userData.id = initialData.user.id; 
      if (formData.user.email !== initialData.user.email) userData.email = formData.user.email;
      if (formData.user.phone_number !== initialData.user.phone_number) userData.phone_number = formData.user.phone_number;
      if (formData.cin !== initialData.cin) payload.cin = formData.cin;
    } else {
      userData.email = formData.user.email;
      userData.phone_number = formData.user.phone_number;
      userData.password = formData.user.password;
      payload.cin = formData.cin;
    }

    if (initialData?.id) {
      dispatch(updateEmployee({ id: initialData.id, data: payload }));
    } else {
      dispatch(createEmployee(payload));
    }
  };

  const getFieldError = (fieldPath: string) => {
    if (!rawError || typeof rawError === 'string') return null;
    const keys = fieldPath.split('.');
    let current: any = rawError;
    for (const key of keys) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return null;
        }
    }
    return Array.isArray(current) ? current[0] : current;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-2 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-4xl lg:rounded-[3.5rem] w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden shadow-[0_30px_70px_-15px_rgba(220,38,38,0.25)] border border-white"
        >
          {/* HEADER */}
          <div className="bg-linear-to-r from-red-600 via-red-700 to-red-800 px-6 py-6 lg:px-10 lg:py-10 flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 lg:w-80 lg:h-80 bg-white/10 rounded-full -mr-12 -mt-12 lg:-mr-24 blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 lg:gap-6 relative z-10">
              <div className="p-3 lg:p-4 bg-white/20 rounded-2xl lg:rounded-3xl backdrop-blur-md border border-white/30 shadow-inner">
                {initialData ? <Edit3 className="text-white w-6 h-6 lg:w-8 lg:h-8" /> : <Fingerprint className="text-white w-6 h-6 lg:w-8 lg:h-8" />}
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-tighter text-xl lg:text-3xl leading-none">
                  {initialData ? 'Mise à jour' : 'Recrutement'}
                </h2>
                <p className="text-red-100 text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] mt-1 lg:mt-2 flex items-center gap-2 opacity-90">
                  <BadgeCheck size={12} className="text-emerald-400" />
                  RH TOURTRA v2.5
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all relative z-10">
              <X size={24} className="lg:w-8 lg:h-8" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-14 bg-slate-50/30">
            {typeof rawError === 'string' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm text-center">
                    {rawError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              {/* VISUAL LEFT */}
              <div className="lg:col-span-3 flex flex-col items-center gap-4 lg:gap-8 text-center">
                <div className="w-32 lg:w-full aspect-square lg:aspect-4/5 bg-white rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-100 flex flex-col items-center justify-center text-slate-200 gap-4 shadow-sm group hover:border-red-200 hover:bg-red-50/30 transition-all overflow-hidden relative">
                  <User size={40} className="lg:w-20 lg:h-20 group-hover:text-red-400 transition-colors drop-shadow-sm relative z-10" />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/5 py-2 lg:py-3 text-center z-10">
                      <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400">Photo Profil</span>
                  </div>
                </div>
                <div className="hidden lg:block w-full h-1 bg-linear-to-r from-transparent via-red-200 to-transparent opacity-30" />
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Dossier Personnel</p>
              </div>

              {/* FORM RIGHT */}
              <div className="lg:col-span-9 space-y-10 lg:space-y-12">
                <div className="space-y-6 lg:space-y-8">
                  <SectionHeader title="Identité & Contact" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <InputField label="Prénom" icon={<User size={18}/>} value={formData.user.first_name} 
                      onChange={(v: any) => setFormData({...formData, user: {...formData.user, first_name: v}})} error={getFieldError('user.first_name')} required />
                    
                    <InputField label="Nom" icon={<User size={18}/>} value={formData.user.last_name} 
                      onChange={(v: any) => setFormData({...formData, user: {...formData.user, last_name: v}})} error={getFieldError('user.last_name')} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <InputField label="Email Pro" type="email" icon={<Mail size={18}/>} value={formData.user.email} 
                      onChange={(v: any) => setFormData({...formData, user: {...formData.user, email: v}})} 
                      error={getFieldError('user.email')} 
                      required />
                    
                    <InputField 
                        label="Mobile (+212 6/7...)" 
                        icon={<Phone size={18}/>} 
                        value={formData.user.phone_number} 
                        onChange={handlePhoneChange} 
                        error={getFieldError('user.phone_number')} 
                    />
                  </div>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  <SectionHeader title="Contrat & Affectation" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <InputField label="Poste Occupé" icon={<Briefcase size={18}/>} value={formData.job_title} 
                      onChange={(v: any) => setFormData({...formData, job_title: v})} error={getFieldError('job_title')} required />
                    
                    <InputField label="Numéro CIN" icon={<ShieldCheck size={18}/>} value={formData.cin} 
                      onChange={(v: any) => setFormData({...formData, cin: v})} error={getFieldError('cin')} required />
                    
                    <div className="space-y-2 flex-1 group relative">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 lg:ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">
                            Département {isCompanyAdmin && <span className="text-red-600">*</span>}
                        </label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors pointer-events-none">
                                <Building2 size={18}/>
                            </div>
                            <select 
                                required={isCompanyAdmin}
                                value={formData.user.department} 
                                onChange={(e) => setFormData({...formData, user: {...formData.user, department: e.target.value}})}
                                disabled={!isCompanyAdmin} 
                                className={`w-full pl-14 lg:pl-16 pr-10 py-4 lg:py-5 rounded-3xl lg:rounded-4xl border-2 outline-none font-bold text-sm transition-all shadow-sm appearance-none 
                                    ${!isCompanyAdmin 
                                        ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed opacity-80' 
                                        : 'bg-white border-slate-100 text-slate-700 cursor-pointer focus:border-red-500/40'
                                    }`}
                            >
                                <option value="">Choisir...</option>
                                {departments.map((opt: any) => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                                {departments.length === 0 && myDeptId && (
                                    <option value={String(myDeptId)}>Votre Département (ID: {myDeptId})</option>
                                )}
                            </select>
                            {isCompanyAdmin && <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />}
                        </div>
                        {!isCompanyAdmin && (
                            <p className="ml-6 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                * Verrouillé
                            </p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <InputField label="Date d'embauche" type="date" icon={<Calendar size={18}/>} value={formData.hire_date} 
                      onChange={(v: any) => setFormData({...formData, hire_date: v})} error={getFieldError('hire_date')} />

                    {!initialData && (
                        <InputField label="Mot de passe" type="password" icon={<Key size={18}/>} value={formData.user.password} 
                            onChange={(v: any) => setFormData({...formData, user: {...formData.user, password: v}})} error={getFieldError('user.password')} required />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* FOOTER */}
          <div className="bg-white px-6 py-6 lg:px-12 lg:py-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-3 text-slate-400">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ressources Humaines Actives</p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 lg:gap-6 w-full md:w-auto">
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 transition-colors">
                Abandonner
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || success}
                className={`w-full sm:min-w-70 py-5 lg:py-6 px-8 lg:px-10 rounded-2xl lg:rounded-4xl font-black text-[10px] lg:text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl hover:-translate-y-1 active:scale-95
                  ${success ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-linear-to-r from-red-600 to-red-800 text-white shadow-red-500/40 hover:shadow-red-500/60'}
                  disabled:opacity-50`}
              >
                {isCreating || isUpdating ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : null}
                {success ? 'Employé Enregistré' : initialData ? 'Valider' : 'Confirmer Recrutement'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 lg:gap-6">
    <h3 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h3>
    <div className="h-0.5 w-full bg-linear-to-r from-red-100 to-transparent rounded-full" />
  </div>
);

const InputField = ({ label, icon, value, onChange, type = "text", required = false, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 lg:ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors">{icon}</div>
      <input 
        type={type} 
        required={required}
        className={`w-full pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-5 rounded-3xl lg:rounded-4xl bg-white border-2 outline-none font-bold text-sm transition-all text-slate-700 shadow-sm
          ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5'}`}
        value={value || ''} 
        onChange={typeof onChange === 'function' ? (e) => onChange(e.target ? e.target.value : e) : undefined}
      />
      {error && (
        <p className="mt-2 text-[10px] font-black text-red-600 uppercase italic ml-6 leading-none animate-pulse">
            {error}
        </p>
      )}
    </div>
  </div>
);

export default EmployeeModal;