import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  X, Loader2, Building2, User, Hash, Mail, 
  Phone, MapPin, ShieldCheck, Fingerprint, Globe, CheckCircle2, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Redux
import { createClient, updateClient, resetClientStatus, type Client } from '../store/slices/clientSlice';
import type { RootState } from '../store/store';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Client | null;
}

const ClientModal = ({ isOpen, onClose, initialData }: ClientModalProps) => {
  const dispatch = useAppDispatch();
  
  const { data: userProfile } = useAppSelector((state: RootState) => state.profile);
  const { isCreating, isUpdating, success, error } = useAppSelector((state: RootState) => state.clients);

  const [formData, setFormData] = useState<Partial<Client>>({
    company_name: '',
    contact_name: '',
    ice: '',
    rc: '',
    tax_id: '',
    phone: '+212',
    email: '',
    address: '',
  });

  // --- Initialisation ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ 
          company_name: '', contact_name: '', ice: '', rc: '', tax_id: '', 
          phone: '+212', email: '', address: '',
        });
      }
    }
  }, [initialData, isOpen]);

  // --- Succès et Fermeture ---
  useEffect(() => {
    if (success && isOpen) {
      const timer = setTimeout(() => {
        onClose();
        dispatch(resetClientStatus());
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose, isOpen]);

  // --- Logique Téléphone (+212 + 9 chiffres) ---
  const handlePhoneChange = (value: string) => {
    // On garde le +212 comme base immuable
    if (!value.startsWith('+212')) {
      value = '+212';
    }
    // On extrait uniquement les chiffres après le préfixe
    const digitsOnly = value.slice(4).replace(/\D/g, '');
    // On limite à 9 chiffres maximum
    const limitedDigits = digitsOnly.slice(0, 9);
    
    setFormData({ ...formData, phone: '+212' + limitedDigits });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation finale avant envoi
    if (formData.phone && formData.phone.length !== 13) {
        alert("Le numéro de téléphone doit contenir exactement 9 chiffres après +212");
        return;
    }
    
    const dataToSubmit = {
      company_name: formData.company_name,
      contact_name: formData.contact_name,
      ice: formData.ice,
      rc: formData.rc,
      tax_id: formData.tax_id,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    };

    if (initialData?.id) {
      dispatch(updateClient({ id: initialData.id, data: dataToSubmit }));
    } else {
      dispatch(createClient(dataToSubmit as Client));
    }
  };

  if (!isOpen) return null;

  const getFieldError = (fieldName: string) => {
    if (error && typeof error === 'object' && error[fieldName]) {
      return error[fieldName][0];
    }
    return null;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden shadow-[0_30px_70px_-15px_rgba(220,38,38,0.25)] border border-white"
        >
          {/* HEADER VIBRANT ROUGE TOURTRA */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-10 py-10 flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/30 shadow-inner">
                <Fingerprint className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-tighter text-3xl leading-none">
                  {initialData ? 'Mise à jour Identité' : 'Certification Entité'}
                </h2>
                <p className="text-red-100 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2 opacity-90">
                  <BadgeCheck size={14} className="text-emerald-400" />
                  Système de gestion TOURTRA v2.5
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all relative z-10">
              <X size={32} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-14 bg-slate-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              {/* VISUEL GAUCHE (Logo & Branding) */}
              <div className="lg:col-span-3 flex flex-col items-center gap-8 text-center">
                <div className="w-full aspect-square bg-white rounded-[2.5rem] border-2 border-slate-100 flex flex-col items-center justify-center text-slate-200 gap-4 shadow-sm group hover:border-red-200 hover:bg-red-50/30 transition-all overflow-hidden relative">
                  <img src="/pic2.jpeg" alt="Logo" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-30 transition-opacity" />
                  <Building2 size={72} className="group-hover:text-red-400 transition-colors drop-shadow-sm relative z-10" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-500 relative z-10">PROFIL CLIENT</span>
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-200 to-transparent opacity-30" />
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Identité Numérique</p>
              </div>

              {/* FORMULAIRE DROITE */}
              <div className="lg:col-span-9 space-y-12">
                
                {/* Section 1 : Information de base */}
                <div className="space-y-8">
                  <SectionHeader title="Détails de l'Entité & Contact" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Nom de l'entreprise" icon={<Building2 size={20}/>} value={formData.company_name} 
                      onChange={(v: any) => setFormData({...formData, company_name: v})} error={getFieldError('company_name')} required />
                    
                    <InputField label="Nom du contact" icon={<User size={20}/>} value={formData.contact_name} 
                      onChange={(v: any) => setFormData({...formData, contact_name: v})} error={getFieldError('contact_name')} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Email Professionnel" type="email" icon={<Mail size={20}/>} value={formData.email} 
                      onChange={(v: any) => setFormData({...formData, email: v})} error={getFieldError('email')} />
                    
                    {/* CHAMP TÉLÉPHONE VALIDÉ */}
                    <div className="space-y-2 flex-1 group relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">
                        Ligne Téléphonique (9 chiffres) <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors">
                          <Phone size={20}/>
                        </div>
                        <input 
                          type="text" 
                          required
                          placeholder="+212 6XXXXXXXX"
                          className={`w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border-2 outline-none font-bold text-sm transition-all text-slate-700 shadow-sm
                            ${formData.phone?.length === 13 ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5'}`}
                          value={formData.phone} 
                          onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {/* Indicateur visuel de validité */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${formData.phone!.length > (i + 4) ? 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 : Identification légale */}
                <div className="space-y-8">
                  <SectionHeader title="Identification Fiscale & Liaison" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Identifiant I.C.E" icon={<Hash size={20}/>} value={formData.ice} 
                      onChange={(v: any) => setFormData({...formData, ice: v})} error={getFieldError('ice')} />
                    
                    <InputField label="Reg. Commerce (RC)" icon={<ShieldCheck size={20}/>} value={formData.rc} 
                      onChange={(v: any) => setFormData({...formData, rc: v})} error={getFieldError('rc')} />

                    <InputField label="Id. Fiscal (IF)" icon={<Hash size={20}/>} value={formData.tax_id} 
                      onChange={(v: any) => setFormData({...formData, tax_id: v})} error={getFieldError('tax_id')} />
                  </div>

                  {/* Encart Ma Société (TOURTRA Auto-link) */}
                  <div className="bg-red-50/40 border-2 border-red-100/60 rounded-[2rem] p-6 flex items-center justify-between group hover:border-red-200 transition-all shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm transition-transform group-hover:scale-105">
                            <Globe size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Ma Société (Auto-link)</p>
                            <p className="text-base font-black text-slate-800 tracking-tight">{userProfile?.company_name || "TOURTRA SARL"}</p>
                        </div>
                    </div>
                    <CheckCircle2 className="text-emerald-500 opacity-60" size={24} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] flex items-center gap-2">
                      <MapPin size={14} className="text-red-600" /> Adresse de Siège Social
                    </label>
                    <textarea 
                      rows={3} 
                      className="w-full px-8 py-6 rounded-[2.5rem] bg-white border-2 border-slate-100 focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 outline-none font-bold text-sm transition-all resize-none shadow-sm"
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Adresse complète du client..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* FOOTER : ACTIONS */}
          <div className="bg-white px-12 py-10 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="hidden md:flex items-center gap-3 text-slate-400">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Flux TOURTRA certifié</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
              <button type="button" onClick={onClose} className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 transition-colors">
                Abandonner
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || success}
                className={`min-w-[340px] py-6 px-10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl hover:-translate-y-1 active:scale-95
                  ${success ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-red-500/40 hover:shadow-red-500/60'}
                  disabled:opacity-50`}
              >
                {isCreating || isUpdating ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : null}
                {success ? 'Identité Certifiée' : initialData ? 'Valider les modifications' : 'Enregistrer & Certifier'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- COMPOSANTS DE STRUCTURE ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-6">
    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h3>
    <div className="h-[2px] w-full bg-gradient-to-r from-red-100 to-transparent rounded-full" />
  </div>
);

const InputField = ({ label, icon, value, onChange, type = "text", required = false, error }: any) => (
  <div className="space-y-2 flex-1 group relative">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-6 tracking-[0.2em] group-focus-within:text-red-600 transition-colors">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors">{icon}</div>
      <input 
        type={type} 
        required={required}
        className={`w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border-2 outline-none font-bold text-sm transition-all text-slate-700 shadow-sm
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5'}`}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-2 text-[9px] font-black text-red-500 uppercase italic ml-6 leading-none">{error}</p>}
    </div>
  </div>
);

export default ClientModal;