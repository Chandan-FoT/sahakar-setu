import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Mic, Globe, Users, Briefcase, Building2 } from 'lucide-react';
import { Language } from '../../types';

export const Header: React.FC = () => {
  const { role, setRole, language, setLanguage, t, emergencyMode, setEmergencyMode, setVoiceModalOpen, bookings } = useApp();

  const activeBookingCount = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'mr', label: 'मराठी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'te', label: 'తెలుగు' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Official Federation Affiliation Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>🏛️ {t('govtAffiliation')}</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 text-xs">
            <span className="hidden sm:inline">✓ DigiLocker Verified</span>
            <span className="hidden sm:inline">✓ 100% Fair Wage Guarantee</span>
            <span className="bg-emerald-600/60 px-2 py-0.5 rounded text-[11px] font-semibold text-white">
              Coop ID: NLCF-IN-2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRole('customer')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-xl">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {language === 'hi' ? 'सहकार सेतु' : 'SahakarSetu'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  COOPERATIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Role Switcher Pill (Crucial for SIH Demo & Evaluation) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setRole('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'customer'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('consumerPortal')}</span>
              <span className="md:hidden">Citizen</span>
            </button>

            <button
              onClick={() => setRole('worker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                role === 'worker'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('workerPortal')}</span>
              <span className="md:hidden">Worker</span>
              {activeBookingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('adminPortal')}</span>
              <span className="md:hidden">Admin</span>
            </button>
          </div>

          {/* Quick Actions & Accessibility */}
          <div className="flex items-center gap-2.5">
            {/* Emergency SOS Toggle */}
            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                emergencyMode
                  ? 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/30 animate-pulse'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
              title="Toggle Emergency Rapid Dispatch Mode"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">SOS 30-Min</span>
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
              title="Open Multilingual Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 rounded-lg border border-slate-200 px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select display language"
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer pr-1"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
