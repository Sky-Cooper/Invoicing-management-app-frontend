import  { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity,  Bell, Settings as SettingsIcon, Globe, Smartphone, Store, UserCheck, ChevronRight, X
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchBasicDashboard } from '../store/slices/analyticsSlice';

// A more vibrant, diverse palette to avoid color/abbreviation confusion
const VIBRANT_PALETTE = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#f97316', // Orange
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {payload[0].name || payload[0].payload.chantier_name}
        </p>
        <p className="text-sm font-black text-indigo-600">
          {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { basic, isLoading } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchBasicDashboard());
  }, [dispatch]);

  const formatMAD = (v: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v);

  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (isLoading || !basic) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
        <Activity className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest text-xs">Chargement TOURTRA...</p>
      </div>
    );
  }

  const { summary, project_performance, expense_by_category } = basic;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 space-y-8 max-w-400 mx-auto text-left">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance <span className="text-indigo-600">Analytique</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">TOURTRA Construction Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <IconButton icon={<Bell size={18} />} dot />
          <IconButton icon={<SettingsIcon size={18} />} />
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative z-10">
          <MainKpiCard label="Chiffre d'Affaires" value={formatMAD(summary.total_revenue)} sub="Revenu brut" trend="+12.5%" />
          <StatCard label="Encaissé" value={formatCompact(summary.total_collected)} unit="DH" tag="Entrant" color="emerald" icon={<Globe size={14} />} />
          <StatCard label="Dépenses" value={formatCompact(summary.total_expenses)} unit="DH" tag="Sortant" color="indigo" icon={<Smartphone size={14} />} />
          <StatCard label="Créances" value={formatCompact(summary.outstanding_balance)} unit="DH" tag="Attente" color="amber" icon={<Store size={14} />} />
          <StatCard label="Volume" value={summary.invoice_count} unit="Fact." tag="Activité" color="slate" icon={<UserCheck size={14} />} />
        </div>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BAR CHART: Project Performance */}
        <ChartContainer 
          className="lg:col-span-8" 
          title="Rentabilité des Chantiers" 
          sub="Revenu vs Dépense"
          expandedContent={
            <div className="h-125">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={project_performance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="chantier_name" tick={{fontSize: 11, fontWeight: 700}} />
                  <YAxis tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  {/* High contrast pair for Bar Chart */}
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenu" />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Dépense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project_performance.slice(0, 6)} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="chantier_name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-6 justify-center border-t border-slate-50 pt-4">
            <LegendItem color="#6366f1" label="Revenu" />
            <LegendItem color="#f43f5e" label="Dépense" />
          </div>
        </ChartContainer>

        {/* PIE CHART: Expense Breakdown (VIBRANT) */}
        <ChartContainer 
          className="lg:col-span-4" 
          title="Structure des Coûts" 
          sub="Répartition colorée"
          expandedContent={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expense_by_category} innerRadius={100} outerRadius={140} paddingAngle={5} dataKey="total_amount" nameKey="category" stroke="none">
                        {expense_by_category.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={VIBRANT_PALETTE[index % VIBRANT_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-3">
                  {expense_by_category.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length]}} />
                        <span className="font-bold text-slate-700 text-xs">{item.category}</span>
                      </div>
                      <span className="font-black text-indigo-600 text-xs">{formatMAD(item.total_amount)}</span>
                    </div>
                  ))}
               </div>
            </div>
          }
        >
          <div className="h-72 relative mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={expense_by_category} 
                    innerRadius={75} 
                    outerRadius={100} 
                    paddingAngle={8} 
                    dataKey="total_amount" 
                    nameKey="category" 
                    stroke="none"
                >
                  {expense_by_category.map((_, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={VIBRANT_PALETTE[index % VIBRANT_PALETTE.length]} 
                        className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Dépenses</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatCompact(summary.total_expenses)}</span>
                  <span className="text-[10px] font-bold text-slate-400">DH</span>
               </div>
            </div>
          </div>
          <div className="space-y-3 mt-6 border-t border-slate-50 pt-6">
            {expense_by_category.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length]}} /> 
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tight truncate max-w-30">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{formatCompact(item.total_amount)}</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-1">DH</span>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ChartContainer = ({ title, sub, children, className, expandedContent }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative transition-all hover:shadow-md ${className}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
          </div>
          <button onClick={() => setIsExpanded(true)} className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all group">
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>
        {children}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#F8FAFC] w-full max-w-6xl max-h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
              </div>
              <button onClick={() => setIsExpanded(false)} className="p-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-3xl transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 md:p-12 overflow-y-auto flex-1">
              {expandedContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const IconButton = ({ icon, dot }: any) => (
  <button className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
    {icon}
    {dot && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />}
  </button>
);

const MainKpiCard = ({ label, value, sub, trend }: any) => (
  <div className="flex flex-col justify-between p-2">
    <div>
      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{label}</span>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1 truncate">{value}</h3>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{trend}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{sub}</span>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, unit, tag, color, icon }: any) => {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100"
  };
  return (
    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${colors[color]} shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${colors[color]}`}>{tag}</span>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tighter truncate">
            {value} <small className="text-xs text-slate-400 font-black">{unit}</small>
        </p>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2.5">
    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
  </div>
);