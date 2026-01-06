import React, { useEffect, useState } from 'react';
import { 
  X, Save, FileText, Loader2, Upload, 
  Calendar, DollarSign, User, Briefcase, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { createContract, updateContract, type WorkingContract } from '../store/slices/contractSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contract?: WorkingContract | null;
  readOnly?: boolean; // <--- 1. Add this property
}

export const ContractModal = ({ isOpen, onClose, contract, readOnly = false }: Props) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.contracts);
  const { items: employees } = useAppSelector((state) => state.employees);

  const [backendError, setBackendError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    contract_number: '',
    contract_start_date: '',
    contract_end_date: '',
    job_title: '',
    salary: '',
    bonus: '0.00',
    allowances: '0.00',
    notes: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Load Employees on mount
  useEffect(() => {
    if (isOpen && employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [isOpen, dispatch, employees.length]);

  // Load Data for Edit Mode
  useEffect(() => {
    setBackendError(null);
    if (contract && isOpen) {
      setFormData({
        employee: String(contract.employee.id),
        contract_number: contract.contract_number,
        contract_start_date: contract.contract_start_date,
        contract_end_date: contract.contract_end_date,
        job_title: contract.job_title,
        salary: contract.salary,
        bonus: contract.bonus,
        allowances: contract.allowances,
        notes: contract.notes,
      });
      setPdfFile(null);
    } else {
      setFormData({
        employee: '',
        contract_number: `WC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_end_date: '',
        job_title: '',
        salary: '',
        bonus: '0.00',
        allowances: '0.00',
        notes: '',
      });
      setPdfFile(null);
    }
  }, [contract, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submission in read-only mode

    setBackendError(null); 
    
    // Validation
    if (!formData.employee || formData.employee.trim() === '') {
      setBackendError("Veuillez sélectionner un employé obligatoirement.");
      return; 
    }

    const payload: any = { ...formData };
    if (pdfFile) {
      payload.contract_pdf = pdfFile;
    }

    try {
      if (contract) {
        await dispatch(updateContract({ id: contract.id, data: payload })).unwrap();
      } else {
        await dispatch(createContract(payload)).unwrap();
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving contract", err);
      const errorMessage = typeof err === 'string' ? err : (err.message || "Une erreur est survenue.");
      setBackendError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {/* Dynamic Title based on ReadOnly state */}
                {readOnly ? 'Détails du Contrat' : (contract ? 'Modifier le Contrat' : 'Nouveau Contrat')}
              </h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Gestion RH</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          
          <AnimatePresence>
            {backendError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm font-bold">{backendError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section 1: Employee & Contract Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Informations Générales</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Employé <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required 
                    disabled={readOnly} // Disable input
                    value={formData.employee} 
                    onChange={(e) => {
                        setFormData({...formData, employee: e.target.value});
                        if(e.target.value) setBackendError(null);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl font-bold text-slate-700 outline-none appearance-none transition-colors 
                      ${readOnly ? 'opacity-70 cursor-not-allowed' : ''} 
                      ${backendError && !formData.employee ? 'border-red-300 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-blue-500'}
                    `}
                  >
                    <option value="">Sélectionner un employé...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.user.first_name} {e.user.last_name} ({e.cin})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Poste / Intitulé</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    disabled={readOnly}
                    value={formData.job_title} 
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="ex: Ingénieur Site"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">N° Contrat</label>
                  <input 
                    type="text" 
                    required 
                    disabled={readOnly}
                    value={formData.contract_number} 
                    onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PDF Contrat</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf"
                      disabled={readOnly}
                      onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className={`w-full px-4 py-3 border border-slate-200 rounded-xl flex items-center gap-2 
                      ${readOnly ? 'opacity-60 bg-slate-100' : (pdfFile ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400')}
                    `}>
                      {pdfFile ? <FileText size={18}/> : <Upload size={18}/>}
                      <span className="text-xs font-bold truncate">
                        {pdfFile ? pdfFile.name : (readOnly ? "Aucun fichier" : "Upload PDF")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Financials & Dates */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Conditions & Salaire</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Début</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      required 
                      disabled={readOnly}
                      value={formData.contract_start_date} 
                      onChange={(e) => setFormData({...formData, contract_start_date: e.target.value})}
                      className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fin</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      required 
                      disabled={readOnly}
                      value={formData.contract_end_date} 
                      onChange={(e) => setFormData({...formData, contract_end_date: e.target.value})}
                      className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Salaire Base</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                    <input 
                      type="number" 
                      required 
                      disabled={readOnly}
                      value={formData.salary} 
                      onChange={(e) => setFormData({...formData, salary: e.target.value})} 
                      className="w-full pl-6 pr-2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-500" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Bonus</label>
                  <input 
                    type="number" 
                    disabled={readOnly}
                    value={formData.bonus} 
                    onChange={(e) => setFormData({...formData, bonus: e.target.value})} 
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="0.00" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Indemnités</label>
                  <input 
                    type="number" 
                    disabled={readOnly}
                    value={formData.allowances} 
                    onChange={(e) => setFormData({...formData, allowances: e.target.value})} 
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
                <textarea 
                  rows={3}
                  disabled={readOnly}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none resize-none focus:bg-white focus:border-slate-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Conditions particulières..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            {readOnly ? "Fermer" : "Annuler"}
          </button>
          
          {/* Hide Save button if ReadOnly */}
          {!readOnly && (
            <button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};