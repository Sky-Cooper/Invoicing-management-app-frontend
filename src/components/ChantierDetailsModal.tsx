import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  X, Edit3, Building2, MapPin, 
  Briefcase, Hash, Calendar, FileText, 
  Download, UserCheck, Phone, Mail, HardHat
} from 'lucide-react';

import { type Chantier } from '../store/slices/chantierSlice';
import type { RootState } from '../store/store';
import { API_ROOT } from '../api/client'; // Import API_ROOT for images

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chantier: Chantier | null;
  onEdit: (chantier: Chantier) => void;
}

export const ChantierDetailsModal = ({ isOpen, onClose, chantier, onEdit }: Props) => {
  // Access Clients from Redux to look up the Client Name by ID
  const { items: clients } = useSelector((state: RootState) => state.clients);

  if (!chantier) return null;

  // Helper to get Client Name
  const clientName = clients.find(c => c.id === chantier.client)?.company_name || `Client ID #${chantier.client}`;

  // Helper for Image URL
  const imageUrl = chantier.image 
    ? (chantier.image.startsWith('http') ? chantier.image : `${API_ROOT}${chantier.image}`)
    : null;

  // Helper for Document URL
  const docUrl = chantier.document 
    ? (chantier.document.startsWith('http') ? chantier.document : `${API_ROOT}${chantier.document}`)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Main Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
          >
            
            {/* LEFT SECTION: Visual Identity */}
            <div className="w-full lg:w-96 bg-gradient-to-br from-slate-900 to-slate-800 p-10 flex flex-col items-center text-center text-white shrink-0 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              
              <div className="relative group z-10">
                <div className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/10">
                   {imageUrl ? (
                       <img src={imageUrl} alt="Project" className="w-full h-full object-cover" />
                   ) : (
                       <HardHat size={64} className="text-white/50" />
                   )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-red-600 p-3 rounded-2xl shadow-lg border-4 border-slate-800">
                  <Briefcase size={24} className="text-white" />
                </div>
              </div>

              <h2 className="mt-8 text-2xl font-black uppercase tracking-tighter leading-tight">
                {chantier.name}
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
                 <Hash size={12} className="text-red-400" />
                 <span className="text-[11px] font-bold tracking-widest text-red-100">{chantier.contract_number}</span>
              </div>

              <div className="mt-auto pt-10 w-full space-y-3 z-10">
                <button 
                  onClick={() => onEdit(chantier)}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all shadow-xl active:scale-95"
                >
                  <Edit3 size={16} /> Modifier Projet
                </button>
                <button 
                  onClick={onClose}
                  className="w-full bg-white/5 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* RIGHT SECTION: Data Content */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-slate-50/50">
              
              <div className="space-y-10">
                
                {/* 1. Project Overview */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><FileText size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Détails du Marché</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard label="Client (Maître d'Ouvrage)" value={clientName} icon={<Building2 size={14}/>} highlight />
                    <DataCard label="Localisation" value={chantier.location} icon={<MapPin size={14}/>} />
                    <DataCard label="Date Signature" value={chantier.contract_date} icon={<Calendar size={14}/>} />
                    <DataCard 
                        label="Période Travaux" 
                        value={`${chantier.start_date} ➝ ${chantier.end_date || 'En cours'}`} 
                        icon={<Calendar size={14}/>} 
                    />
                  </div>
                  
                  {/* Description Box */}
                  <div className="mt-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description Technique</p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {chantier.description || "Aucune description technique disponible pour ce projet."}
                      </p>
                  </div>
                </section>

                {/* 2. Responsibles List */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><UserCheck size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Équipe Responsable</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chantier.responsible && chantier.responsible.length > 0 ? (
                        chantier.responsible.map((resp) => (
                            <div key={resp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                        {resp.first_name[0]}{resp.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{resp.first_name} {resp.last_name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{resp.role?.replace('_', ' ') || 'Manager'}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-50 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Mail size={12} className="text-slate-300"/> {resp.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Phone size={12} className="text-slate-300"/> {resp.phone_number || "N/A"}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full p-6 bg-slate-100 rounded-2xl text-center text-slate-400 text-sm font-medium italic">
                            Aucun responsable assigné pour le moment.
                        </div>
                    )}
                  </div>
                </section>

                {/* 3. Documents */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><FileText size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Documents Attachés</h3>
                  </div>
                  
                  {docUrl ? (
                      <a 
                        href={docUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                      >
                          <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                  <FileText size={24} />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-800 text-sm">Contrat / Marché Signé</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Format PDF • Document Officiel</p>
                              </div>
                          </div>
                          <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                              <Download size={18} />
                          </div>
                      </a>
                  ) : (
                      <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                          <p className="text-xs font-bold text-slate-400">Aucun document PDF attaché.</p>
                      </div>
                  )}
                </section>

              </div>

              {/* Decorative Footer */}
              <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center opacity-40">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Projet REF: #{chantier.id}</p>
                <img src="/pic2.jpeg" alt="Logo" className="h-6 grayscale" />
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- STYLED COMPONENTS ---

const DataCard = ({ label, value, icon, highlight }: any) => (
  <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100 shadow-sm'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className={highlight ? 'text-red-500' : 'text-slate-400'}>{icon}</span>}
      <label className={`text-[10px] font-black uppercase tracking-wider ${highlight ? 'text-red-600' : 'text-slate-400'}`}>
        {label}
      </label>
    </div>
    <p className={`text-sm font-bold truncate ${highlight ? 'text-red-700 font-mono text-base' : 'text-slate-800'}`}>
      {value || "---"}
    </p>
  </div>
);