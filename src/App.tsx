import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks/hooks';
import { fetchProfile } from './store/slices/profileSlice';

// Pages & Layouts
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { PersistLogin } from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { DashboardLayout } from './fixed/DashboardLayout';
import { Departments } from './pages/Departments';
import { DepartmentAdminsPage } from './pages/DepartmentAdmins'; 
import { ClientsPage } from './pages/ClientsPage'; 
import { EmployeesPage } from './pages/Employees'; 
import { ChantiersPage } from './pages/ChantiersPage';
import { AssignmentsPage } from './pages/AssignmentsPage';

// --- ANALYTICS & DASHBOARD ---
import { DashboardPage } from './pages/DashboardPage'; 

// --- FACTURATION & PAIEMENTS ---
import { ItemsPage } from './pages/ItemsPage';
import InvoicesPage from './pages/InvoiceFormPage';
import { QuotesPage } from './pages/QuotesPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage'; 

// --- RH (RESSOURCES HUMAINES) ---
import { AttendancesPage } from './pages/AttendancesPage';
import { ContractsPage } from './pages/ContractsPage'; 
import { EOSBPage } from './pages/EOSBPage'; // <--- NEW IMPORT
import { PaymentsPage } from './pages/Paiement';

// --- DÉPENSES ---
import { ExpensesPage } from './pages/Expence';

// --- COMPOSANT DE CHARGEMENT AUTOMATIQUE ---
const ProfileLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken); 
  const { data: userProfile, isLoading } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (accessToken && !userProfile && !isLoading) {
      console.log("Extraction des données de l'entreprise depuis le profil...");
      dispatch(fetchProfile());
    }
  }, [accessToken, userProfile, isLoading, dispatch]);

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ProfileLoader>
        <Routes>
          
          {/* --- BLOC 1 : ROUTES PUBLIQUES --- */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          {/* --- BLOC 2 : COUCHE DE PERSISTANCE --- */}
          <Route element={<PersistLogin />}>
            
            {/* --- BLOC 3 : ROUTES PROTÉGÉES --- */}
            <Route element={<RequireAuth />}>
                
               <Route path="/" element={<Navigate to="/profile" replace />} />

               {/* Dashboard Principal */}
               <Route path="/dashboard" element={
                 <DashboardLayout>
                   <DashboardPage />
                 </DashboardLayout>
               } />

               {/* Paramètres */}
               <Route path="/profile" element={
                 <DashboardLayout>
                   <Settings />
                 </DashboardLayout>
               } />

               {/* Départements & Admin */}
               <Route path="/departments" element={
                 <DashboardLayout>
                   <Departments />
                 </DashboardLayout>
               } />

               <Route path="/department-admins" element={
                 <DashboardLayout>
                   <DepartmentAdminsPage />
                 </DashboardLayout>
               } />

               {/* Clients & Employés */}
               <Route path="/clients" element={
                 <DashboardLayout>
                   <ClientsPage />
                 </DashboardLayout>
               } />

               <Route path="/employees" element={
                 <DashboardLayout>
                   <EmployeesPage />
                 </DashboardLayout>
               } />

               {/* CONTRATS DE TRAVAIL */}
               <Route path="/contracts" element={
                 <DashboardLayout>
                   <ContractsPage />
                 </DashboardLayout>
               } />

               {/* NEW: SOLDE DE TOUT COMPTE (EOSB) */}
               <Route path="/eosb" element={
                 <DashboardLayout>
                   <EOSBPage />
                 </DashboardLayout>
               } />

               {/* Chantiers & Gestion de terrain */}
               <Route path="/chantiers" element={
                 <DashboardLayout>
                   <ChantiersPage />
                 </DashboardLayout>
               } />

               <Route path="/assignments" element={
                 <DashboardLayout>
                   <AssignmentsPage />
                 </DashboardLayout>
               } />

               {/* --- SECTION FACTURATION & ACHATS --- */}
               <Route path="/invoices" element={
                 <DashboardLayout>
                   <InvoicesPage />
                 </DashboardLayout>
               } />
               
               <Route path="/quotes" element={
                 <DashboardLayout>
                   <QuotesPage />
                 </DashboardLayout>
               } />

               <Route path="/purchase-orders" element={
                 <DashboardLayout>
                   <PurchaseOrdersPage />
                 </DashboardLayout>
               } />

               {/* RÈGLEMENTS */}
               <Route path="/payments" element={
                 <DashboardLayout>
                   <PaymentsPage />
                 </DashboardLayout>
               } />

               {/* DÉPENSES */}
               <Route path="/expenses" element={
                 <DashboardLayout>
                   <ExpensesPage />
                 </DashboardLayout>
               } />

               <Route path="/items" element={
                 <DashboardLayout>
                   <ItemsPage />
                 </DashboardLayout>
               } />

               {/* Pointage RH */}
               <Route path="/attendance" element={
                 <DashboardLayout>
                   <AttendancesPage />
                 </DashboardLayout>
               } />

            </Route>
          </Route>

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileLoader>
    </BrowserRouter>
  );
}

export default App;