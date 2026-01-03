import { useState } from "react";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS, Sidebar } from "./Sidebar";
import { Header } from "./Header";

// DashboardLayout.tsx
export const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentItem = NAV_ITEMS.find(item => item.path === location.pathname);
  const currentTitle = currentItem?.name || 'Dashboard';

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header 
          title={currentTitle} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};