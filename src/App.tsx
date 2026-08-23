import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { WorkerRegisterModal } from './components/worker/WorkerRegisterModal';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { AdminPortal } from './components/admin/AdminPortal';

const MainLayout: React.FC = () => {
  const { role } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />
      <VoiceAssistantModal />
      <WorkerRegisterModal />

      <main className="flex-1">
        {role === 'customer' && <CustomerPortal />}
        {role === 'worker' && <WorkerPortal />}
        {role === 'admin' && <AdminPortal />}
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
