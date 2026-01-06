import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice'; 

import { 
  LayoutDashboard, Users, FileText, User, 
  LogOut, Briefcase, 
  ChevronLeft, ChevronRight, X, ShieldCheck,
  HardHat, ClipboardList, Package, Bell, CreditCard,
  Banknote, FilePlus, ShoppingCart, FileCheck, Calculator, Wallet 
} from 'lucide-react';
import { useAppDispatch } from '../store/hooks/hooks';
import type { RootState } from '../store/store';

// --- CONFIGURATION DE LA NAVIGATION ---
export const NAV_ITEMS = [
  // --- HOME ---
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    id: 'dashboard', 
    path: '/dashboard', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'HOME' 
  },
  
  // --- BUSINESS (Clients, Chantiers, Invoicing) ---
  { 
    name: 'Clients', 
    icon: Users, 
    id: 'clients', 
    path: '/clients', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Chantiers', 
    icon: HardHat, 
    id: 'chantiers', 
    path: '/chantiers', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Catalogue', 
    icon: Package, 
    id: 'items', 
    path: '/items', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'INVOICING_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Devis', 
    icon: FilePlus, 
    id: 'quotes', 
    path: '/quotes', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'INVOICING_ADMIN'], 
    category: 'BUSINESS' 
  },
  // --- PURCHASE ORDERS (Bon de Commande) ---
  { 
    name: 'Bon de Commande', 
    icon: ShoppingCart, 
    id: 'purchase-orders', 
    path: '/purchase-orders', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'INVOICING_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Factures', 
    icon: FileText, 
    id: 'invoices', 
    path: '/invoices', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'INVOICING_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Dépenses', 
    icon: Banknote, 
    id: 'expenses', 
    path: '/expenses', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN'], 
    category: 'BUSINESS' 
  },
  // --- NEW: CHARGES FIXES ---
  { 
    name: 'Charges Fixes', 
    icon: Wallet, 
    id: 'fixed-charges', 
    path: '/fixed-charges', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'BUSINESS' 
  },
  { 
    name: 'Payement', 
    icon: CreditCard, 
    id: 'payments', 
    path: '/payments', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'INVOICING_ADMIN'], 
    category: 'BUSINESS' 
  },

  // --- HR (Human Resources) ---
  { 
    name: 'Employés', 
    icon: Users, 
    id: 'employees', 
    path: '/employees', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN'], 
    category: 'HR' 
  },
  { 
    name: 'Contrats', 
    icon: FileCheck, 
    id: 'contracts', 
    path: '/contracts', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', ], 
    category: 'HR' 
  },
  { 
    name: 'Solde Tout Compte', 
    icon: Calculator, 
    id: 'eosb', 
    path: '/eosb', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'HR' 
  },
  { 
    name: 'Pointage', 
    icon: ClipboardList, 
    id: 'attendance', 
    path: '/attendance', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN'], 
    category: 'HR' 
  },
  { 
    name: 'Affectations', 
    icon: ClipboardList, 
    id: 'assignments', 
    path: '/assignments', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    category: 'HR' 
  },

  // --- SYSTEM (Settings & Admin) ---
  { 
    name: 'Départements', 
    icon: Briefcase, 
    id: 'departments', 
    path: '/departments', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'SYSTEM' 
  },
  { 
    name: 'Admins Dept', 
    icon: ShieldCheck, 
    id: 'dept-admins', 
    path: '/department-admins', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'], 
    category: 'SYSTEM' 
  },
  { 
    name: 'Profile', 
    icon: User, 
    id: 'settings', 
    path: '/profile', 
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN','HR_ADMIN','INVOICING_ADMIN'], 
    category: 'SYSTEM' 
  },
];

const CATEGORIES = ['HOME', 'BUSINESS', 'HR', 'SYSTEM'];

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Filter items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => 
    !item.roles || (userRole && (item.roles as string[]).includes(userRole))
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? '280px' : (isCollapsed ? '80px' : '280px'),
          x: isMobile ? (isOpen ? 0 : -320) : 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-white border-r border-slate-100 shadow-sm lg:static"
      >
        {/* Logo TOURTRA */}
        <div className="flex h-24 items-center px-6 shrink-0 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <img src="/pic2.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-slate-900 font-black text-xl tracking-tighter leading-none">TOURTRA</span>
                <span className="text-[7px] text-red-600 font-bold uppercase tracking-widest mt-1 leading-tight text-left">
                  Votre structure,<br/>notre excellence
                </span>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={onClose} className="ml-auto p-2 text-slate-400"><X size={20}/></button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 overflow-y-auto no-scrollbar py-6 space-y-7">
          {CATEGORIES.map((cat) => {
            const catItems = filteredNavItems.filter(i => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                {!isCollapsed && (
                  <h3 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-left">
                    {cat}
                  </h3>
                )}
                <div className="space-y-1">
                  {catItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                        className={`group flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive 
                            ? 'bg-red-50 text-red-600 shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-red-500'}`} />
                        {!isCollapsed && (
                          <span className={`text-[13px] ${isActive ? 'font-black' : 'font-bold'}`}>
                            {item.name}
                          </span>
                        )}
                        {isActive && !isCollapsed && (
                           <motion.div layoutId="activePill" className="ml-auto w-1.5 h-5 bg-red-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pied de Sidebar */}
        <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-100 shadow-sm ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0 overflow-hidden">
              <img src="/pic2.jpeg" alt="User" className="h-full w-full object-cover" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[9px] text-red-600 font-black uppercase tracking-tighter truncate">
                  {userRole?.replace('_', ' ') || 'Admin Account'}
                </span>
              </div>
            )}
          </div>
          
          <div className={`mt-4 flex ${isCollapsed ? 'flex-col items-center gap-5' : 'justify-around items-center'} px-2 text-slate-400`}>
            {!isMobile && (
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="hover:text-red-600 transition-colors" title="Réduire">
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
            <button onClick={() => navigate('/settings')} className="hover:text-red-600 transition-colors" title="Notifications">
              <Bell size={18} />
            </button>
            <button onClick={handleLogout} className="hover:text-red-600 transition-colors" title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay Mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
          />
        )}
      </AnimatePresence>
    </>
  );
};