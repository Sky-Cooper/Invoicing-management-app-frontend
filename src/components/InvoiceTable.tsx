import { motion } from 'framer-motion';
import { FileText, Download, Eye, Edit3, Calendar, Hash, User, BadgeCheck } from 'lucide-react';
import type { Invoice } from '../store/slices/invoiceSlice';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
}

export const InvoiceTable = ({ invoices, isLoading, onView, onEdit }: InvoiceTableProps) => {
  const BASE_URL = "https://api.tourtra.ma";

  const formatMAD = (v: string) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(parseFloat(v || '0'));

  // --- LOGIQUE DE TÉLÉCHARGEMENT ---
  const handleDownload = (invoiceNumber: string) => {
    // Transformation : "006/2025" -> "facture_006_2025.pdf"
    const fileName = `facture_${invoiceNumber.replace('/', '_')}.pdf`;
    const downloadUrl = `${BASE_URL}/media/invoices/${fileName}`;
    
    // Création d'un lien temporaire pour forcer le téléchargement
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-red-600 font-black text-[10px] uppercase tracking-widest">Synchronisation TOURTRA...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6">
      {invoices.map((inv, idx) => (
        <motion.div 
          key={inv.id} 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: idx * 0.05 }}
          className="group relative bg-white border border-slate-100 hover:border-red-200 p-6 rounded-[2.5rem] transition-all shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)]"
        >
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Status Indicator */}
              <div className={`h-16 w-16 rounded-[1.8rem] flex items-center justify-center shadow-inner border transition-colors ${
                inv.status === 'PAID' 
                ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                <FileText size={28} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-slate-900 font-black text-xl tracking-tighter uppercase">{inv.invoice_number}</span>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
                    inv.status === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {inv.status === 'PAID' && <BadgeCheck size={10} />} {inv.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><User size={12} className="text-red-500"/> {inv.client_name}</span>
                  <span className="flex items-center gap-1.5"><Hash size={12} className="text-red-500"/> {inv.contract_number}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} className="text-red-500"/> {inv.issued_date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
              <div className="text-left lg:text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Montant TTC Certifié</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                  {formatMAD(inv.total_ttc)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(inv)}
                  className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all border border-slate-100"
                  title="Éditer"
                >
                  <Edit3 size={18} />
                </button>

                <button 
                  onClick={() => onView(inv)}
                  className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all border border-slate-100"
                  title="Aperçu"
                >
                  <Eye size={18} />
                </button>

                {/* BOUTON D'INSTALLATION (TÉLÉCHARGEMENT) CORRIGÉ */}
                <button 
                  onClick={() => handleDownload(inv.invoice_number)}
                  className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-1 active:scale-95"
                  title="Télécharger PDF"
                >
                  <Download size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};