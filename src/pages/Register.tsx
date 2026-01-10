import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/hooks/useAuth';

// Composant Input isolé
const InputGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = "text", 
  placeholder = "", 
  fullWidth = false, 
  required = true,
  maxLength
}: any) => (
  <div className={fullWidth ? "col-span-2" : "col-span-2 md:col-span-1"}>
    <label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={`block w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-gray-400 shadow-sm transition-all outline-none
        ${error 
          ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500' 
          : 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'}`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
    )}
  </div>
);

export const Register = () => {
  const { registerCompany, isLoading, error: authError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Étape 1 : Perso
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    // Initialiser avec le préfixe
    phone_number: "+212", 
    preferred_language: "fr",
    // Étape 2 : Entreprise
    company_name: "",
    company_address: "",
    // Initialiser avec le préfixe
    company_phone: "+212",
    company_email: "",
    website: "",
    // Étape 3 : Légal
    ice: "",
    rc: "",
    patent: "",
    bank_name: "",
    bank_account_number: "",
    bank_rib: ""
  });

  // --- GESTIONNAIRE GÉNÉRAL ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: "" }));
  };

  // --- GESTIONNAIRE SPÉCIFIQUE POUR TÉLÉPHONE (+212 bloqué + 9 chiffres max) ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 1. Ne garder que les chiffres (et le + au début si présent, mais on va le forcer)
    let rawValue = value.replace(/[^0-9]/g, "");

    // 2. Si l'utilisateur efface tout, on remet le préfixe de base 212
    if (!rawValue.startsWith("212")) {
      rawValue = "212";
    }

    // 3. Limiter à 12 caractères (212 + 9 chiffres)
    if (rawValue.length > 12) {
      rawValue = rawValue.slice(0, 12);
    }

    // 4. Mettre à jour avec le + devant
    const formattedPhone = "+" + rawValue;

    setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    
    // Nettoyer l'erreur si valide
    if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // --- 1. VALIDATION FRONTEND ---
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    const phoneRegex = /^\+212[0-9]{9}$/; // Exactement +212 suivi de 9 chiffres

    if (step === 1) {
      if (!formData.first_name) errors.first_name = "Le prénom est requis";
      if (!formData.last_name) errors.last_name = "Le nom est requis";
      if (!formData.email) errors.email = "L'email est requis";
      
      // Validation stricte du téléphone perso
      if (!formData.phone_number || formData.phone_number === "+212") {
        errors.phone_number = "Le téléphone est requis";
      } else if (!phoneRegex.test(formData.phone_number)) {
        errors.phone_number = "Numéro invalide (+212 + 9 chiffres)";
      }

      if (!formData.password) errors.password = "Le mot de passe est requis";
      if (formData.password.length < 6) errors.password = "6 caractères minimum";
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Les mots de passe ne correspondent pas";
      }
    }

    if (step === 2) {
      if (!formData.company_name) errors.company_name = "Le nom de la société est requis";
      if (!formData.company_address) errors.company_address = "L'adresse est requise";
      if (!formData.company_email) errors.company_email = "L'email pro est requis";
      
      // Validation stricte du téléphone pro
      if (!formData.company_phone || formData.company_phone === "+212") {
        errors.company_phone = "Le téléphone pro est requis";
      } else if (!phoneRegex.test(formData.company_phone)) {
        errors.company_phone = "Numéro invalide (+212 + 9 chiffres)";
      }
    }

    if (step === 3) {
      if (!formData.ice) errors.ice = "L'ICE est requis";
      if (!formData.rc) errors.rc = "Le RC est requis";
      if (!formData.bank_name) errors.bank_name = "La banque est requise";
      if (!formData.bank_account_number) errors.bank_account_number = "Le numéro de compte est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // --- 2. ENVOI AU BACKEND ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isStep3Valid = validateStep(3);
    const passwordsMatch = formData.password === formData.confirm_password;

    if (isStep3Valid && passwordsMatch) {
      const { confirm_password, ...dataToSend } = formData;
      
      if (!dataToSend.website) delete (dataToSend as any).website;
      if (!dataToSend.bank_rib) delete (dataToSend as any).bank_rib;

      console.log("Données envoyées:", dataToSend);
      registerCompany(dataToSend);
    } else if (!passwordsMatch) {
      alert("Erreur : Les mots de passe ne correspondent pas.");
      setCurrentStep(1);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      
      {/* --- COLONNE GAUCHE (Image) --- */}
      <div 
        className="sticky top-0 hidden h-screen w-1/2 flex-col justify-end p-16 text-white lg:flex"
        style={{
          backgroundImage: `url('/pic1.jpg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="relative z-10 mb-10">
          <h3 className="mb-4 text-2xl font-bold uppercase tracking-widest text-red-500 drop-shadow-sm">TOURTRA</h3>
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight drop-shadow-lg">Construisez votre empire avec nous.</h1>
          <p className="mt-6 max-w-lg text-lg text-gray-200">Rejoignez la plateforme conçue pour les entreprises modernes.</p>
        </div>
        <p className="relative z-10 text-sm text-gray-400">© 2026 TOURTRA Inc.</p>
      </div>

      {/* --- COLONNE DROITE (Formulaire) --- */}
      <div className="flex w-full flex-col items-center bg-white px-6 py-12 lg:w-1/2 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Créer un compte</h2>
            <p className="mt-2 text-slate-500">Remplissez le formulaire pour enregistrer votre société.</p>
          </div>

          {/* Indicateur d'étapes */}
          <div className="mb-8 flex items-center justify-between relative">
             <div className="absolute left-0 top-1/2 h-0.5 w-full -z-10 bg-gray-200"></div>
             <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${currentStep >= 1 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>1</div>
             <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${currentStep >= 2 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>2</div>
             <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${currentStep >= 3 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>3</div>
          </div>

          {authError && (
            <div className="mb-6 rounded-lg bg-red-50 border-l-4 border-red-600 p-4 text-sm text-red-700">
              <strong>Erreur :</strong> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ÉTAPE 1 */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-2 gap-5">
                <div className="col-span-2 pb-2 border-b"><h3 className="text-lg font-bold text-slate-800">Informations Personnelles</h3></div>
                
                <InputGroup label="Prénom" name="first_name" value={formData.first_name} onChange={handleChange} error={validationErrors.first_name} placeholder="Jean" />
                <InputGroup label="Nom" name="last_name" value={formData.last_name} onChange={handleChange} error={validationErrors.last_name} placeholder="Dupont" />
                <InputGroup label="Email Personnel" name="email" value={formData.email} onChange={handleChange} error={validationErrors.email} type="email" fullWidth />
                
                {/* --- TÉLÉPHONE PERSO AVEC LOGIQUE SPÉCIALE --- */}
                <InputGroup 
                    label="Numéro de téléphone" 
                    name="phone_number" 
                    value={formData.phone_number} 
                    onChange={handlePhoneChange} // Utilisation du handler spécifique
                    error={validationErrors.phone_number} 
                    fullWidth 
                    maxLength={13} // +212 + 9 chiffres
                />
                
                <InputGroup label="Mot de passe" name="password" value={formData.password} onChange={handleChange} error={validationErrors.password} type="password" />
                <InputGroup label="Confirmer mot de passe" name="confirm_password" value={formData.confirm_password} onChange={handleChange} error={validationErrors.confirm_password} type="password" />
                
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Langue préférée</label>
                  <select name="preferred_language" value={formData.preferred_language} onChange={handleChange} className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-2 gap-5">
                <div className="col-span-2 pb-2 border-b"><h3 className="text-lg font-bold text-slate-800">Détails de l'Entreprise</h3></div>
                <InputGroup label="Nom de la Société" name="company_name" value={formData.company_name} onChange={handleChange} error={validationErrors.company_name} fullWidth />
                <InputGroup label="Adresse Siège" name="company_address" value={formData.company_address} onChange={handleChange} error={validationErrors.company_address} fullWidth />
                
                {/* --- TÉLÉPHONE PRO AVEC LOGIQUE SPÉCIALE --- */}
                <InputGroup 
                    label="Téléphone Société" 
                    name="company_phone" 
                    value={formData.company_phone} 
                    onChange={handlePhoneChange} // Utilisation du handler spécifique
                    error={validationErrors.company_phone} 
                    maxLength={13}
                />

                <InputGroup label="Email Société" name="company_email" value={formData.company_email} onChange={handleChange} error={validationErrors.company_email} type="email" />
                <InputGroup label="Site Web" name="website" value={formData.website} onChange={handleChange} placeholder="Optionnel" required={false} fullWidth />
              </div>
            )}

            {/* ÉTAPE 3 */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-2 gap-5">
                 <div className="col-span-2 pb-2 border-b"><h3 className="text-lg font-bold text-slate-800">Informations Légales & Bancaires</h3></div>
                <div className="col-span-2"><h4 className="text-sm font-bold uppercase text-gray-500">Légal</h4></div>
                <InputGroup label="Numéro ICE" name="ice" value={formData.ice} onChange={handleChange} error={validationErrors.ice} />
                <InputGroup label="Numéro RC" name="rc" value={formData.rc} onChange={handleChange} error={validationErrors.rc} />
                <InputGroup label="Numéro Patente" name="patent" value={formData.patent} onChange={handleChange} fullWidth required={false} />
                <div className="col-span-2 mt-4"><h4 className="text-sm font-bold uppercase text-gray-500">Banque</h4></div>
                <InputGroup label="Nom de la Banque" name="bank_name" value={formData.bank_name} onChange={handleChange} error={validationErrors.bank_name} />
                <InputGroup label="Numéro de Compte" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} error={validationErrors.bank_account_number} />
                <InputGroup label="RIB (24 chiffres)" name="bank_rib" value={formData.bank_rib} onChange={handleChange} fullWidth required={false} />
              </div>
            )}

            {/* BOUTONS NAVIGATION */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="w-1/3 rounded-xl border border-gray-300 bg-white py-4 text-base font-bold text-gray-700 transition-all hover:bg-gray-50">
                  Retour
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-xl bg-gradient-to-br from-red-600 to-red-800 py-4 text-base font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-[1.01]"
                >
                  Suivant
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-br from-red-600 to-red-800 py-4 text-base font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Création en cours...' : 'Confirmer l\'inscription'}
                </button>
              )}
            </div>

            {currentStep === 1 && (
              <p className="mt-6 text-center text-slate-600">
                Vous avez déjà un compte ? <Link to="/login" className="font-bold text-red-700 hover:text-red-800 hover:underline">Connectez-vous ici</Link>
              </p>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};