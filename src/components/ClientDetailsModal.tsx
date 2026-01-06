import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Edit3, Building2, Mail, Phone, MapPin, 
  Fingerprint, Briefcase, Globe, Hash, ShieldCheck, 
  Calendar, ExternalLink, User, FileText, Download 
} from 'lucide-react';
import { type Client } from '../store/slices/clientSlice';
import { API_ROOT } from '../api/client'; // Import for document URLs

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
}

export const ClientDetailsModal = ({ isOpen, onClose, client, onEdit }: Props) => {
  if (!client) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
          {/* Overlay avec flou artistique */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Conteneur Principal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
          >
            
            {/* SECTION GAUCHE : Header Identitaire (Rouge Vibrant) */}
            <div className="w-full lg:w-80 bg-gradient-to-br from-red-600 to-red-800 p-10 flex flex-col items-center text-center text-white shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/20">
                   {client.logo ? (
                      <img src={client.logo.startsWith('http') ? client.logo : `${API_ROOT}${client.logo}`} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                      <img src="/pic2.jpeg" alt="Default Logo" className="w-full h-full object-cover opacity-50" />
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-red-700">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-black uppercase tracking-tighter leading-none">
                {client.company_name}
              </h2>
              <p className="mt-2 text-red-100 text-[10px] font-bold uppercase tracking-widest opacity-80">
                Identité Certifiée TOURTRA
              </p>

              <div className="mt-auto pt-10 w-full space-y-3">
                <button 
                  onClick={() => onEdit(client)}
                  className="w-full bg-white text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                >
                  <Edit3 size={16} /> Modifier Fiche
                </button>
                <button 
                  onClick={onClose}
                  className="w-full bg-red-900/30 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-900/50 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* SECTION DROITE : Contenu Data (Clean Light) */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-slate-50/30">
              
              {/* Grid d'informations */}
              <div className="space-y-10">
                
                {/* 1. Bloc Administratif */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><Fingerprint size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Informations Légales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard label="Identifiant ICE" value={client.ice} icon={<Hash size={14}/>} highlight />
                    <DataCard label="Nom de l'entreprise" value={client.company_name} icon={<Building2 size={14}/>} />
                    <DataCard label="Identifiant Fiscal (IF)" value={client.tax_id} />
                    <DataCard label="Registre de Commerce (RC)" value={client.rc} />
                  </div>
                </section>

                {/* 2. Bloc Contact */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><User size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Contact & Liaison</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-500">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Nom du contact</label>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                         {client.contact_name}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <ContactLink icon={<Mail size={16}/>} label="Email" value={client.email} />
                        <ContactLink icon={<Phone size={16}/>} label="Téléphone" value={client.phone} />
                    </div>
                  </div>
                </section>

                {/* 3. Adresse & Localisation */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><MapPin size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Localisation</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Globe className="text-slate-300" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                          {client.address || "Aucune adresse enregistrée"}
                        </p>
                        <button className="mt-3 text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline">
                           Voir sur Google Maps <ExternalLink size={10} />
                        </button>
                    </div>
                  </div>
                </section>

                {/* 4. Documents Attachés (NEW SECTION) */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Documents Attachés</h3>
                  </div>

                  {/* @ts-ignore - Assuming client.documents exists based on request */}
                  {client.documents && client.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* @ts-ignore */}
                          {client.documents.map((doc: any, index: number) => {
                              // Build URL
                              const docUrl = doc.document.startsWith('http') ? doc.document : `${API_ROOT}${doc.document}`;
                              const fileName = doc.document.split('/').pop() || `Document #${index + 1}`;
                              
                              return (
                                  <a 
                                    key={doc.id || index}
                                    href={docUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                                  >
                                      <div className="flex items-center gap-4 overflow-hidden">
                                          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                              <FileText size={24} />
                                          </div>
                                          <div className="overflow-hidden">
                                              <p className="font-bold text-slate-800 text-sm truncate pr-2">{fileName}</p>
                                              <p className="text-[10px] text-slate-400 font-medium">Format PDF • Télécharger</p>
                                          </div>
                                      </div>
                                      <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                          <Download size={18} />
                                      </div>
                                  </a>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                          <p className="text-xs font-bold text-slate-400">Aucun document attaché à ce client.</p>
                      </div>
                  )}
                </section>

              </div>

              {/* Footer décoratif */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Dossier Client ID: #{client.id}</p>
                <img src="/pic2.jpeg" alt="Logo" className="h-6 grayscale" />
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- SOUS-COMPOSANTS DE STYLE ---

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

const ContactLink = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="text-indigo-500">{icon}</div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate">{value || "Non renseigné"}</p>
    </div>
  </div>
);