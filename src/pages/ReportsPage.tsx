import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, Download, Calendar, Filter, 
  Loader2, File, Clock, Plus, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AppDispatch, RootState } from '../store/store';
import { fetchAttendanceReports, generateAttendanceReport } from '../store/slices/attendanceSlice';
// Import the API client to access the dynamic base URL
import { safeApi } from '../api/client'; 

export const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const { reports, isReportsLoading, isGeneratingReport } = useSelector((state: RootState) => state.attendances);
  
  // Local State
  const [filterType, setFilterType] = useState<'ALL' | 'WEEKLY' | 'MONTHLY'>('ALL');
  
  // Form State for Custom Generation
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Fetch on mount or when filter changes
  useEffect(() => {
    dispatch(fetchAttendanceReports(filterType));
  }, [dispatch, filterType]);

  const handleGenerate = async () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      alert("Veuillez sélectionner une date de début et de fin.");
      return;
    }

    // 1. Dispatch the generation action
    const resultAction = await dispatch(generateAttendanceReport(dateRange));

    if (generateAttendanceReport.fulfilled.match(resultAction)) {
      // 2. Success: Open the file and refresh list
      const fileUrl = resultAction.payload.file_url;
      
      let downloadLink = fileUrl;

      // If the URL is relative, prepend the API base URL dynamically
      if (!fileUrl.startsWith('http')) {
          // Retrieve baseURL from axios instance (removes trailing slash if present)
          const baseUrl = safeApi.defaults.baseURL?.replace(/\/$/, '') || '';
          downloadLink = `${baseUrl}${fileUrl}`;
      }
      
      window.open(downloadLink, '_blank');

      // Refresh the list to show the new item
      dispatch(fetchAttendanceReports(filterType));
      
      // Reset form
      setDateRange({ start_date: '', end_date: '' });
    } else {
      alert("Erreur lors de la génération du rapport");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-4xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
              <FileText size={12} /> Archives Administratives
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                  Rapports de <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">Pointage</span>
                </h1>
                <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
                  Générez des rapports personnalisés ou consultez l'historique des relevés d'heures.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GENERATOR SECTION (New) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="text-indigo-600" size={20} />
                Nouveau Rapport
            </h2>
            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                        Date de début
                    </label>
                    <input 
                        type="date" 
                        value={dateRange.start_date}
                        onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                        className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all focus:ring-2" 
                    />
                </div>
                <div className="hidden md:block pb-4 text-slate-300">
                    <ArrowRight size={20} />
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
                        Date de fin
                    </label>
                    <input 
                        type="date" 
                        value={dateRange.end_date}
                        onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                        className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all focus:ring-2" 
                    />
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isGeneratingReport}
                    className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGeneratingReport ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <FileText size={18} />
                            Générer PDF
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* FILTERS & LIST */}
        <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-800">Historique</h3>
             {/* FILTER TABS */}
              <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1 w-full md:w-auto">
                {(['ALL', 'WEEKLY', 'MONTHLY'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 w-full md:w-auto
                      ${filterType === type 
                        ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}
                    `}
                  >
                    {type === 'ALL' ? 'Tout' : type === 'WEEKLY' ? 'Hebdo' : 'Mensuel'}
                  </button>
                ))}
              </div>
        </div>

        {/* CONTENT GRID */}
        {isReportsLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Chargement des archives...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Filter className="text-slate-300" size={40} />
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-2">Aucun rapport trouvé</h3>
            <p className="text-slate-400 text-sm max-w-xs text-center">
              Utilisez le formulaire ci-dessus pour générer votre premier rapport.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {reports.map((report) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={report.id}
                  className="group bg-white rounded-4xl p-1 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm transition-colors
                        ${report.report_type === 'WEEKLY' 
                          ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                          : report.report_type === 'MONTHLY' 
                             ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
                             : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' // Style for Custom
                        }
                      `}>
                        {report.report_type === 'WEEKLY' ? 'H' : report.report_type === 'MONTHLY' ? 'M' : 'C'}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                           {/* Fallback to created_at year or current year */}
                           {report.created_at ? new Date(report.created_at).getFullYear() : new Date().getFullYear()}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
                      {report.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} />
                      <span className="text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
                        {report.start_date} <span className="text-slate-300 mx-1">→</span> {report.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Footer / Action */}
                  <a 
                    href={report.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-[1.8rem] mx-1 mb-1 group-hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white rounded-full text-slate-900">
                        <File size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">
                        PDF Document
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 group-hover:text-white transition-colors">
                      <span className="text-xs font-bold">Télécharger</span>
                      <Download size={16} />
                    </div>
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};