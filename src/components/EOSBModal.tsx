import React, { useEffect, useState } from 'react';
import { 
  X, Save, FileText, Loader2, Upload, 
  DollarSign, User, Calculator, Briefcase, Eye 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { createEOSB, updateEOSB, type EOSB } from '../store/slices/eosbSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record?: EOSB | null;
  readOnly?: boolean; // NEW PROP
}

export const EOSBModal = ({ isOpen, onClose, record, readOnly = false }: Props) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.eosb);
  const { items: employees } = useAppSelector((state) => state.employees);

  const [formData, setFormData] = useState({
    employee: '',
    last_job_title: '',
    last_salary: '',
    hire_date: '',
    exit_date: new Date().toISOString().split('T')[0],
    total_years_of_service: '',
    basic_end_of_service_payment: '',
    bonuses_paid: '0.00',
    deductions: '0.00',
    net_payment: '0.00',
    notes: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Load Employees
  useEffect(() => {
    if (isOpen && employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [isOpen, dispatch, employees.length]);

  // Load Data
  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        employee: String(record.employee.id),
        last_job_title: record.last_job_title,
        last_salary: record.last_salary,
        hire_date: record.hire_date,
        exit_date: record.exit_date,
        total_years_of_service: record.total_years_of_service,
        basic_end_of_service_payment: record.basic_end_of_service_payment,
        bonuses_paid: record.bonuses_paid,
        deductions: record.deductions,
        net_payment: record.net_payment,
        notes: record.notes,
      });
      setPdfFile(null);
    } else if (isOpen) {
      setFormData({
        employee: '',
        last_job_title: '',
        last_salary: '',
        hire_date: '',
        exit_date: new Date().toISOString().split('T')[0],
        total_years_of_service: '',
        basic_end_of_service_payment: '',
        bonuses_paid: '0.00',
        deductions: '0.00',
        net_payment: '0.00',
        notes: '',
      });
      setPdfFile(null);
    }
  }, [record, isOpen]);

  // Auto-fill
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value;
    const emp = employees.find(ep => ep.id === Number(empId));
    
    setFormData(prev => ({
      ...prev,
      employee: empId,
      last_job_title: emp?.job_title || '',
      hire_date: emp?.hire_date || '',
    }));
  };

  // Auto-Calc (Only if not readOnly)
  useEffect(() => {
    if (!readOnly) {
      const basic = parseFloat(formData.basic_end_of_service_payment) || 0;
      const bonus = parseFloat(formData.bonuses_paid) || 0;
      const deduct = parseFloat(formData.deductions) || 0;
      const net = (basic + bonus - deduct).toFixed(2);
      
      if (net !== formData.net_payment && !record) {
         setFormData(prev => ({ ...prev, net_payment: net }));
      }
    }
  }, [formData.basic_end_of_service_payment, formData.bonuses_paid, formData.deductions, record, readOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submit in read-only

    if (!formData.employee) {
        alert("Erreur : Veuillez sélectionner un employé.");
        return;
    }

    const payload: any = { 
        ...formData,
        employee: Number(formData.employee), 
        bonuses_paid: formData.bonuses_paid || "0.00",
        deductions: formData.deductions || "0.00",
    };

    if (pdfFile) {
        payload.eosb_pdf = pdfFile;
    }

    try {
      if (record) {
        await dispatch(updateEOSB({ id: record.id, data: payload })).unwrap();
      } else {
        await dispatch(createEOSB(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save EOSB", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              {readOnly ? <Eye size={24} /> : <Calculator size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {readOnly ? 'Détails du Dossier' : (record ? 'Modifier Solde' : 'Nouveau Calcul')}
              </h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
                {readOnly ? 'Mode Lecture Seule' : 'Clôture de Contrat'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <fieldset disabled={readOnly} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Context */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Informations Employé</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Employé Sortant</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required 
                    value={formData.employee} 
                    onChange={handleEmployeeChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none disabled:bg-slate-100"
                  >
                    <option value="">Sélectionner...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.user.first_name} {e.user.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dernier Poste</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" required value={formData.last_job_title} onChange={(e) => setFormData({...formData, last_job_title: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dernier Salaire</label>
                  <input type="number" required value={formData.last_salary} onChange={(e) => setFormData({...formData, last_salary: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Date Embauche</label>
                  <input type="date" required value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} className="w-full px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none disabled:bg-slate-100" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Date Sortie</label>
                  <input type="date" required value={formData.exit_date} onChange={(e) => setFormData({...formData, exit_date: e.target.value})} className="w-full px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none disabled:bg-slate-100" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Années Service</label>
                  <input type="number" step="0.1" required value={formData.total_years_of_service} onChange={(e) => setFormData({...formData, total_years_of_service: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-center outline-none focus:border-blue-500 disabled:bg-slate-100" placeholder="0.0" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Signé (PDF)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    disabled={readOnly}
                    onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className={`w-full px-4 py-3 border border-slate-200 rounded-xl flex items-center gap-2 ${pdfFile ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400'} ${readOnly ? 'opacity-70' : ''}`}>
                    {pdfFile ? <FileText size={18}/> : <Upload size={18}/>}
                    <span className="text-xs font-bold truncate">
                        {readOnly && !pdfFile ? 'Aucun fichier joint' : (pdfFile ? pdfFile.name : "Téléverser le PDF")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Financials */}
            <div className={`space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 ${readOnly ? 'opacity-90' : ''}`}>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Calcul Final</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Indemnité de base</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="number" required value={formData.basic_end_of_service_payment} onChange={(e) => setFormData({...formData, basic_end_of_service_payment: e.target.value})} className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-600 uppercase mb-2">+ Bonus / Congés</label>
                  <input type="number" value={formData.bonuses_paid} onChange={(e) => setFormData({...formData, bonuses_paid: e.target.value})} className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl font-bold text-sm text-emerald-700 outline-none focus:border-emerald-500 disabled:bg-slate-100" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-600 uppercase mb-2">- Déductions</label>
                  <input type="number" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} className="w-full px-4 py-3 bg-white border border-rose-100 rounded-xl font-bold text-sm text-rose-700 outline-none focus:border-rose-500 disabled:bg-slate-100" placeholder="0.00" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200">
                <label className="block text-xs font-black text-slate-900 uppercase mb-2">Net à Payer</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-900 text-lg">DH</div>
                  <input 
                    type="number" 
                    readOnly
                    value={formData.net_payment} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-900 text-white border-none rounded-2xl font-black text-2xl outline-none" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">* Calcul automatique: Base + Bonus - Déductions</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
                <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 outline-none resize-none disabled:bg-slate-100" placeholder="Détails du calcul..." />
              </div>
            </div>
          </fieldset>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            {readOnly ? 'Fermer' : 'Annuler'}
          </button>
          
          {!readOnly && (
            <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Confirmer Solde
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};