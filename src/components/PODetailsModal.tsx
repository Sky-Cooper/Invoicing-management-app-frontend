import React from 'react';
import { 
  X, Calendar, Briefcase, 
  User, Truck, ShoppingCart, ShieldCheck,
  Hash, BadgeCheck, CheckCircle2, Clock, FileX,
  Printer, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PurchaseOrder } from '../store/slices/purchaseOrderSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
}

export const PODetailsModal = ({ isOpen, onClose, po }: Props) => {
  if (!po) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SENT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-slate-900 text-white border-slate-700'; 
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'CONFIRMED': return <BadgeCheck size={14}/>;
          case 'SENT': return <CheckCircle2 size={14}/>;
          case 'COMPLETED': return <Truck size={14}/>;
          case 'CANCELLED': return <FileX size={14}/>;
          default: return <Clock size={14}/>;
      }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 font-sans">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
          >
            
            {/* TOP HEADER */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">COMMANDE {po.po_number}</h2>
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(po.status)}`}>
                      {getStatusIcon(po.status)} {po.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                    <User size={14} /> {po.client_name || "Fournisseur Inconnu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Imprimer">
                    <Printer size={20} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Télécharger PDF">
                    <Download size={20} />
                 </button>
                 <div className="w-px h-6 bg-slate-200 mx-2"></div>
                 <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
                    <X size={20} />
                 </button>
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA] space-y-8 custom-scrollbar">
              
              {/* META INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard icon={<Hash size={16}/>} label="Référence BC" value={po.po_number} />
                <InfoCard icon={<Calendar size={16}/>} label="Date Commande" value={po.issued_date} />
                <InfoCard icon={<Truck size={16}/>} label="Livraison Prévue" value={po.expected_delivery_date} highlight />
              </div>

              {/* PROJECT DESCRIPTION */}
              {po.project_description && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14}/> Description du Projet
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {po.project_description}
                    </p>
                  </div>
              )}

              {/* ITEMS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-16 text-center">#</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Désignation</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Unité</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qté</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">P.U HT</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-bold">{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 text-sm font-bold">{item.item_name}</p>
                          {item.item_description && <p className="text-xs text-slate-500 mt-0.5">{item.item_description}</p>}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 font-bold uppercase">{item.unit}</span>
                        </td>
                        <td className="px-4 py-4 text-center text-slate-900 font-bold text-sm">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-medium text-sm tabular-nums">{item.unit_price}</td>
                        <td className="px-6 py-4 text-right text-slate-900 font-black text-sm tabular-nums">{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Left: Amount in Words */}
                <div className="flex-1 bg-slate-100 rounded-2xl p-6 border border-slate-200 h-fit">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Arrêté à la somme de :</label>
                  <p className="text-sm text-slate-800 font-bold leading-relaxed uppercase tracking-wide">
                    {po.amount_in_words || "---"}
                  </p>
                </div>

                {/* Right: Numbers */}
                <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Total HT</span>
                    <span className="text-slate-900 font-bold">{po.total_ht} DH</span>
                  </div>
                  
                  {po.discount_amount && parseFloat(po.discount_amount) > 0 && (
                    <div className="flex justify-between text-xs font-medium text-emerald-600">
                        <span>Remise ({po.discount_percentage}%)</span>
                        <span>-{po.discount_amount} DH</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>TVA ({Number(po.tax_rate)}%)</span>
                    <span>{po.tax_amount} DH</span>
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2"></div>
                  
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total TTC</span>
                     <span className="text-xl font-black text-slate-900 tracking-tight">{po.total_ttc} <span className="text-sm text-slate-400 font-bold">DH</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER METADATA */}
            <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Créé le: {new Date(po.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                Document Certifié
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for Meta Info
const InfoCard = ({ icon, label, value, highlight = false }: any) => (
    <div className={`p-4 rounded-xl border flex items-center gap-4 ${highlight ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            {icon}
        </div>
        <div>
            <p className={`text-[9px] font-black uppercase tracking-widest ${highlight ? 'text-amber-400' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-sm font-bold ${highlight ? 'text-amber-900' : 'text-slate-900'}`}>{value}</p>
        </div>
    </div>
);