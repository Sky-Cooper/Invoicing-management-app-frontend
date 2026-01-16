import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UserPlus, Mail, Phone ,Building2, 
  Search, Trash2, Edit2, Users, MoreHorizontal, AlertTriangle, 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDeptAdmins, deleteDeptAdmin } from '../store/slices/deptAdminSlice';
import { fetchDepartments } from '../store/slices/departmentSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { DeptAdmin } from '../store/slices/deptAdminSlice';

// Imports des deux modaux distincts
import AddAdminModal from '../components/AddAdminModal';
import { EditAdminModal } from '../components/EditAdminModal';

export const DepartmentAdminsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admins } = useSelector((state: RootState) => state.deptAdmins);
  const { items: departments } = useSelector((state: RootState) => state.departments);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // États distincts pour la gestion des modaux
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<DeptAdmin | null>(null);

  // État pour la confirmation de suppression
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; adminId: number | null }>({
    isOpen: false,
    adminId: null
  });

  useEffect(() => {
    dispatch(fetchDeptAdmins());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const getDepartmentName = (deptId: number | string) => {
    const dept = departments.find(d => String(d.id) === String(deptId));
    return dept ? dept.name : "Non assigné";
  };

  // 1. Ouvre le modal de confirmation au lieu du window.confirm
  const handleDeleteClick = (id: number) => {
    setDeleteModal({ isOpen: true, adminId: id });
  };

  // 2. Exécute la suppression réelle
  const confirmDelete = () => {
    if (deleteModal.adminId) {
      dispatch(deleteDeptAdmin(deleteModal.adminId));
      setDeleteModal({ isOpen: false, adminId: null });
    }
  };

  // Fonction pour déclencher la modification
  const handleEditClick = (admin: DeptAdmin) => {
    setSelectedAdmin(admin);
    setIsEditOpen(true);
  };

  const filteredAdmins = admins.filter(a => 
    `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-10">
      
      {/* 1. Header Haute Fidélité */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
            <Users size={12} />
            Système d'administration
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Admins <span className="text-slate-400">Département</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Gérez les privilèges de vos collaborateurs et visualisez la structure de votre entreprise en temps réel.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
        >
          <UserPlus size={20} />
          Nouveau Membre
        </button>
      </div>

      {/* 2. Barre d'outils et Statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        <div className="lg:col-span-3 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher un administrateur par nom, email..."
            className="w-full rounded-3xl border border-slate-100 bg-white py-4 pl-14 pr-6 text-sm font-medium outline-none shadow-sm focus:ring-4 focus:ring-red-500/5 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black text-slate-900">{filteredAdmins.length}</span>
        </div>
      </div>

      {/* 3. Grid des Cartes (UX Fine) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAdmins.map((admin) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={admin.id} 
              className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/60 hover:border-red-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm ${
                  admin.role === 'INVOICING_ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {admin.role.replace('_', ' ')}
                </div>
                <MoreHorizontal size={20} className="text-slate-300" />
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-inner">
                  {admin.first_name[0]}{admin.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {admin.first_name} {admin.last_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    <Building2 size={12} />
                    {getDepartmentName(admin.department)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pb-8">
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <Phone size={16} className="text-slate-400" />
                  <span>{admin.phone_number}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => handleEditClick(admin)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Edit2 size={14} />
                  Modifier
                </button>
                <button 
                  onClick={() => admin.id && handleDeleteClick(admin.id)} 
                  className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Intégration des modaux existants */}
      <AddAdminModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
      
      <EditAdminModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        admin={selectedAdmin} 
      />

      {/* 5. NOUVEAU: Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop avec flou */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, adminId: null })}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Contenu du Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Confirmer la suppression
                </h3>
                
                <p className="text-slate-500 mb-8 text-sm px-4">
                  Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible et supprimera toutes les données associées.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, adminId: null })}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:scale-[1.02]"
                  >
                    Supprimer
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

export default DepartmentAdminsPage;