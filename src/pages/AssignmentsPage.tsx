import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, HardHat, Calendar, 
  CheckCircle2, User, Loader2, Pencil, Trash2,
  AlertTriangle, X // [NEW] Icons for the delete modal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Using Framer Motion for smooth animations

// Redux
import type { AppDispatch, RootState } from '../store/store';
import { fetchAssignments, deleteAssignment, type ChantierAssignment } from '../store/slices/assignmentSlice'; 

// Composants
import AssignmentModal from '../components/AssignmentModal';

export const AssignmentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: assignments, isLoading } = useSelector((state: RootState) => state.assignments);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<ChantierAssignment | null>(null);

  // [NEW] State to track the ID of the item to delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // --- Chargement des données ---
  useEffect(() => { 
    if (accessToken) {
      dispatch(fetchAssignments()); 
    }
  }, [dispatch, accessToken]);

  // --- Actions Handlers ---
  const handleOpenCreate = () => {
    setAssignmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (assignment: ChantierAssignment) => {
    setAssignmentToEdit(assignment);
    setIsModalOpen(true);
  };

  // [NEW] 1. Request Delete (Opens the custom modal)
  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
  };

  // [NEW] 2. Confirm Delete (Actually deletes)
  const handleConfirmDelete = async () => {
    if (deleteId) {
      await dispatch(deleteAssignment(deleteId));
      setDeleteId(null); // Close modal
    }
  };

  // --- Filtrage ---
  const filteredAssignments = assignments.filter(a => 
    `${a.employee?.user?.first_name} ${a.employee?.user?.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-10 relative">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Affectations <span className="text-blue-900">Ressources</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Organisation des équipes FatouraLik v2.0</p>
        </div>

        <div className="flex gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-900/20 font-bold text-sm"
              placeholder="Rechercher un collaborateur ou une mission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Nouvelle Affectation
          </button>
        </div>
      </div>

      {/* TABLEAU DES AFFECTATIONS */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Collaborateur</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Mission Technique</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Période d'activité</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Statut</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-900" size={40} />
                    <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Chargement des affectations...</p>
                  </td>
                </tr>
              ) : filteredAssignments.length > 0 ? (
                filteredAssignments.map((assign) => (
                  <tr key={assign.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-900 group-hover:text-white transition-colors shadow-inner">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {assign.employee?.user?.first_name} {assign.employee?.user?.last_name}
                          </p>
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter opacity-70">
                            {assign.employee?.job_title || "Consultant Site"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <HardHat size={16} className="text-blue-900" />
                        </div>
                        <div className="max-w-xs">
                          <p className="text-sm font-bold text-slate-700 leading-tight">
                            {assign.description}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">
                            Chantier ID: #{assign.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                        <div className="inline-flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600">
                              Du {new Date(assign.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          {assign.end_date && (
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-600">
                                  Au {new Date(assign.end_date).toLocaleDateString()}
                                </span>
                             </div>
                          )}
                        </div>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center">
                        {assign.is_active ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-100">
                            <CheckCircle2 size={14} /> Sur Site
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                            Terminé
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(assign)}
                          className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-900 hover:border-blue-900 hover:bg-blue-50 transition-all shadow-sm"
                          title="Modifier l'affectation"
                        >
                          <Pencil size={16} />
                        </button>
                        
                        {/* UPDATE: Trigger Custom Modal */}
                        <button 
                          onClick={() => handleDeleteRequest(assign.id)}
                          className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm"
                          title="Supprimer l'affectation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    Aucune affectation trouvée pour cette recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      <AssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialData={assignmentToEdit} 
      />

      {/* [NEW] CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
              className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full border border-slate-100 overflow-hidden"
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
                    Confirmer la suppression
                  </h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">
                    Êtes-vous sûr de vouloir supprimer cette affectation ? <br/>
                    <span className="text-red-500">Cette action est irréversible.</span>
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

export default AssignmentsPage;