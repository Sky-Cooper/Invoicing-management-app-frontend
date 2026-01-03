import { useEffect, useState } from 'react';
import { fetchDepartments, createDepartment, deleteDepartment } from '../store/slices/departmentSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Search, 
  MoreVertical, 
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

export const Departments = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.departments);
  
  // Local state for UI
  const [isAddMode, setIsAddMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    
    await dispatch(createDepartment({ 
      name: newName, 
      description: newDescription || "Description par défaut" 
    }));
    
    // Reset and close
    setNewName('');
    setNewDescription('');
    setIsAddMode(false);
  };

  // Filter items based on search
  const filteredItems = items.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      
      {/* --- 1. Header Section --- */}
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Départements</h1>
          <p className="mt-1 text-slate-500">Gérez la structure organisationnelle de votre entreprise.</p>
        </div>
        
        <button 
          onClick={() => setIsAddMode(!isAddMode)}
          className={`group flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition-all active:scale-95
            ${isAddMode 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-red-500/30'
            }`}
        >
          {isAddMode ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          <span>{isAddMode ? 'Annuler' : 'Nouveau Département'}</span>
        </button>
      </div>

      {/* --- 2. Error Alert --- */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* --- 3. Action Bar (Search & Add Form) --- */}
      <div className="mb-8 space-y-4">
        
        {/* The "Add New" Form - slides down when active */}
        {isAddMode && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-300 mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">Créer un nouveau département</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Nom du département</label>
                <input 
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Ex: Marketing, IT, Finance..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
                <input 
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Courte description du rôle..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleAdd}
                disabled={!newName}
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Confirmer la création'}
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un département..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm ring-1 ring-slate-200 transition-shadow focus:ring-2 focus:ring-red-500/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* --- 4. The Grid --- */}
      {isLoading && items.length === 0 ? (
        // Loading Skeletons
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 h-12 w-12 rounded-lg bg-slate-200" />
              <div className="mb-2 h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Aucun département trouvé</h3>
          <p className="max-w-xs text-sm text-slate-500">
            {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par ajouter votre premier département."}
          </p>
          {!searchTerm && (
            <button onClick={() => setIsAddMode(true)} className="mt-4 text-sm font-bold text-red-600 hover:underline">
              Créer maintenant
            </button>
          )}
        </div>
      ) : (
        // Real Data Grid
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((dept) => (
            <div 
              key={dept.id} 
              className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div>
                {/* Icon & Menu Row */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-bold text-slate-900">{dept.name}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {dept.description || "Aucune description fournie pour ce département."}
                </p>
              </div>

              {/* Footer / Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(dept.created_at).toLocaleDateString()}</span>
                </div>
                
                <button 
                  onClick={() => dispatch(deleteDepartment(dept.id))}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};