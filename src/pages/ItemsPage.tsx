import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Package, Trash2, Edit3, Layers, 
  BadgeCheck, Hash, Banknote, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AppDispatch, RootState } from '../store/store';
import { fetchItems, deleteItem } from '../store/slices/itemSlice';
import type { Item } from '../store/slices/itemSlice'; 
import ItemModal from '../components/ItemModal';

export const ItemsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.items);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // --- NOUVEAU STATE POUR LA SUPPRESSION ---
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  useEffect(() => { 
    dispatch(fetchItems()); 
  }, [dispatch]);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // Ouvre la modale
  const handleRequestDelete = (item: Item) => {
    setItemToDelete(item);
  };

  // Confirme la suppression
  const confirmDelete = () => {
    if (itemToDelete && itemToDelete.id) {
      dispatch(deleteItem(itemToDelete.id));
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-400 mx-auto p-6 lg:p-10 space-y-12 min-h-screen bg-slate-50/50">
      
      {/* VIBRANT RED HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-600 to-red-800 tracking-tighter uppercase">
            Catalogue <span className="text-slate-900">Services & Produits</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 italic">
            <BadgeCheck size={16} className="text-red-500" />
            Unités de facturation TOURTRA v2.5
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 group-focus-within:text-red-600 transition-colors" size={20} />
            <input 
              className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-semibold text-slate-700 shadow-sm"
              placeholder="Code ou désignation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="hidden md:flex bg-linear-to-r from-red-600 to-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] items-center gap-3 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Nouvel Item
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-red-600 font-black text-[10px] uppercase tracking-widest">Synchronisation Catalogue...</p>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredItems.map((item) => (
            <motion.div 
              layout 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white rounded-[2.5rem] p-1 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.15)] transition-all duration-300 border border-slate-100"
            >
              {/* Red Glow Effect on Hover */}
              <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white rounded-[2.3rem] overflow-hidden p-8 flex flex-col h-full z-10 group-hover:border-red-100/50 transition-colors">
                
                {/* Card Header: Code & Actions */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl">
                    <Hash size={12} className="text-red-600" />
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{item.code}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleRequestDelete(item)} 
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="h-16 w-16 shrink-0 rounded-3xl bg-linear-to-br from-red-50 to-white border-2 border-white shadow-inner flex items-center justify-center text-red-300 group-hover:text-red-500 transition-colors">
                    <Package size={32} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-800 leading-none uppercase tracking-tighter truncate group-hover:text-red-700 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Layers size={10} /> {item.unit}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-8 line-clamp-2 italic leading-relaxed border-l-2 border-slate-100 pl-4">
                    {item.description || "Aucun descriptif technique associé à cette unité."}
                  </p>
                </div>

                {/* Pricing Block */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Banknote size={10} /> Prix de base
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      {Number(item.unit_price).toLocaleString('fr-MA')} <span className="text-[10px] text-red-600 uppercase">MAD</span>
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">TVA Appliquée</label>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black">
                      +{item.tax_rate}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-slate-200" size={40} />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Répertoire catalogue vide</p>
          <button onClick={handleAddNew} className="mt-6 text-red-600 font-bold text-sm hover:underline flex items-center gap-2 mx-auto">
            Ajouter le premier item <ArrowRight size={16} />
          </button>
        </div>
      )}
      
      {/* Modal Component */}
      <ItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedItem} 
      />

      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
      <DeleteConfirmationModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || ""}
      />
    </div>
  );
};

// --- COMPOSANT MODALE DE SUPPRESSION ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      {/* Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-4xl p-8 w-full max-w-md shadow-2xl border border-red-100 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100%] -mr-10 -mt-10 z-0" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <AlertTriangle size={32} className="text-red-600" strokeWidth={2.5} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
            Supprimer l'item ?
          </h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
            Vous êtes sur le point de retirer <span className="text-slate-800 font-bold">"{itemName}"</span> du catalogue. 
            Cette action est <span className="text-red-600 font-bold">irréversible</span>.
          </p>

          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
            >
              Confirmer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ItemsPage;