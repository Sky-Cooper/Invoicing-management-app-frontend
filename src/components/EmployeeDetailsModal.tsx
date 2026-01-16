import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, User, Phone, ShieldCheck, 
  Briefcase, Calendar, Hash, Fingerprint, Award
} from 'lucide-react';
import type { Employee } from '../store/slices/employeeSlice';

interface ViewProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
}

export const EmployeeDetailsModal = ({ isOpen, onClose, employee, onEdit }: ViewProps) => {
  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-10">
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
            <div className="w-full lg:w-80 bg-linear-to-br from-red-600 to-red-800 p-10 flex flex-col items-center text-center text-white shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/20 text-red-600">
                   {/* Fallback avatar if no image */}
                   <User size={64} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-red-700">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-black uppercase tracking-tighter leading-none">
                {employee.user.first_name} <br/> {employee.user.last_name}
              </h2>
              <p className="mt-2 text-red-100 text-[10px] font-bold uppercase tracking-widest opacity-80">
                {employee.job_title}
              </p>

              <div className="mt-auto pt-10 w-full space-y-3">
                <button 
                  onClick={() => onEdit(employee)}
                  className="w-full bg-white text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                >
                  <Edit3 size={16} /> Modifier Dossier
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
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">État Civil & Contrat</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard label="Numéro CIN" value={employee.cin} icon={<Hash size={14}/>} highlight />
                    <DataCard label="Date d'embauche" value={employee.hire_date} icon={<Calendar size={14}/>} />
                    <DataCard label="Poste Occupé" value={employee.job_title} icon={<Briefcase size={14}/>} />
                    <DataCard label="Statut" value="Actif" icon={<Award size={14}/>} />
                  </div>
                </section>

                {/* 2. Bloc Contact */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><User size={20}/></div>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Coordonnées</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-500">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Email Professionnel</label>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate">
                         {employee.user.email}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <ContactLink icon={<Phone size={16}/>} label="Mobile" value={employee.user.phone_number} />
                    </div>
                  </div>
                </section>

              </div>

              {/* Footer décoratif */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Matricule RH: #{employee.id}</p>
                <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" /> {/* Placeholder logo */}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- SOUS-COMPOSANTS DE STYLE (Identiques au ClientModal) ---

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