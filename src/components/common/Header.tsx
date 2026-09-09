import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Mic, Globe, Zap, LogOut, User, Wrench, Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    language, 
    setLanguage, 
    setVoiceModalOpen,
    emergencyMode,
    setEmergencyMode
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-zinc-900">SahakarSetu</span>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 block -mt-0.5">सहकार सेतु • National Co-op Marketplace</span>
            </div>
          </div>

          {/* Authenticated User Profile Status & Logout */}
          <div className="flex items-center gap-2.5">
            
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs">
                {currentUser.role === 'customer' && <User className="w-3.5 h-3.5 text-zinc-600" />}
                {currentUser.role === 'worker' && <Wrench className="w-3.5 h-3.5 text-emerald-600" />}
                {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                
                <span className="font-black text-zinc-900">{currentUser.fullName || currentUser.email}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white rounded border border-zinc-200 text-zinc-600">
                  {currentUser.role}
                </span>
              </div>
            )}

            {/* SOS Emergency Toggle */}
            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                emergencyMode 
                  ? 'bg-rose-50 border-rose-300 text-rose-800' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
              title="Filter by 30-min SOS emergency trades"
            >
              <Zap className={`w-3.5 h-3.5 ${emergencyMode ? 'text-rose-600 fill-rose-600 animate-pulse' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">SOS 30m</span>
            </button>

            {/* Voice Assistant */}
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-all"
              title="Voice Assistant (Web Speech AI)"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Logout Action */}
            {currentUser && (
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
