import React from 'react';
import { 
  X, Calendar, Hash, Briefcase, 
  User, Clock, FileText, ShieldCheck,
  Building2, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '../store/slices/quoteSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

export const QuoteDetailsModal = ({ isOpen, onClose, quote }: Props) => {
  if (!quote) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SENT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EXPIRED': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 font-sans">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            
            {/* TOP HEADER */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
              <div className="flex items-center gap-5">
                {/* Logo Box */}
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm text-slate-900">
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                      DEVIS {quote.quote_number}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    <User size={14} className="text-slate-400" /> 
                    <span className="font-bold text-slate-700">{quote.client_name || "Client Inconnu"}</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 custom-scrollbar">
              
              {/* GRID INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Devis</label>
                  <p className="text-slate-900 font-bold flex items-center gap-2 text-sm">
                    <Hash size={14} className="text-slate-900" /> {quote.quote_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date d'émission</label>
                  <p className="text-slate-900 font-bold flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-slate-900" /> {quote.issued_date}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valide Jusqu'au</label>
                  <p className="text-slate-900 font-bold flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-slate-900" /> {quote.valid_until}
                  </p>
                </div>
              </div>

              {/* PROJECT DESCRIPTION */}
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Briefcase size={12}/> Description du Projet
                 </label>
                 <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                   <p className="text-slate-600 text-sm leading-relaxed">
                     {quote.project_description || "Aucune description fournie."}
                   </p>
                 </div>
              </div>

              {/* ITEMS TABLE */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Détails des prestations</label>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase border-b border-slate-200">
                        <th className="px-6 py-4 w-16 text-center">#</th>
                        <th className="px-6 py-4">Désignation</th>
                        <th className="px-4 py-4 text-center">Unité</th>
                        <th className="px-4 py-4 text-center">Qté</th>
                        <th className="px-4 py-4 text-right">P.U HT</th>
                        <th className="px-6 py-4 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quote.items.map((item, index) => (
                        <tr key={index} className="text-sm hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                          <td className="px-6 py-4">
                            <p className="text-slate-900 font-bold">{item.item_name}</p>
                            {item.item_description && <p className="text-[11px] text-slate-500 mt-1">{item.item_description}</p>}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] text-slate-600 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="px-4 py-4 text-center text-slate-900 font-bold">{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-slate-600 tabular-nums">{item.unit_price}</td>
                          <td className="px-6 py-4 text-right text-slate-900 font-black tabular-nums">{item.subtotal} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-4">
                
                {/* Left: Amount in Words */}
                <div className="max-w-md space-y-6 flex-1">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Arrêté à la somme de :</label>
                    <p className="text-sm text-slate-800 font-bold leading-relaxed uppercase tracking-wide">
                      {quote.amount_in_words || "---"}
                    </p>
                  </div>
                </div>

                {/* Right: Numbers */}
                <div className="w-full md:w-80 space-y-4">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Sous-total Brut</span>
                    <span className="font-bold text-slate-900">{quote.subtotal} DH</span>
                  </div>
                  
                  {quote.discount_amount && parseFloat(quote.discount_amount) > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                        <span>Remise ({quote.discount_percentage}%)</span>
                        <span>-{quote.discount_amount} DH</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-100 my-2"></div>
                  
                  <div className="flex justify-between text-sm text-slate-700 font-bold uppercase">
                    <span>Total HT</span>
                    <span>{quote.total_ht} DH</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>TVA ({Number(quote.tax_rate)}%)</span>
                    <span>{quote.tax_amount} DH</span>
                  </div>
                  
                  <div className="p-6 bg-slate-900 rounded-2xl text-white mt-4 shadow-xl shadow-slate-200">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 block">Total TTC</span>
                        <span className="text-2xl font-black tracking-tight">{quote.total_ttc} <span className="text-sm font-medium text-slate-400">DH</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER METADATA */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-4">
              <div className="flex gap-6">
                <span>Créé le: {new Date(quote.created_at).toLocaleDateString()}</span>
                {/* <span>Par: {quote.created_by}</span> */}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                Document Certifié FatouraLik
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};