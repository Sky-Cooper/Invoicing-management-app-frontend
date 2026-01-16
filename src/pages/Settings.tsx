import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfile, resetUpdateSuccess } from '../store/slices/profileSlice';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Globe,
  Calendar,
  ChevronDown 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';

export const Settings = () => {
  const dispatch = useAppDispatch();
  const { data: user, isLoading, error, updateSuccess } = useAppSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    // department removed
    preferred_language: 'fr',
  });

  // FETCH PROFILE ON MOUNT
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        preferred_language: user.preferred_language || 'fr',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    dispatch(updateProfile(formData));
    
    setTimeout(() => {
      dispatch(resetUpdateSuccess());
    }, 3000);
  };

  if (isLoading && !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mon Profil</h2>
        <p className="text-slate-500">Gérez vos informations personnelles et professionnelles.</p>
      </div>

      {/* Feedback Utilisateur */}
      {updateSuccess && (
        <div className="flex items-center rounded-lg bg-green-50 p-4 text-green-700 border border-green-200 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="mr-2 h-5 w-5" />
          Profil mis à jour avec succès !
        </div>
      )}
      {error && (
        <div className="flex items-center rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          <AlertCircle className="mr-2 h-5 w-5" />
          {typeof error === 'string' ? error : 'Une erreur est survenue'}
        </div>
      )}

      {/* Carte Principale */}
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
        
        {/* En-tête Profil (Avatar & Infos) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-6 border-b border-slate-100 pb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600 shadow-inner">
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {user?.first_name} {user?.last_name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 border border-red-100">
                {user?.role_display || 'Utilisateur'}
              </span>
              
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                <Building className="mr-1 h-3 w-3" /> {user?.company_name || 'Entreprise non définie'}
              </span>

              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                <Calendar className="mr-1 h-3 w-3" /> Membre depuis {user?.created_at ? new Date(user.created_at).getFullYear() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* --- Formulaire Grid --- */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Prénom */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 pl-10 py-3 text-slate-900 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 pl-10 py-3 text-slate-900 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 pl-10 py-3 text-slate-900 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+212..."
                className="block w-full rounded-xl border-slate-200 pl-10 py-3 text-slate-900 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Langue */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Langue Préférée</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 z-10" />
              <select
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 bg-white pl-10 pr-10 py-3 text-slate-900 focus:border-red-500 focus:ring-red-500 appearance-none cursor-pointer"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
              <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* Entreprise (Lecture seule) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Mon Entreprise</label>
            <div className="relative">
              <Building className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={user?.company_name || ''}
                disabled
                className="block w-full cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 pl-10 py-3 text-slate-500 font-medium"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 italic">Contactez votre administrateur pour modifier le nom de l'entreprise.</p>
          </div>

        </div>

        {/* Bouton Sauvegarder */}
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center justify-center rounded-xl bg-linear-to-r from-red-500 to-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] hover:shadow-red-500/40 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center">Sauvegarde...</span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};