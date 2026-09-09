import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { WorkerRegisterModal } from './components/worker/WorkerRegisterModal';
import { AuthPage } from './components/auth/AuthPage';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { AdminPortal } from './components/admin/AdminPortal';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();

  // 1. Unauthenticated Gateway: Render Auth Page if no user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
        <Header />
        <VoiceAssistantModal />
        <main className="flex-1">
          <AuthPage />
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Strict Role-Isolated Protected Portals
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
      <Header />
      <VoiceAssistantModal />
      <WorkerRegisterModal />

      <main className="flex-1">
        {currentUser.role === 'customer' && <CustomerPortal />}
        {currentUser.role === 'worker' && <WorkerPortal />}
        {currentUser.role === 'admin' && <AdminPortal />}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
