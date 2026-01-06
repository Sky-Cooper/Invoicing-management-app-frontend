import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  X, Loader2, HardHat, MapPin, FileText, 
  Calendar, CheckCircle2, Globe, Building2, ChevronDown, ShieldCheck, BadgeCheck, Hash,
  Trash2, Paperclip, File as FileIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createChantier, updateChantier, resetChantierStatus, type Chantier } from '../store/slices/chantierSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';
import { fetchClients } from '../store/slices/clientSlice';
import { fetchDeptAdmins } from '../store/slices/deptAdminSlice';
import type { RootState } from '../store/store';

interface ChantierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Chantier | null;
}

const ChantierModal = ({ isOpen, onClose, initialData }: ChantierModalProps) => {
  const dispatch = useAppDispatch();
  
  // --- SELECTORS ---
  const { data: userProfile } = useAppSelector((state: RootState) => state.profile);
  const { items: clients } = useAppSelector((state: RootState) => state.clients);
  const { items: departments, isLoading: isLoadingDeps } = useAppSelector((state: RootState) => state.departments);
  const { admins, isLoading: isLoadingAdmins } = useAppSelector((state: RootState) => state.deptAdmins);
  const { isCreating, isUpdating, success, error } = useAppSelector((state: RootState) => state.chantiers);

  // Filter HR Admins
  const hrAdmins = admins.filter(admin => admin.role === 'HR_ADMIN' && admin.id !== undefined);

  // --- STATE ---
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<Partial<Chantier> & { 
    responsible_ids: number[] 
  }>({
    name: '', location: '', description: '', contract_number: '', contract_date: '',
    department: undefined, client: undefined, responsible_ids: [], 
    start_date: new Date().toISOString().split('T')[0], end_date: '',
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
      dispatch(fetchClients());
      dispatch(fetchDeptAdmins());

      // Reset files on open
      setUploadedFiles([]);

      if (initialData) {
        setFormData({
          ...initialData,
          client: typeof initialData.client === 'object' ? (initialData.client as any).id : initialData.client,
          department: typeof initialData.department === 'object' ? (initialData.department as any).id : initialData.department,
          responsible_ids: initialData.responsible ? initialData.responsible.map(r => r.id) : [],
        });
      } else {
        // Reset Form
        setFormData({
          name: '', location: '', description: '', contract_number: '', contract_date: '',
          department: undefined, client: undefined, responsible_ids: [], 
          start_date: new Date().toISOString().split('T')[0], end_date: '',
        });
      }
    }
  }, [initialData, isOpen, dispatch]);

  // Close on Success
  useEffect(() => {
    if (success && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        dispatch(resetChantierStatus());
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose, isOpen]);

  // --- HANDLERS ---

  // Standard File Selection (Multiple)
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        // Append new files to existing ones (No limit)
        setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
      setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Multi-select Logic
  const handleAddResponsible = (idStr: string) => {
    const id = Number(idStr);
    if (!formData.responsible_ids.includes(id)) {
        setFormData(prev => ({ ...prev, responsible_ids: [...prev.responsible_ids, id] }));
    }
  };

  const handleRemoveResponsible = (idToRemove: number) => {
    setFormData(prev => ({ 
        ...prev, 
        responsible_ids: prev.responsible_ids.filter(id => id !== idToRemove) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      name: formData.name,
      location: formData.location,
      description: formData.description,
      contract_number: formData.contract_number,
      contract_date: formData.contract_date,
      department: Number(formData.department),
      client: Number(formData.client),
      responsible_ids: formData.responsible_ids, 
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      
      // SEND UNLIMITED ARRAY OF FILES
      uploaded_documents: uploadedFiles 
    };

    if (initialData?.id) {
      dispatch(updateChantier({ id: initialData.id, data: dataToSubmit }));
    } else {
      dispatch(createChantier(dataToSubmit));
    }
  };

  const getFieldError = (fieldName: string) => {
    if (error && typeof error === 'object' && error[fieldName]) {
      return Array.isArray(error[fieldName]) ? error[fieldName][0] : error[fieldName];
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 font-sans text-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden shadow-[0_30px_70px_-15px_rgba(220,38,38,0.25)] border border-white"
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-10 py-10 flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/30 shadow-inner">
                <HardHat className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-tighter text-3xl leading-none italic">
                  {initialData ? 'Mise à jour Dossier' : 'Ouverture de Chantier'}
                </h2>
                <p className="text-red-100 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2 opacity-90">
                  <BadgeCheck size={14} className="text-emerald-400" />
                  Système de gestion TOURTRA v2.5
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all relative z-10">
              <X size={32} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-slate-50/30">
            <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                
                {/* --- LEFT COLUMN: PDF UPLOADER (Multiple Files) --- */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                  
                  <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Documents & Marchés</p>
                      
                      {/* UPLOAD ZONE */}
                      <div className="relative aspect-[4/3] w-full">
                         <label className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/10 transition-all cursor-pointer group z-10">
                            
                            {/* STANDARD FILE INPUT (Hidden) */}
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                multiple // Supports multiple files
                                className="hidden" 
                                onChange={handleDocumentChange} 
                            />
                            
                            <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-red-400 transition-colors">
                                <div className="p-4 bg-slate-50 rounded-full group-hover:scale-110 transition-transform">
                                    <Paperclip size={32} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest block">Sélectionner fichiers</span>
                                    <span className="text-[8px] font-bold text-slate-300 mt-1 block">ou glisser-déposer</span>
                                </div>
                            </div>
                         </label>
                      </div>

                      {/* FILE LIST */}
                      <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                         {uploadedFiles.length > 0 ? (
                            uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-left-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
                                            <FileIcon size={16} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[10px] font-bold text-slate-700 truncate">{file.name}</span>
                                            <span className="text-[8px] font-bold text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveFile(index)} 
                                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                         ) : (
                             <div className="text-center py-4 opacity-50">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase italic">Aucun document ajouté</p>
                             </div>
                         )}

                         {/* Existing Documents (If Edit Mode) */}
                         {initialData?.documents && initialData.documents.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Documents existants</p>
                                {initialData.documents.map((doc, idx) => (
                                    <div key={doc.id || idx} className="flex items-center gap-2 mb-2 px-2 py-1 opacity-60">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <a href={doc.document} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-600 truncate hover:text-red-600 hover:underline">
                                            Document #{idx + 1}
                                        </a>
                                    </div>
                                ))}
                            </div>
                         )}
                      </div>
                  </div>
                </div>

                {/* --- RIGHT COLUMN: FORM DATA --- */}
                <div className="lg:col-span-9 space-y-12">
                  
                  {/* Details */}
                  <div className="space-y-8">
                    <SectionHeader title="Détails du Marché & Localisation" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Nom du Projet" icon={<HardHat size={20}/>} value={formData.name} onChange={(v: any) => setFormData({...formData, name: v})} error={getFieldError('name')} required />
                      <InputField label="N° Contrat / Marché" icon={<Hash size={20}/>} value={formData.contract_number} onChange={(v: any) => setFormData({...formData, contract_number: v})} error={getFieldError('contract_number')} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <InputField label="Ville / Localisation" icon={<MapPin size={20}/>} value={formData.location} onChange={(v: any) => setFormData({...formData, location: v})} required />
                      <InputField label="Date Signature" type="date" icon={<Calendar size={20}/>} value={formData.contract_date} onChange={(v: any) => setFormData({...formData, contract_date: v})} />
                      <div className="space-y-2 flex-1 group">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em]">Ma Société</label>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600"><Globe size={20}/></div>
                          <input readOnly className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-red-50/50 border-2 border-red-100 font-bold text-sm text-red-900 cursor-not-allowed shadow-inner" value={userProfile?.company_name || "TOURTRA SARL"} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="space-y-8">
                    <SectionHeader title="Affectations Stratégiques & Temps" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <SelectField 
                        label="Maître d'Ouvrage (Client)" 
                        icon={<Building2 size={20}/>} 
                        value={formData.client} 
                        options={clients.map(c => ({ id: c.id, name: c.company_name }))}
                        onChange={(v: any) => setFormData({...formData, client: v})} 
                        error={getFieldError('client')} required 
                      />
                      <SelectField 
                        label="Département Opérationnel" 
                        icon={isLoadingDeps ? <Loader2 className="animate-spin" size={20}/> : <Globe size={20}/>} 
                        value={formData.department} 
                        options={departments.map(d => ({ id: d.id, name: d.name }))}
                        onChange={(v: any) => setFormData({...formData, department: v})} 
                        error={getFieldError('department')} required 
                      />

                      {/* Responsibles Multi-Select */}
                      <div className="space-y-2 flex-1 group relative">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">
                           Responsables Projet <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 z-10 pointer-events-none">
                             {isLoadingAdmins ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
                           </div>
                           <select 
                             className="w-full pl-16 pr-12 py-5 rounded-[2rem] bg-white border-2 border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-700 shadow-sm"
                             onChange={(e) => handleAddResponsible(e.target.value)}
                             value=""
                           >
                             <option value="" disabled>Ajouter un responsable...</option>
                             {hrAdmins.map(a => (
                               <option key={a.id} value={a.id} disabled={formData.responsible_ids.includes(a.id || 0)}>
                                 {a.first_name} {a.last_name}
                               </option>
                             ))}
                           </select>
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><ChevronDown size={18} /></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 px-2">
                           {formData.responsible_ids.map(id => {
                              const admin = hrAdmins.find(a => a.id === id);
                              if (!admin) return null;
                              return (
                                <div key={id} className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                                    <span className="text-[10px] font-black uppercase">{admin.first_name} {admin.last_name}</span>
                                    <button type="button" onClick={() => handleRemoveResponsible(id)} className="hover:text-red-900 bg-white rounded-full p-0.5"><X size={12} /></button>
                                </div>
                              );
                           })}
                           {formData.responsible_ids.length === 0 && (<span className="text-[10px] text-slate-400 italic pl-4">Aucun responsable sélectionné</span>)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Date de Début Travaux" type="date" icon={<Calendar size={20}/>} value={formData.start_date} onChange={(v: any) => setFormData({...formData, start_date: v})} required />
                      <InputField label="Date de Fin Estimée" type="date" icon={<Calendar size={20}/>} value={formData.end_date} onChange={(v: any) => setFormData({...formData, end_date: v})} />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] flex items-center gap-2 text-nowrap">
                        <FileText size={14} className="text-red-600" /> Objet technique & Description du Marché
                      </label>
                      <textarea rows={3} className="w-full px-8 py-6 rounded-[2.5rem] bg-white border-2 border-slate-100 focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 outline-none font-bold text-sm transition-all resize-none shadow-sm"
                        value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Précisez la nature des travaux..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-white px-12 py-10 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="hidden md:flex items-center gap-3 text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Architecture TOURTRA certifiée</p>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto">
                <button type="button" onClick={onClose} className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 transition-colors">Abandonner</button>
                <button type="submit" disabled={isCreating || isUpdating || success}
                  className={`min-w-[340px] py-6 px-10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${success ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-red-500/40 hover:shadow-red-500/60'} disabled:opacity-50`}>
                  {isCreating || isUpdating ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : null}
                  {success ? 'Configuration Validée' : initialData ? 'Mettre à jour le Dossier' : 'Ouvrir le Chantier'}
                </button>
              </div>
            </div>
          </form> 
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- SUB-COMPONENTS ---
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-6"><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h3><div className="h-[2px] w-full bg-gradient-to-r from-red-100 to-transparent rounded-full" /></div>
);
const SelectField = ({ label, icon, value, onChange, options, required, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">{label} {required && <span className="text-red-600">*</span>}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 z-10 pointer-events-none">{icon}</div>
      <select required={required} className={`w-full pl-16 pr-12 py-5 rounded-[2rem] bg-white border-2 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-700 shadow-sm ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5'}`} value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>Sélectionner...</option>
        {options.map((opt: any) => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><ChevronDown size={18} /></div>
      {error && <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-6 leading-none">{error}</p>}
    </div>
  </div>
);
const InputField = ({ label, icon, value, onChange, type = "text", required = false, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">{label} {required && <span className="text-red-600">*</span>}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors">{icon}</div>
      <input type={type} required={required} className={`w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border-2 outline-none font-bold text-sm transition-all text-slate-700 shadow-sm ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5'}`} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-6 leading-none">{error}</p>}
    </div>
  </div>
);

export default ChantierModal;