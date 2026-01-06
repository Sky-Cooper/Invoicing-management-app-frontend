import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  Wallet, CalendarRange, Building2, HardHat, Package, Truck, Tag, 
  AlertTriangle, Loader2 
} from 'lucide-react';
import { fetchFixedCharges, deleteFixedCharge } from '../store/slices/fixedChargeSlice';
import { AddFixedChargeModal } from '../components/AddFixedChargeModal';
import type { AppDispatch, RootState } from '../store/store';

// Helper to get Category Icon/Color
const getCategoryDetails = (cat: string) => {
  switch (cat) {
    case 'LABOR': return { icon: HardHat, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Main d\'œuvre' };
    case 'MATERIAL': return { icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Matériaux' };
    case 'TRANSPORT': return { icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Transport' };
    default: return { icon: Tag, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Autre' };
  }
};

export default function FixedChargesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, isDeleting } = useSelector((state: RootState) => state.fixedCharges);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE FOR DELETE CONFIRMATION ---
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFixedCharges());
  }, [dispatch]);

  // 1. Opens the confirmation modal
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  // 2. Actually deletes the item
  const confirmDelete = () => {
    if (deleteId) {
      dispatch(deleteFixedCharge(deleteId)).then(() => {
        setDeleteId(null); // Close modal on success
      });
    }
  };

  const handleEdit = (charge: any) => {
    setSelectedCharge(charge);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCharge(null);
    setIsModalOpen(true);
  };

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chantier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Charges Fixes</h1>
          <p className="text-slate-500 font-medium mt-2">Gérez les dépenses récurrentes de vos chantiers</p>
        </div>
        <button 
          onClick={handleCreate}
          className="group flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-all active:scale-95"
        >
          <div className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-slate-700 transition-colors">
            <Plus size={18} />
          </div>
          <span>Nouvelle Charge</span>
        </button>
      </div>

      {/* --- FILTERS & SEARCH --- */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 max-w-xl">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Rechercher par titre ou chantier..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
        />
        <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* --- LISTING --- */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Aucune charge fixe</h3>
          <p className="text-slate-500 mt-2">Commencez par ajouter une nouvelle dépense récurrente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((charge) => {
            const cat = getCategoryDetails(charge.category);
            return (
              <div key={charge.id} className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                
                {/* Card Top: Title & Menu */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0`}>
                      <cat.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{charge.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <Building2 size={12} />
                          <span>{charge.chantier_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(charge)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(charge.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Card Stats */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Montant Mensuel</p>
                      <p className="text-2xl font-black text-slate-900">{charge.amount} <span className="text-sm font-bold text-slate-400">DH</span></p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${charge.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {charge.is_active ? 'Actif' : 'Inactif'}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarRange size={16} className="text-slate-300" />
                      <span className="text-sm font-bold">{charge.start_date}</span>
                    </div>
                    <div className="h-1 flex-1 bg-slate-100 rounded-full relative">
                        <div className="absolute inset-y-0 bg-slate-200 w-1/2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{charge.end_date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM (ADD/EDIT) */}
      <AddFixedChargeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedCharge}
      />

      {/* --- CONFIRMATION MODAL (DELETE) --- */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">Supprimer la charge ?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Êtes-vous sûr de vouloir supprimer cette charge fixe ? Cette action est irréversible.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-4 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={20}/> : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}