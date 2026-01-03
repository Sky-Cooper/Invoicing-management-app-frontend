import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  X, Loader2, HardHat, User, Calendar, 
  ClipboardList, CheckCircle2, Link2, 
  ChevronDown, Briefcase, Pencil 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Redux
// [CHANGED] Imported updateAssignment and ChantierAssignment
import { 
  createAssignment, 
  updateAssignment, 
  resetAssignmentStatus, 
  type ChantierAssignment 
} from '../store/slices/assignmentSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';
import type { RootState } from '../store/store';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ChantierAssignment | null; // [CHANGED] Added this prop
}

const AssignmentModal = ({ isOpen, onClose, initialData }: AssignmentModalProps) => {
  const dispatch = useAppDispatch();
  
  // 1. RÉCUPÉRATION DES RÉFÉRENTIELS (Employés et Chantiers)
  const { items: employees } = useAppSelector((state: RootState) => state.employees);
  const { items: chantiers } = useAppSelector((state: RootState) => state.chantiers);
  const { isLoading, success, error } = useAppSelector((state: RootState) => state.assignments);

  const [formData, setFormData] = useState({
    employee_id: '',
    chantier_id: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });

  // --- 2. CHARGEMENT ET INITIALISATION DES DONNÉES ---
  useEffect(() => {
    if (isOpen) {
      // Charger les listes
      dispatch(fetchEmployees());
      dispatch(fetchChantiers());

      // [CHANGED] Logic to fill form if Editing, or Reset if Creating
      if (initialData) {
        setFormData({
          employee_id: initialData.employee?.id?.toString() || '',
          // Note: We assume initialData has a nested 'chantier' object or 'chantier_id'
          chantier_id: (initialData as any).chantier?.id?.toString() || (initialData as any).chantier_id?.toString() || '',
          description: initialData.description || '',
          start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
          end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
          is_active: initialData.is_active
        });
      } else {
        // RESET for New Assignment
        setFormData({
          employee_id: '',
          chantier_id: '',
          description: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          is_active: true
        });
      }
    }
  }, [isOpen, dispatch, initialData]);

  // --- 3. FERMETURE APRÈS SUCCÈS ---
  useEffect(() => {
    if (success && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        dispatch(resetAssignmentStatus());
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose, isOpen]);

  // [CHANGED] Handle Submit for both Create and Update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      employee_id: Number(formData.employee_id),
      chantier_id: Number(formData.chantier_id),
      // Handle empty end_date
      end_date: formData.end_date ? formData.end_date : null, 
    };

    if (initialData) {
      // UPDATE
      dispatch(updateAssignment({ id: initialData.id, data: payload }));
    } else {
      // CREATE
      dispatch(createAssignment(payload));
    }
  };

  const getFieldError = (field: string) => {
    if (error && typeof error === 'object' && error[field]) {
      return Array.isArray(error[field]) ? error[field][0] : error[field];
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-2 sm:p-4 font-sans text-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-white/20"
        >
          {/* HEADER NOIR PREMIUM */}
          <div className="bg-slate-950 px-10 py-8 flex justify-between items-center shrink-0 border-b border-white/10 text-white">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                {/* [CHANGED] Icon based on mode */}
                {initialData ? <Pencil className="text-white" size={28} /> : <Link2 className="text-white" size={28} />}
              </div>
              <div>
                <h2 className="font-black uppercase tracking-tighter text-2xl leading-none">
                  {/* [CHANGED] Title based on mode */}
                  {initialData ? "Modifier l'Affectation" : "Nouvelle Affectation"}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                  Gestion des Ressources FatouraLik v2.0
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
              <X size={32} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto no-scrollbar p-10 lg:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* VISUEL GAUCHE */}
                <div className="lg:col-span-3 flex flex-col items-center gap-8">
                  <div className="w-full aspect-square bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4 shadow-inner">
                    <ClipboardList size={64} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-6 italic">Ordre de Mission</span>
                  </div>
                </div>

                {/* FORMULAIRE DROITE */}
                <div className="lg:col-span-9 space-y-12">
                  <div className="space-y-8">
                    <SectionHeader title="Liaison Collaborateur & Site" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* SÉLECTION EMPLOYÉ */}
                      <SelectField 
                        label="Collaborateur à assigner" 
                        icon={<User size={20}/>} 
                        value={formData.employee_id}
                        options={employees.map(e => ({ id: e.id, name: `${e.user?.first_name} ${e.user?.last_name} (${e.job_title})` }))}
                        onChange={(v: any) => setFormData({...formData, employee_id: v})}
                        error={getFieldError('employee_id')}
                        required 
                      />

                      {/* SÉLECTION CHANTIER */}
                      <SelectField 
                        label="Chantier de destination" 
                        icon={<HardHat size={20}/>} 
                        value={formData.chantier_id}
                        options={chantiers.map(c => ({ id: c.id, name: `${c.name} - ${c.contract_number}` }))}
                        onChange={(v: any) => setFormData({...formData, chantier_id: v})}
                        error={getFieldError('chantier_id')}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <SectionHeader title="Chronologie & Mission" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField 
                        label="Date de début de mission" 
                        type="date" 
                        icon={<Calendar size={20}/>} 
                        value={formData.start_date}
                        onChange={(v: any) => setFormData({...formData, start_date: v})}
                        error={getFieldError('start_date')}
                        required 
                      />
                      <InputField 
                        label="Date de fin prévue" 
                        type="date" 
                        icon={<Calendar size={20}/>} 
                        value={formData.end_date}
                        onChange={(v: any) => setFormData({...formData, end_date: v})}
                        error={getFieldError('end_date')}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.2em] flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-950" /> Description de la Mission
                      </label>
                      <textarea 
                        rows={3} 
                        className={`w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-2 outline-none font-bold text-sm transition-all resize-none shadow-inner
                          ${getFieldError('description') ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-slate-950/20 focus:bg-white'}`}
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Quelles seront les responsabilités du collaborateur sur ce site ?"
                        required
                      />
                      {getFieldError('description') && <p className="mt-1 text-[9px] font-black text-red-500 uppercase italic ml-6">{getFieldError('description')}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PIED DE PAGE ACTIONS */}
            <div className="bg-slate-50 px-12 py-8 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                 <input 
                   type="checkbox" 
                   id="is_active"
                   checked={formData.is_active}
                   onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                   className="w-5 h-5 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                 />
                 <label htmlFor="is_active" className="text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer">Affectation Immédiate</label>
              </div>

              <div className="flex items-center gap-6">
                <button type="button" onClick={onClose} className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`min-w-[300px] py-6 px-10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl
                    ${success ? 'bg-green-600 text-white' : 'bg-slate-950 text-white hover:bg-slate-800'}
                    disabled:opacity-50`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : (initialData ? <Pencil size={20} /> : <Link2 size={20} />)}
                  {success ? 'Mission Confirmée' : (initialData ? 'Sauvegarder' : 'Valider l\'Affectation')}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- COMPOSANTS DE STRUCTURE ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4">
    <span className="h-px flex-1 bg-slate-100"></span>
    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.5em]">{title}</h3>
  </div>
);

const SelectField = ({ label, icon, value, onChange, options, required, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.2em] group-focus-within:text-slate-950 transition-colors">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 z-10 pointer-events-none">{icon}</div>
      <select 
        required={required}
        className={`w-full pl-16 pr-12 py-5 rounded-[2rem] bg-slate-50 border-2 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-900 shadow-inner
          ${error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-slate-950/20 focus:bg-white'}`}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Sélectionner...</option>
        {options.map((opt: any) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
        <ChevronDown size={18} />
      </div>
      {error && <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-6 leading-none">{error}</p>}
    </div>
  </div>
);

const InputField = ({ label, icon, value, onChange, type = "text", required = false, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.2em] group-focus-within:text-slate-950 transition-colors">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 transition-colors">{icon}</div>
      <input 
        type={type} required={required}
        className={`w-full pl-16 pr-6 py-5 rounded-[2rem] bg-slate-50 border-2 outline-none font-bold text-sm transition-all text-slate-900 shadow-inner
          ${error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-slate-950/20 focus:bg-white'}`}
        value={value || ''} onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-6 leading-none">{error}</p>}
    </div>
  </div>
);

export default AssignmentModal;