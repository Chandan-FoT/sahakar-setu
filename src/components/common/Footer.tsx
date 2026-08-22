import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { language } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      {/* Fair Wage & Cooperative Pledge Section */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border-b border-emerald-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सहकारी निष्पक्ष मूल्य गारंटी' : 'The Cooperative Fair-Wage Guarantee'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {language === 'hi'
                ? 'प्रत्येक ₹1,000 की सेवा पर पारदर्शी वितरण'
                : 'Where every ₹1,000 of your booking goes:'}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400">88%</div>
              <div className="text-xs font-semibold text-white mt-1">Direct Worker Wage</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Instant UPI settlement</div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-teal-500/30 text-center">
              <div className="text-2xl font-black text-teal-400">6%</div>
              <div className="text-xs font-semibold text-white mt-1">Worker Welfare Fund</div>
              <div className="text-[11px] text-slate-400 mt-0.5">PMSBY & Pension pool</div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <div className="text-2xl font-black text-amber-400">3%</div>
              <div className="text-xs font-semibold text-white mt-1">Primary Society Fund</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tools, training & safety</div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <div className="text-2xl font-black text-sky-400">3%</div>
              <div className="text-xs font-semibold text-white mt-1">Platform Tech</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Server & AI hosting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <span className="text-lg font-bold text-white">SahakarSetu</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's first democratic, cooperative-owned digital service platform empowering verified trade craftsmen while protecting household trust.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registered under Multi-State Co-op Societies Act</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Service Trades</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Electrician & Inverter Repair</li>
              <li>• Plumber & Hydraulic Works</li>
              <li>• Senior Citizen & Patient Care</li>
              <li>• Carpenter & Precision Woodcraft</li>
              <li>• AC & Home Appliance Repair</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Social Security</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Pradhan Mantri Suraksha Bima (PMSBY)</li>
              <li>• Cooperative Micro-Pension Ledger</li>
              <li>• Emergency Distress Tool Loan</li>
              <li>• Skill India Trade Certification</li>
              <li>• Annual Cooperative Dividend Sharing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Governance & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• DigiLocker Identity Verification</li>
              <li>• 3-Tier Grievance Redressal Desk</li>
              <li>• Dynamic Rate Card Indexing</li>
              <li>• Privacy Phone Number Masking</li>
              <li>• 24/7 Cooperative SOS Dispatch</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 SahakarSetu. Built for Smart India Hackathon (SIH) — Public Sector Digital Infrastructure.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Rate Card Standards</span>
            <span>•</span>
            <span>Worker Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
