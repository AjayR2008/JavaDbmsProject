import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './views/DashboardView';
import { StationsCatalogView } from './views/StationsCatalogView';
import { BookSlotView } from './views/BookSlotView';
import { AddStationView } from './views/AddStationView';
import { UpdateChargerView } from './views/UpdateChargerView';
import { RemoveStationView } from './views/RemoveStationView';
import { RolesMatrixView } from './views/RolesMatrixView';
import { SqlConsoleView } from './views/SqlConsoleView';
import { SwingGuideView } from './views/SwingGuideView';
import { CollegeSubmissionPdfView } from './views/CollegeSubmissionPdfView';
import { PrintReportModal } from './views/PrintReportModal';
import { AuthModal } from './views/AuthModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [preselectedChargerId, setPreselectedChargerId] = useState<number | undefined>(undefined);
  const [flashMsg, setFlashMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCityFilter, setPrintCityFilter] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleNavigate = (tab: string, meta?: any) => {
    setActiveTab(tab);
    if (meta?.preselectedChargerId) {
      setPreselectedChargerId(meta.preselectedChargerId);
    }
    if (meta?.flash) {
      setFlashMsg(meta.flash);
    } else {
      setFlashMsg(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPrintReport = (city: string) => {
    setPrintCityFilter(city);
    setIsPrintModalOpen(true);
  };

  if (activeTab === 'college-pdf') {
    return (
      <CollegeSubmissionPdfView
        onBack={() => handleNavigate('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} flashMsg={flashMsg} />
        )}
        {activeTab === 'stations' && (
          <StationsCatalogView
            onNavigate={handleNavigate}
            onOpenPrintReport={handleOpenPrintReport}
          />
        )}
        {activeTab === 'book' && (
          <BookSlotView
            initialChargerId={preselectedChargerId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'add-station' && (
          <AddStationView onNavigate={handleNavigate} />
        )}
        {activeTab === 'update-charger' && (
          <UpdateChargerView
            initialChargerId={preselectedChargerId}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'remove-station' && (
          <RemoveStationView onNavigate={handleNavigate} />
        )}
        {activeTab === 'roles' && (
          <RolesMatrixView />
        )}
        {activeTab === 'dbms' && (
          <SqlConsoleView onNavigate={handleNavigate} />
        )}
        {activeTab === 'swing-guide' && (
          <SwingGuideView />
        )}
      </main>

      <Footer />

      {/* Modals */}
      {isPrintModalOpen && (
        <PrintReportModal
          cityFilter={printCityFilter}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
};

export default App;
