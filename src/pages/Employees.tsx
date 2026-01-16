import  { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, User, Fingerprint, Trash2, Edit3, 
  BadgeCheck, Hash, Globe, Mail, CalendarDays,
  UserX, ShieldAlert, AlertTriangle // [NEW] Added AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types et Redux
import type { AppDispatch, RootState } from '../store/store';
import { fetchEmployees, deleteEmployee, type Employee } from '../store/slices/employeeSlice';
import { fetchProfile } from '../store/slices/profileSlice'; 

// Composants Modaux
import EmployeeModal from '../components/EmployeeModal';
import { EmployeeDetailsModal } from '../components/EmployeeDetailsModal';

export const EmployeesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { items: employees, isLoading } = useSelector((state: RootState) => state.employees);
  const { data: userProfile } = useSelector((state: RootState) => state.profile);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<'edit' | 'view' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // [NEW] State for Delete Modal
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => { 
    if (accessToken) {
      dispatch(fetchEmployees());
      if (!userProfile) dispatch(fetchProfile());
    }
  }, [dispatch, accessToken, userProfile]);

  const handleOpenView = (emp: Employee) => { setSelectedEmployee(emp); setActiveModal('view'); };
  const handleOpenEdit = (emp: Employee | null) => { setSelectedEmployee(emp); setActiveModal('edit'); };

  // [NEW] 1. Request Delete (Opens Modal)
  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
  };

  // [NEW] 2. Confirm Delete (Executes Action)
  const handleConfirmDelete = () => {
    if (deleteId) {
      dispatch(deleteEmployee(deleteId));
      setDeleteId(null);
    }
  };

  // Memoïsation pour optimiser les performances de recherche
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const fullName = `${e.user.first_name} ${e.user.last_name}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || e.cin?.toLowerCase().includes(search);
    });
  }, [employees, searchTerm]);

  return (
    <div className="max-w-400 mx-auto p-4 lg:p-10 space-y-10 min-h-screen bg-[#FDFDFD]">
      
      {/* SECTION HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
              Effectifs <span className="text-red-600">Sécurisés</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <BadgeCheck size={14} className="text-emerald-500" />
              {employees.length} Collaborateurs certifiés {userProfile?.company_name && `• ${userProfile.company_name}`}
            </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
            <input 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-semibold text-slate-700 shadow-sm placeholder:text-slate-400 placeholder:font-medium"
              placeholder="Rechercher un CIN ou un nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenEdit(null)} 
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Plus size={18} strokeWidth={3} /> Nouveau
          </button>
        </div>
      </header>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // SKELETON LOADING STATE
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                companyName={userProfile?.company_name}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteRequest} // [CHANGED] Uses new handler
              />
            ))
          ) : (
            // EMPTY STATE
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-[3rem]"
            >
              <UserX size={48} strokeWidth={1.5} />
              <p className="font-bold text-lg uppercase tracking-tighter">Aucun collaborateur trouvé</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EmployeeModal isOpen={activeModal === 'edit'} onClose={() => setActiveModal(null)} initialData={selectedEmployee} />
      <EmployeeDetailsModal isOpen={activeModal === 'view'} onClose={() => setActiveModal(null)} employee={selectedEmployee} onEdit={handleOpenEdit} />

      {/* [NEW] CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-4xl shadow-2xl p-8 max-w-md w-full border border-slate-100 overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                
                {/* Icon Container */}
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100 shadow-inner">
                   <AlertTriangle className="text-red-500" size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Confirmer la Révocation
                  </h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">
                    Voulez-vous vraiment révoquer ce collaborateur ? <br/>
                    <span className="text-red-500">Ses accès système seront supprimés.</span>
                  </p>
                </div>

                <div className="flex gap-3 w-full pt-4">
                  <button 
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
                    className="flex-1 py-4 rounded-xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Révoquer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- COMPOSANT : CARDE EMPLOYÉ (RÉUTILISABLE) ---
const EmployeeCard = ({ employee, companyName, onView, onEdit, onDelete }: any) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -5 }}
    className="group relative bg-white rounded-[2.5rem] p-1 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100"
  >
    <div className="relative bg-white rounded-[2.3rem] overflow-hidden flex flex-col h-full border border-transparent group-hover:border-red-50 transition-colors">
      
      {/* Badge Header */}
      <div className="bg-slate-900 px-6 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
              <Globe size={12} className="text-red-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {companyName || "SYSTEM ACCESS"}
              </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="text-[8px] font-bold uppercase tracking-widest">Secured Identity</span>
            <ShieldAlert size={10} />
          </div>
      </div>

      <div className="flex flex-col sm:flex-row p-6 gap-8">
          {/* Section Visuelle (Gauche) */}
          <div className="w-full sm:w-40 shrink-0 flex flex-col gap-4">
              <div className="w-full aspect-3/4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center relative overflow-hidden group-hover:bg-red-50/30 transition-colors">
                  <User size={64} strokeWidth={1} className="text-slate-200 group-hover:text-red-200 transition-colors" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-slate-100">
                      <Fingerprint size={16} className="text-red-600" />
                  </div>
              </div>

              {/* Barcode Dynamique */}
              <div className="flex justify-between items-end h-8 px-2 opacity-10 group-hover:opacity-30 transition-opacity">
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className="bg-slate-900 rounded-full" style={{ width: i%6===0 ? '3px' : '1px', height: `${Math.random() * 60 + 40}%` }} />
                  ))}
              </div>
          </div>

          {/* Section Données (Droite) */}
          <div className="flex-1 flex flex-col text-left min-w-0">
              <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                      <Hash size={12} className="text-red-500" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CIN / Matricule</label>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 truncate tracking-tighter leading-none font-mono">
                      {employee.cin || "UNSET"}
                  </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="min-w-0">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Identité</label>
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {employee.user.first_name} <br/> {employee.user.last_name}
                      </p>
                  </div>
                  <div className="min-w-0">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Poste</label>
                      <p className="text-sm font-bold text-slate-700 truncate">{employee.job_title}</p>
                  </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                  <InfoPill icon={<Mail size={10}/>} value={employee.user.email} />
                  <InfoPill icon={<CalendarDays size={10}/>} value={employee.hire_date} />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-2 mt-auto">
                  <button 
                      onClick={() => onView(employee)}
                      className="h-11 flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
                  >
                      Dossier RH
                  </button>
                  <button 
                      onClick={() => onEdit(employee)}
                      className="h-11 w-11 flex items-center justify-center border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                      <Edit3 size={16} />
                  </button>
                  <button 
                      onClick={() => onDelete(employee.id)}
                      className="h-11 w-11 flex items-center justify-center border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  </motion.div>
);

const InfoPill = ({ icon, value }: any) => (
  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 min-w-0">
    <span className="text-slate-400 group-hover:text-red-500 transition-colors shrink-0">{icon}</span>
    <span className="text-[10px] font-bold text-slate-600 truncate">{value || "---"}</span>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-[2.5rem] p-6 h-64 border border-slate-100 animate-pulse flex gap-8">
    <div className="w-40 aspect-3/4 bg-slate-100 rounded-2xl" />
    <div className="flex-1 space-y-4">
      <div className="h-8 bg-slate-100 rounded-lg w-1/2" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-full" />
      </div>
      <div className="h-12 bg-slate-100 rounded-xl w-full mt-auto" />
    </div>
  </div>
);