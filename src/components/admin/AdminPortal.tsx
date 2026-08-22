import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, ShieldCheck, AlertTriangle, 
  Sparkles, CheckCircle2, Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPortal: React.FC = () => {
  const { 
    workers, 
    bookings, 
    forecasts, 
    disputes, 
    approveWorkerKYC, 
    resolveDispute,
    categories
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ai_forecast' | 'kyc_queue' | 'rate_governance' | 'disputes'>('ai_forecast');
  const [mobilizedDistricts, setMobilizedDistricts] = useState<Record<string, boolean>>({});

  const pendingWorkers = workers.filter(w => w.verificationStatus === 'PENDING');

  const totalFairWagesDisbursed = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + b.workerWage, 342480);

  const totalWelfareAccumulated = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + b.welfareCut, 241850);

  const handleMobilize = (forecastId: string) => {
    setMobilizedDistricts(prev => ({ ...prev, [forecastId]: true }));
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Federation Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Apex Board • National Labour Cooperative Federation of India (NLCF)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Cooperative Governance & Demand AI Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Real-time monitoring of fair wage distribution, society compliance, and predictive AI dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-2 rounded-2xl text-xs">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-200 font-semibold">All 18 District Societies Operational</span>
          </div>
        </div>

        {/* Macro KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Workforce</span>
            <div className="text-2xl font-black text-white mt-1">1,248</div>
            <p className="text-[11px] text-emerald-400 mt-0.5">+14 pending KYC approval</p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Bookings</span>
            <div className="text-2xl font-black text-white mt-1">382</div>
            <p className="text-[11px] text-emerald-400 mt-0.5">99.2% on-time arrival rate</p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fair Wages Disbursed</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalFairWagesDisbursed.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">88% direct to worker bank</p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Welfare Fund Pool</span>
            <div className="text-2xl font-black text-teal-400 mt-1">₹{totalWelfareAccumulated.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">100% PMSBY insured workers</p>
          </div>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ai_forecast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ai_forecast'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Demand Forecasting & Mobilization</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc_queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'kyc_queue'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Worker KYC & Society Endorsement</span>
          {pendingWorkers.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('rate_governance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rate_governance'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Standard Rate Card & Wage Governance</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'disputes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Grievance & Dispute Arbitrator ({disputes.filter(d => d.status !== 'RESOLVED').length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* Tab 1: AI Demand Forecasting */}
      {activeTab === 'ai_forecast' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Predictive Weather & Surge Demand Intelligence</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI models analyze meteorological telemetry, grid data, and historical records to prevent workforce shortages.
                </p>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                Model: LightGBM-Demand v2.4 (94.8% Accuracy)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {forecasts.map(fc => {
                const isMobilized = mobilizedDistricts[fc.id];
                return (
                  <div key={fc.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                          {fc.district}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          fc.surgeLevel === 'HIGH_ALERT' ? 'bg-red-100 text-red-800 border border-red-300' :
                          fc.surgeLevel === 'ELEVATED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {fc.surgeLevel.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{fc.trade}</h4>

                      {fc.weatherTrigger && (
                        <div className="my-2 p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{fc.weatherTrigger}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed mt-2">{fc.reason}</p>

                      <div className="my-4 bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Available Workers:</span>
                          <span className="font-bold text-slate-900">{fc.currentAvailableWorkers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Predicted Spike (Next 48h):</span>
                          <span className="font-bold text-red-600">{fc.predictedDemand} requests</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                        <strong>AI Recommendation:</strong> {fc.recommendation}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleMobilize(fc.id)}
                        disabled={isMobilized}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isMobilized
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        }`}
                      >
                        {isMobilized ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Mobilization Vouchers Dispatched</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Mobilize {fc.recommendedMobilization || 15} Cooperative Workers</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Worker KYC Queue */}
      {activeTab === 'kyc_queue' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">DigiLocker & Primary Society Verification Queue</h3>
            <p className="text-xs text-slate-500">
              Verify identity documents, Skill India certificates, and police clearance endorsements before worker activation.
            </p>
          </div>

          <div className="space-y-4">
            {workers.map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 gap-4">
                <div className="flex items-center gap-3.5">
                  <img src={w.avatar} alt={w.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{w.name}</h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        w.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{w.trade} • {w.societyName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Aadhaar: {w.aadharMasked}</span>
                      <span>•</span>
                      <span>Certs: {w.skillCertifications.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {w.verificationStatus === 'PENDING' ? (
                    <button
                      onClick={() => approveWorkerKYC(w.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      Approve DigiLocker KYC
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Endorsed & Active</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Standard Rate Card Governance */}
      {activeTab === 'rate_governance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Fair Minimum Wage & Price Floor Index</h3>
              <p className="text-xs text-slate-500">
                District-level standardized rate ceilings preventing private aggregator price dumping.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              Annual Cost-of-Living Index: 2026 Revision Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{cat.title}</h4>
                  <span className="text-xs font-black text-emerald-700">Min Inspection: ₹{cat.baseInspectionFee}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {cat.standardItems.map(item => (
                    <div key={item.id} className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span>{item.name}</span>
                      <span className="font-bold text-slate-800">₹{item.baseRate} / {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Grievance & Disputes */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">3-Tier Cooperative Arbitration & Grievance Desk</h3>
            <p className="text-xs text-slate-500">
              Democratic dispute resolution protecting both citizen consumers and craftsman dignity.
            </p>
          </div>

          <div className="space-y-4">
            {disputes.map(d => (
              <div key={d.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                      #{d.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700">Ref Booking #{d.bookingId}</span>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>Customer:</strong> {d.customerName}</div>
                  <div><strong>Worker:</strong> {d.workerName}</div>
                  <div><strong>Issue Category:</strong> {d.issueCategory}</div>
                  <div><strong>Filed Date:</strong> {d.filedDate}</div>
                </div>

                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                  "{d.description}"
                </p>

                {d.resolutionNote && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <strong>Arbitration Finding:</strong> {d.resolutionNote}
                  </div>
                )}

                {d.status !== 'RESOLVED' && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => resolveDispute(d.id, 'Goodwill settlement approved via Cooperative Mediation Pool. Both parties satisfied.')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      Approve Society Mediation Settlement
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
