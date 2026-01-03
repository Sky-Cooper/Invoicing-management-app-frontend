import { configureStore } from '@reduxjs/toolkit';
import { injectStore } from '../api/client'; // Import de la fonction d'injection

// Reducers
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import departmentReducer from './slices/departmentSlice';
import deptAdminReducer from './slices/deptAdminSlice';
import clientReducer from './slices/clientSlice';
import employeeReducer from './slices/employeeSlice';
import chantierReducer from './slices/chantierSlice';
import assignmentReducer from './slices/assignmentSlice';
import attendanceReducer from './slices/attendanceSlice';
import itemReducer from './slices/itemSlice';
import invoiceReducer from './slices/invoiceSlice';
import analyticsReducer from './slices/analyticsSlice';
import expensesReducer from './slices/expensesSlice';
import quoteReducer from './slices/quoteSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';
import contractReducer from './slices/contractSlice';
import eosbReducer from './slices/eosbSlice';
export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    profile: profileReducer,
    departments: departmentReducer,
    deptAdmins: deptAdminReducer,
    clients: clientReducer,
    employees: employeeReducer,
    chantiers: chantierReducer,
    assignments: assignmentReducer,
    attendances: attendanceReducer,
    items: itemReducer,
    invoices: invoiceReducer,
    analytics: analyticsReducer,
    expenses: expensesReducer,
    quotes: quoteReducer,
    purchaseOrders: purchaseOrderReducer,
    contracts: contractReducer,
    eosb: eosbReducer,

  },
});

// --- L'INJECTION MAGIQUE ---
// On injecte l'instance du store dans le client API
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;