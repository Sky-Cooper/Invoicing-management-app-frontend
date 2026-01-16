import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, UserCheck, HardHat, Check, X, 
  Loader2, Filter, Building2, Users,
  AlertTriangle, FileText, Download, File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AppDispatch, RootState } from '../store/store';
import { fetchAttendances, markAttendance, deleteAttendance, fetchAttendanceReports } from '../store/slices/attendanceSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { fetchChantiers } from '../store/slices/chantierSlice';
import { fetchAssignments } from '../store/slices/assignmentSlice'; 

// --- TYPES ---
interface ModalConfig {
  isOpen: boolean;
  type: 'present' | 'absent' | 'reset' | null;
  employeeName: string;
  employeeId: number | null;
  attendanceId?: number;
}

// --- SUB-COMPONENT: REPORTS MODAL ---
const ReportsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, isReportsLoading } = useSelector((state: RootState) => state.attendances);
  const [filterType, setFilterType] = useState<'ALL' | 'WEEKLY' | 'MONTHLY'>('ALL');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAttendanceReports(filterType));
    }
  }, [isOpen, filterType, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" /> Rapports de Pointage
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Historique et Téléchargements</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-white border-b border-slate-100">
          {(['ALL', 'WEEKLY', 'MONTHLY'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all
                ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}
              `}
            >
              {type === 'ALL' ? 'Tous' : type === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuel'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {isReportsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Chargement...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <File size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold">Aucun rapport disponible</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black
                    ${report.report_type === 'WEEKLY' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}
                  `}>
                    {report.report_type === 'WEEKLY' ? 'H' : 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-0.5 rounded">
                        {report.start_date} - {report.end_date}
                      </span>
                    </div>
                  </div>
                </div>
                
                <a 
                  href={report.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Télécharger</span>
                </a>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENT: CONFIRMATION MODAL ---
const ConfirmationModal = ({ 
  config, 
  onClose, 
  onConfirm 
}: { 
  config: ModalConfig; 
  onClose: () => void; 
  onConfirm: () => void;
}) => {
  if (!config.isOpen) return null;

  const isPresent = config.type === 'present';
  const isReset = config.type === 'reset';
  
  const colorClass = isPresent ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  const btnClass = isPresent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700';
  const icon = isPresent ? <Check size={32} /> : isReset ? <AlertTriangle size={32} /> : <X size={32} />;
  const title = isPresent ? 'Confirmer la présence' : isReset ? 'Réinitialiser le statut' : 'Marquer comme absent';
  const message = isReset 
    ? `Voulez-vous vraiment effacer le pointage de ${config.employeeName} ?`
    : `Confirmez-vous que ${config.employeeName} est ${isPresent ? 'PRÉSENT(E)' : 'ABSENT(E)'} aujourd'hui ?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${colorClass}`}>
            {icon}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button 
              onClick={onClose}
              className="px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className={`px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${btnClass}`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export const AttendancesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const { items: attendances, isLoading: loadingAtt } = useSelector((state: RootState) => state.attendances);
  const { items: employees } = useSelector((state: RootState) => state.employees);
  const { items: chantiers } = useSelector((state: RootState) => state.chantiers);
  const assignments = useSelector((state: RootState) => state.assignments?.items || []); 
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChantierId, setSelectedChantierId] = useState<number | ''>('');
  
  // Modal States
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false, type: null, employeeName: '', employeeId: null, attendanceId: undefined
  });

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    dispatch(fetchChantiers());
    dispatch(fetchEmployees());
    dispatch(fetchAssignments()); 
  }, [dispatch]);

  // --- 2. FETCH ATTENDANCE WHEN DATE CHANGES ---
  useEffect(() => {
    dispatch(fetchAttendances(selectedDate));
  }, [dispatch, selectedDate]);


  // --- 3. CALCULATE LIST (SIMPLIFIED TO SHOW ALL RELEVANT EMPLOYEES) ---
  const registerList = useMemo(() => {
    if (!selectedChantierId) return [];

    // --- STRATEGY: Combine Assignments AND Direct Employee List ---
    const employeesFromAssignments = assignments
      .filter(a => {
        const assignChantierId = typeof a.chantier === 'object' ? a.chantier.id : a.chantier;
        return Number(assignChantierId) === Number(selectedChantierId) && a.is_active !== false;
      })
      .map(a => {
        if (typeof a.employee === 'object' && a.employee.user) return a.employee;
        return employees.find(e => e.id === Number(a.employee));
      })
      .filter(Boolean);

    const employeeMap = new Map();

    // A. Add everyone from the global employee list 
    employees.forEach((emp: any) => {
       employeeMap.set(emp.id, emp);
    });

    // B. Add anyone from assignments
    employeesFromAssignments.forEach((emp: any) => {
        if (emp && !employeeMap.has(emp.id)) {
            employeeMap.set(emp.id, emp);
        }
    });

    const uniqueEmployees = Array.from(employeeMap.values());

    // 4. Merge with Attendance Data
    return uniqueEmployees.map((employee: any) => {
      const attendanceRecord = attendances.find(a => {
        const attEmpId = typeof a.employee === 'object' ? a.employee.id : a.employee;
        return Number(attEmpId) === Number(employee.id);
      });

      return {
        employee,
        attendance: attendanceRecord || null
      };
    });
    
  }, [employees, attendances, assignments, selectedChantierId]);

  // Stats Logic
  const stats = useMemo(() => {
    const total = registerList.length;
    const present = registerList.filter(r => r?.attendance?.present === true).length;
    const absent = registerList.filter(r => r?.attendance?.present === false).length;
    const progress = total > 0 ? ((present + absent) / total) * 100 : 0;
    return { total, present, absent, progress };
  }, [registerList]);

  // --- ACTIONS ---
  const initiateAction = (type: 'present' | 'absent' | 'reset', employee: any, attendanceId?: number) => {
    setModalConfig({
      isOpen: true,
      type,
      employeeName: `${employee.user?.first_name} ${employee.user?.last_name}`,
      employeeId: employee.id,
      attendanceId
    });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleConfirm = async () => {
    const { type, employeeId, attendanceId } = modalConfig;
    if (!selectedChantierId || !employeeId) return;

    closeModal();

    try {
      if (type === 'reset' && attendanceId) {
        await dispatch(deleteAttendance(attendanceId));
      } else if (type === 'present' || type === 'absent') {
        const isPresent = type === 'present';
        const payload = {
          date: selectedDate,
          present: isPresent,
          hours_worked: isPresent ? "8.00" : "0.00",
          employee: employeeId,
          chantier: Number(selectedChantierId)
        };
        await dispatch(markAttendance({ id: attendanceId, data: payload }));
      }
    } catch (error) {
      console.error("Action failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* ACTION MODALS */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <ConfirmationModal 
            config={modalConfig} 
            onClose={closeModal} 
            onConfirm={handleConfirm} 
          />
        )}
        {isReportsModalOpen && (
          <ReportsModal 
            isOpen={isReportsModalOpen}
            onClose={() => setIsReportsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                <UserCheck size={12} /> Pointage Journalier
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Suivi de <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Présence</span>
              </h1>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                Gérez les entrées et sorties des employés sur chantier pour la date du <span className="text-slate-900 font-bold">{selectedDate}</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              
              {/* --- REPORT BUTTON REMOVED FROM HERE --- */}

              {/* CHANTIER SELECTOR */}
              <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Building2 size={18} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chantier</label>
                    <select 
                      value={selectedChantierId}
                      onChange={(e) => setSelectedChantierId(Number(e.target.value))}
                      className="bg-transparent font-bold text-sm text-slate-900 outline-none cursor-pointer w-40"
                    >
                      <option value="">Choisir...</option>
                      {chantiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* DATE PICKER */}
              <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Calendar size={18} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                      className="bg-transparent font-bold text-sm text-slate-900 outline-none cursor-pointer w-32" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS DASHBOARD */}
          {selectedChantierId && (
            <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Effectif</span>
                <div className="text-2xl font-black text-slate-900">{stats.total}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-500 uppercase">Présents</span>
                <div className="text-2xl font-black text-emerald-600">{stats.present}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-500 uppercase">Absents</span>
                <div className="text-2xl font-black text-rose-600">{stats.absent}</div>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Progression</span>
                  <span>{Math.round(stats.progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="space-y-6">
          {!selectedChantierId ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Filter className="text-slate-300" size={40} />
              </div>
              <h3 className="text-slate-900 font-black text-xl mb-2">Aucun chantier sélectionné</h3>
              <p className="text-slate-400 text-base max-w-md text-center">
                Veuillez sélectionner un chantier ci-dessus pour commencer le pointage.
              </p>
            </div>
          ) : registerList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Users className="text-blue-400" size={40} />
              </div>
              <h3 className="text-slate-900 font-black text-xl mb-2">Aucun employé assigné</h3>
              <p className="text-slate-400 text-base">Vérifiez les affectations pour ce chantier.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {registerList.map(({ employee, attendance }) => {
                  const isPresent = attendance?.present === true;
                  const isAbsent = attendance?.present === false;
                  const isPending = attendance === null;
                  const isLocked = !!attendance;

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={employee.id}
                      className={`group relative overflow-hidden rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 border transition-all duration-300
                        ${isPresent ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-500/5' : ''}
                        ${isAbsent ? 'bg-white border-rose-100 shadow-xl shadow-rose-500/5' : ''}
                        ${isPending ? 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5' : ''}
                      `}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-2 transition-colors duration-300
                        ${isPresent ? 'bg-emerald-500' : isAbsent ? 'bg-rose-500' : 'bg-slate-100 group-hover:bg-blue-400'}
                      `}/>

                      <div className="flex items-center gap-5 w-full md:w-auto pl-4">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm transition-all duration-300
                          ${isPresent ? 'bg-emerald-50 text-emerald-600' : ''}
                          ${isAbsent ? 'bg-rose-50 text-rose-600' : ''}
                          ${isPending ? 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600' : ''}
                        `}>
                          {employee.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xl tracking-tight">
                            {employee.user?.first_name} <span className="text-slate-500 font-medium">{employee.user?.last_name}</span>
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                              <HardHat size={12} /> {employee.job_title || 'Ouvrier'}
                            </span>
                            <span className="text-xs text-slate-300 font-mono">#{employee.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => initiateAction('present', employee, attendance?.id)}
                          disabled={loadingAtt || isLocked}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300
                            ${isPresent 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-4 ring-emerald-500/20 cursor-default' 
                              : isLocked
                                ? 'bg-slate-50 border-2 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'}
                          `}
                        >
                          <Check size={18} strokeWidth={3} />
                          <span className="hidden sm:inline">Présent</span>
                        </button>

                        <button
                          onClick={() => initiateAction('absent', employee, attendance?.id)}
                          disabled={loadingAtt || isLocked}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300
                            ${isAbsent 
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105 ring-4 ring-rose-500/20 cursor-default' 
                              : isLocked
                                ? 'bg-slate-50 border-2 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50'}
                          `}
                        >
                          <X size={18} strokeWidth={3} />
                          <span className="hidden sm:inline">Absent</span>
                        </button>

                        {attendance && (
                          <button 
                            onClick={() => initiateAction('reset', employee, attendance.id)}
                            className="p-4 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-2xl transition-all shadow-sm"
                            title="Réinitialiser le statut"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};