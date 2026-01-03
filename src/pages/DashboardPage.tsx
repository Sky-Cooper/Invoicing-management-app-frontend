import React, { useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, 
} from 'recharts';
import { 
  TrendingUp, Wallet, FileText, ArrowUpRight, 
  Activity, Search, Bell, Settings as SettingsIcon, Globe, Smartphone, Store, UserCheck, ChevronRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { fetchBasicDashboard } from '../store/slices/analyticsSlice';

// Professional Palette: Indigo (Primary), Emerald (Success), Slate (Neutral)
const CHART_COLORS = ['#4f46e5', '#10b981', '#6366f1', '#0ea5e9', '#f59e0b'];

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { basic, isLoading } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchBasicDashboard());
  }, [dispatch]);

  const formatMAD = (v: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v);

  if (isLoading || !basic) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
        <Activity className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest text-xs">Initialisation TOURTRA...</p>
      </div>
    );
  }

  const { summary, project_performance, expense_by_category } = basic;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-left">
      
      {/* 1. MINIMAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics <span className="text-indigo-600">Performance</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">TOURTRA Construction v2.0</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 w-64 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" placeholder="Rechercher..." />
          </div>
          <IconButton icon={<Bell size={18} />} dot />
          <IconButton icon={<SettingsIcon size={18} />} />
        </div>
      </div>

      {/* 2. KPI GRID - FIXED OVERFLOW */}
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative z-10">
          
          <MainKpiCard 
            label="Chiffre d'Affaires" 
            value={formatMAD(summary.total_revenue)} 
            sub="Revenu total brut"
            trend="+12.5%"
          />
          
          <StatCard 
            label="Encaissé" 
            value={formatMAD(summary.total_collected)} 
            tag="Entrant" 
            color="emerald"
            icon={<Globe size={14} />}
          />

          <StatCard 
            label="Dépenses" 
            value={formatMAD(summary.total_expenses)} 
            tag="Sortant" 
            color="indigo"
            icon={<Smartphone size={14} />}
          />

          <StatCard 
            label="Créances" 
            value={formatMAD(summary.outstanding_balance)} 
            tag="Attente" 
            color="amber"
            icon={<Store size={14} />}
          />

          <StatCard 
            label="Volume" 
            value={`${summary.invoice_count} Fact.`} 
            tag="Activité" 
            color="slate"
            icon={<UserCheck size={14} />}
          />

        </div>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Project Performance (Indigo Bar Chart) */}
        <ChartContainer className="lg:col-span-8" title="Rentabilité des Chantiers" sub="Comparaison Revenus vs Coûts">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project_performance.slice(0, 6)} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="chantier_name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expenses" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4 justify-center border-t border-slate-50 pt-4">
            <LegendItem color="#4f46e5" label="Revenu" />
            <LegendItem color="#e2e8f0" label="Dépense" />
          </div>
        </ChartContainer>

        {/* Expense Breakdown (Pie) */}
        <ChartContainer className="lg:col-span-4" title="Structure des Coûts" sub="Répartition par type">
          <div className="h-64 relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expense_by_category} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="total_amount">
                  {expense_by_category.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-xs font-black text-slate-400 uppercase">Total</span>
               <span className="text-lg font-black text-indigo-600">{formatMAD(summary.total_expenses).split(',')[0]}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {expense_by_category.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-500 uppercase flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[idx]}} /> {item.category}
                </span>
                <span className="text-slate-900">{formatMAD(item.total_amount)}</span>
              </div>
            ))}
          </div>
        </ChartContainer>

      </div>
    </div>
  );
};

// --- STYLED SUB-COMPONENTS ---

const IconButton = ({ icon, dot }: any) => (
  <button className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
    {icon}
    {dot && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white" />}
  </button>
);

const MainKpiCard = ({ label, value, sub, trend }: any) => (
  <div className="flex flex-col justify-between p-2">
    <div>
      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{label}</span>
      <h3 className="text-2xl font-black text-slate-900 tracking-tighter mt-1 truncate">{value}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">{trend}</span>
        <span className="text-[10px] font-medium text-slate-400 truncate">{sub}</span>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, tag, color, icon }: any) => {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50",
    indigo: "text-indigo-600 bg-indigo-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-600 bg-slate-50"
  };
  return (
    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${colors[color]}`}>{tag}</span>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-lg font-black text-slate-800 tracking-tighter truncate">{value}</p>
      </div>
    </div>
  );
};

const ChartContainer = ({ title, sub, children, className }: any) => (
  <div className={`bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm ${className}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
      <ChevronRight className="text-slate-300" size={20} />
    </div>
    {children}
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
  </div>
);