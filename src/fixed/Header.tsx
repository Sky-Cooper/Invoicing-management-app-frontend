import  { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, Menu, ChevronDown, User, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from './Sidebar';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header = ({ title, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // --- ÉTATS ---
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [userData, setUserData] = useState({ name: "Utilisateur", role: "Collaborateur" });

  // --- 1. RÉCUPÉRATION DEPUIS USER_DATA (LOCAL STORAGE) ---
  useEffect(() => {
    const rawData = localStorage.getItem('user_data');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setUserData({
          name: parsed.full_name || "Utilisateur",
          role: parsed.role?.replace('_', ' ') || "Collaborateur"
        });
      } catch (e) {
        console.error("Erreur lors de la lecture des données utilisateur", e);
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. LOGIQUE DE RECHERCHE ---
  const searchResults = useMemo(() => {
    if (!searchValue.trim()) return [];
    return NAV_ITEMS.filter(item =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 5);
  }, [searchValue]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setSearchValue("");
    setShowResults(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="flex h-20 items-center justify-between bg-white border-b border-slate-100 px-8 sticky top-0 z-40">
      
      <div className="flex items-center gap-4 text-left">
        <button 
          className="rounded-xl p-2 text-slate-500 lg:hidden hover:bg-slate-50 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        
        {/* RECHERCHE INTELLIGENTE */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className={`flex items-center rounded-2xl bg-slate-50 px-4 py-2.5 border-2 transition-all duration-300 ${showResults && searchValue ? 'border-indigo-600 ring-4 ring-indigo-500/5 bg-white' : 'border-transparent'}`}>
            <Search className={`h-4 w-4 ${showResults && searchValue ? 'text-indigo-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Rechercher une section..." 
              className="ml-3 w-64 border-none bg-transparent text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              value={searchValue}
              onFocus={() => setShowResults(true)}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {showResults && searchValue.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden py-2 mt-2 z-50"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors group"
                    >
                      <item.icon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-700 group-hover:text-indigo-700 leading-none">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-xs font-bold text-slate-300 uppercase italic text-center">Aucun résultat</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NOTIFICATIONS */}
        <button className="relative rounded-xl bg-slate-50 p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
        </button>

        {/* --- PROFIL UTILISATEUR "PRO" (Blanc/Slate) --- */}
        <div className="group relative">
          <div className="flex cursor-pointer items-center gap-3 rounded-[1.2rem] bg-white border border-slate-200 py-1.5 pl-1.5 pr-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all active:scale-95">
            {/* Avatar container avec gradient subtil */}
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-indigo-600 shadow-inner">
               <User size={18} strokeWidth={2.5} />
            </div>
            
            <div className="hidden text-left md:block">
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">
                {userData.name}
              </p>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1 leading-none">
                {userData.role}
              </p>
            </div>
            
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>

          {/* DROPDOWN MENU */}
          <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-4xl shadow-2xl border border-slate-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
             <div className="px-6 py-3 border-b border-slate-50 mb-2 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Compte professionnel</p>
                <p className="text-sm font-black text-slate-900 mt-1 truncate">{userData.name}</p>
             </div>
             
             <button 
               onClick={() => navigate('/profile')} 
               className="w-full flex items-center gap-3 px-6 py-3 text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
             >
                <UserCircle size={18} strokeWidth={2.5} /> Mon Profil
             </button>

             <hr className="my-2 border-slate-50 mx-6" />
             
             <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-6 py-3 text-[11px] font-black text-red-600 hover:bg-red-50 transition-all uppercase tracking-widest"
             >
                <LogOut size={18} strokeWidth={2.5} /> Déconnexion
             </button>
          </div>
        </div>

      </div>
    </header>
  );
};