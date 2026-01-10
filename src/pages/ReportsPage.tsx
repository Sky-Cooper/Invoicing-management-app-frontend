import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, Download, Calendar, Filter, 
  Loader2, File, ChevronRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AppDispatch, RootState } from '../store/store';
import { fetchAttendanceReports } from '../store/slices/attendanceSlice';

export const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const { reports, isReportsLoading } = useSelector((state: RootState) => state.attendances);
  
  // Local State
  const [filterType, setFilterType] = useState<'ALL' | 'WEEKLY' | 'MONTHLY'>('ALL');

  // Fetch on mount or when filter changes
  useEffect(() => {
    dispatch(fetchAttendanceReports(filterType));
  }, [dispatch, filterType]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
              <FileText size={12} /> Archives Administratives
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                  Rapports de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pointage</span>
                </h1>
                <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
                  Consultez et téléchargez les relevés d'heures officiels. Ces documents sont générés automatiquement basés sur le pointage quotidien validé.
                </p>
              </div>

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
                    {type === 'ALL' ? 'Tout' : type === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuel'}
                  </button>
                ))}
              </div>
            </div>
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
              Aucun document ne correspond à vos critères de recherche pour le moment.
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
                  className="group bg-white rounded-[2rem] p-1 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm transition-colors
                        ${report.report_type === 'WEEKLY' 
                          ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                          : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}
                      `}>
                        {report.report_type === 'WEEKLY' ? 'H' : 'M'}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                           {/* Assuming report contains year or we infer it */}
                           {new Date().getFullYear()}
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