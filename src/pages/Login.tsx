import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../store/hooks/useAuth';

// --- Schéma de validation ---
const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const { loginUser, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginUser(data);
  };

  return (
    // Conteneur principal pleine hauteur
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      
      {/* --- COLONNE GAUCHE : Image --- */}
      <div 
        className="relative hidden w-1/2 flex-col justify-end p-16 text-white lg:flex"
        style={{
          backgroundImage: `url('/pic1.jpg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay dégradé pour un look plus moderne et une meilleure lisibilité du texte du bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Contenu Texte sur l'image */}
        <div className="relative z-10 mb-10">
          <h3 className="mb-4 text-xl font-bold uppercase tracking-wider text-red-600 drop-shadow-sm">TOURTRA</h3>
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight drop-shadow-lg">
            Redéfinissez votre expérience numérique.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-gray-200">
            Accédez à une plateforme sécurisée, rapide et conçue pour vous.
          </p>
        </div>
        <p className="relative z-10 text-sm text-gray-400">© 2026 TourTra - Tous droits reservés</p>
      </div>

      {/* --- COLONNE DROITE : Le Formulaire --- */}
      <div className="flex w-full items-center justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-24">
        
        <div className="w-full max-w-[440px] mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Bon retour.</h2>
            <p className="mt-3 text-lg text-slate-500">
              Connectez-vous pour continuer.
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 flex items-center rounded-lg bg-red-50/80 p-4 text-sm text-red-700 border-l-4 border-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 flex-shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Adresse email</label>
              <input
                id="email"
                {...register('email')}
                type="email"
                placeholder="vous@exemple.com"
                // Design input plus moderne : fond blanc, bordure subtile, ombre portée légère
                className={`block w-full rounded-xl border-gray-300 bg-white px-5 py-4 text-slate-900 placeholder-gray-400 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all ${errors.email ? 'border-red-300 ring-red-200' : ''}`}
              />
              {errors.email && <p className="mt-2 text-sm font-medium text-red-600">{errors.email.message}</p>}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <a href="#" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Oublié ?</a>
              </div>
              <input
                id="password"
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`block w-full rounded-xl border-gray-300 bg-white px-5 py-4 text-slate-900 placeholder-gray-400 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all ${errors.password ? 'border-red-300 ring-red-200' : ''}`}
              />
              {errors.password && <p className="mt-2 text-sm font-medium text-red-600">{errors.password.message}</p>}
            </div>

            {/* Bouton de soumission Premium */}
            <button
              type="submit"
              disabled={isLoading}
              // Dégradé de rouge et ombre portée colorée
              className="group relative mt-8 w-full overflow-hidden rounded-xl bg-gradient-to-br from-red-600 to-red-800 py-4 text-base font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {/* Petit effet de brillance au survol */}
              <div className="absolute inset-0 h-full w-full bg-white/0 transition-all group-hover:bg-white/10"></div>
              <span className="relative">
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </span>
            </button>
          </form>

          <p className="mt-10 text-center text-slate-600">
            Nouveau sur notre plateforme ?{' '}
            <a href="/register" className="font-bold text-red-700 hover:text-red-800 hover:underline transition-colors">
              Créer un compte
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};