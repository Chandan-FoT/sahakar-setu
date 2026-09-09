import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Phone, MapPin, CheckCircle, 
  Award, Heart, Wallet, Volume2, QrCode, X, UserPlus, Users, AlertTriangle,
  ArrowRight, DollarSign, Clock, Check
} from 'lucide-react';

export const WorkerPortal: React.FC = () => {
  const { 
    activeWorker, 
    activeWorkerId,
    setActiveWorkerId,
    workers,
    jobRequests,
    submitWorkerBid,
    startJobWithOtp, 
    completeJob, 
    toggleWorkerAvailability, 
    welfareLedger,
    setWorkerRegisterModalOpen,
    language,
    speakText,
    t 
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [digitalPassOpen, setDigitalPassOpen] = useState(false);
  const [dismissedCompletedId, setDismissedCompletedId] = useState<string | null>(null);

  // Bidding State
  const [biddingJobId, setBiddingJobId] = useState<string | null>(null);
  const [bidPriceInput, setBidPriceInput] = useState<number>(450);
  const [bidEtaInput, setBidEtaInput] = useState<number>(15);
  const [bidNoteInput, setBidNoteInput] = useState<string>('');

  // Active Job assigned to this worker (En Route or In Progress)
  const activeJob = jobRequests.find(j => 
    (j.selectedWorkerId === activeWorker?.id || j.selectedWorkerId === activeWorker?.userId) && 
    (j.status === 'EN_ROUTE' || j.status === 'IN_PROGRESS')
  );

  // Completed Job awaiting settlement acknowledgement
  const completedJob = jobRequests.find(j => 
    (j.selectedWorkerId === activeWorker?.id || j.selectedWorkerId === activeWorker?.userId) && 
    j.status === 'COMPLETED' &&
    dismissedCompletedId !== j.id
  );

  // Smart Trade-Matching Filter: Ensures requests only go to workers of the required trade category
  const isJobMatchingMyTrade = (job: any): boolean => {
    if (!activeWorker?.trade) return true;
    
    const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const jobCat = normalize(job.serviceCategoryId || '');
    const jobTitle = normalize(job.serviceTitle || '');
    const wTrade = normalize(activeWorker.trade || '');
    const secondary = (activeWorker.secondaryTrades || []).map(normalize);
    const workerTrades = [wTrade, ...secondary];

    // 1. Direct or substring matching
    for (const t of workerTrades) {
      if (!t) continue;
      if (jobCat.includes(t) || t.includes(jobCat)) return true;
      if (jobTitle.includes(t) || t.includes(jobTitle)) return true;
    }

    // 2. Keyword category bucket matching
    const keywordMap: Record<string, string[]> = {
      electrician: ['electr', 'power', 'wire', 'mcb', 'switch', 'inverter', 'voltage', 'इलेक्ट्रीशियन', 'बिजली', 'विद्युत'],
      plumber: ['plumb', 'water', 'pipe', 'drain', 'leak', 'tank', 'tap', 'प्लंबर', 'नल', 'पानी'],
      carpenter: ['carpent', 'wood', 'furnitur', 'door', 'lock', 'bed', 'almirah', 'बढ़ई', 'फर्नीचर'],
      elderly_care: ['elder', 'care', 'patient', 'nurs', 'attendant', 'बुजुर्ग', 'मरीज', 'देखभाल'],
      appliance: ['appliance', 'ac', 'fridge', 'refrigerator', 'washing', 'microwave', 'कूलिंग', 'एसी'],
      cleaning: ['clean', 'sanitat', 'wash', 'sweep', 'dust', 'polishing', 'सफाई', 'स्वच्छता']
    };

    for (const [key, kws] of Object.entries(keywordMap)) {
      const jobInKey = jobCat.includes(key) || kws.some(kw => jobTitle.includes(kw));
      if (jobInKey) {
        const workerInKey = workerTrades.some(wt => wt.includes(key) || kws.some(kw => wt.includes(kw)));
        if (workerInKey) return true;
      }
    }

    return false;
  };

  // Open jobs strictly matching this worker's registered trade skill
  const openRadarJobs = jobRequests.filter(j => 
    (j.status === 'BIDDING_OPEN' || j.status === 'NEGOTIATING') &&
    j.selectedWorkerId !== activeWorker?.id &&
    isJobMatchingMyTrade(j)
  );

  const handleOpenBidModal = (job: any) => {
    setBiddingJobId(job.id);
    setBidPriceInput(job.initialBudget ? job.initialBudget + 50 : 400);
    setBidEtaInput(15);
    setBidNoteInput(`Available immediately. Certified ${activeWorker.trade}.`);
  };

  const handleSendBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingJobId) return;

    await submitWorkerBid({
      jobId: biddingJobId,
      proposedPrice: bidPriceInput,
      etaMinutes: bidEtaInput,
      bidderNote: bidNoteInput
    });
    setBiddingJobId(null);
  };

  const handleStartJob = async (jobId: string) => {
    const success = await startJobWithOtp(jobId, otpInput);
    if (!success) {
      setOtpError(true);
    } else {
      setOtpError(false);
      setOtpInput('');
    }
  };

  const speakJobDetails = (j: any) => {
    const speech = language === 'hi'
      ? `नया कार्य: ${j.serviceTitle}। स्थान: ${j.customerAddress}। ग्राहक का बजट: ₹${j.initialBudget}। काउंटर ऑफर दर्ज करें।`
      : `New Dispatch: ${j.serviceTitle} at ${j.customerAddress}. Customer budget: ₹${j.initialBudget}. Submit your bid.`;
    speakText(speech);
  };

  if (!activeWorker) {
    return <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading worker profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 font-sans">
      
      {/* 1. Worker Identity Card (Strict Personal Authenticated Worker Session) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={activeWorker.avatar}
            alt={activeWorker.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-zinc-900">{activeWorker.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeWorker.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeWorker.verificationStatus === 'VERIFIED' ? '✓ DigiLocker Verified' : '⏳ KYC Pending'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              <strong className="text-zinc-800">{activeWorker.trade}</strong> • {activeWorker.societyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={() => setDigitalPassOpen(true)}
            className="px-3.5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-zinc-600" />
            <span>Digital ID</span>
          </button>

          <button
            onClick={() => toggleWorkerAvailability(activeWorker.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              activeWorker.isAvailable ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeWorker.isAvailable ? 'bg-emerald-300 animate-ping' : 'bg-zinc-400'}`} />
            <span>{activeWorker.isAvailable ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Job Execution Card (If Assigned) */}
      {activeJob && (
        <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/50 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ACTIVE ASSIGNMENT #{activeJob.id}
                </span>
                <span className="text-xs text-zinc-400 font-bold">
                  {activeJob.bookingType === 'INSTANT_SOS' ? '⚡ 30-Min SOS Dispatch' : 'Scheduled'}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">
                {activeJob.serviceTitle}
              </h2>

              <div className="bg-zinc-800/80 p-3.5 rounded-2xl border border-zinc-700/80 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Customer Address:</strong> {activeJob.customerAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Contact:</strong> {activeJob.customerName} ({activeJob.customerPhone})</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-left sm:text-right flex flex-col justify-between w-full sm:w-56">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Guaranteed Net Earnings</span>
                <span className="text-2xl font-black text-emerald-400">₹{activeJob.workerWage}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">88% direct UPI payout</p>
              </div>
              <div className="text-[11px] text-teal-300 font-semibold pt-2 border-t border-zinc-700">
                + ₹{activeJob.welfareCut} (6% PMSBY Welfare)
              </div>
            </div>
          </div>

          {/* Start OTP Gate */}
          {activeJob.status === 'EN_ROUTE' && (
            <div className="bg-zinc-800 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Step 1: Enter Customer's 4-Digit Start OTP on Arrival
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError(false);
                  }}
                  placeholder="e.g. 7412"
                  className="w-32 bg-white text-zinc-900 text-center font-black text-lg p-2.5 rounded-xl outline-none"
                />
                <button
                  onClick={() => handleStartJob(activeJob.id)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all"
                >
                  Verify OTP & Start Work
                </button>
              </div>
              {otpError && (
                <p className="text-xs text-rose-400 font-bold">
                  Invalid OTP. Please ask the customer for the code on their screen.
                </p>
              )}
            </div>
          )}

          {/* In-Progress Job Completion Trigger */}
          {activeJob.status === 'IN_PROGRESS' && (
            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Work In Progress — Safety protocols active</span>
              </div>

              <button
                onClick={() => completeJob(activeJob.id)}
                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Job Finished (Collect ₹{activeJob.workerWage})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2.1. Completed Job Settlement & Social Security Acknowledgement Card */}
      {completedJob && !activeJob && (
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/80 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🎉 JOB COMPLETED & SETTLED
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  #{completedJob.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {completedJob.serviceTitle}
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Customer: {completedJob.customerName} ({completedJob.customerPhone}) • {completedJob.customerAddress}
              </p>
            </div>

            <button
              onClick={() => setDismissedCompletedId(completedJob.id)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Ready for Next Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/60">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Net Wage Credited (88%)</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{completedJob.workerWage}</span>
              <p className="text-[10px] text-emerald-200 mt-0.5">Instant UPI wallet deposit</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/60">
              <span className="text-[10px] uppercase font-bold text-teal-300 block">PMSBY Welfare Pool (6%)</span>
              <span className="text-2xl font-black text-teal-300 mt-1 block">+₹{completedJob.welfareCut}</span>
              <p className="text-[10px] text-teal-200 mt-0.5">₹2 Lakh accidental insurance</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/60">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Payment & Rating Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                  completedJob.paymentStatus === 'PAID' ? 'bg-emerald-400 text-zinc-950' : 'bg-amber-400 text-zinc-950'
                }`}>
                  {completedJob.paymentStatus === 'PAID' ? '✓ PAID via UPI' : 'PAYMENT PROCESSING'}
                </span>
              </div>
              <p className="text-[11px] text-amber-200 mt-1 font-semibold">
                {completedJob.rating ? `Customer Rating: ${'★'.repeat(completedJob.rating)}` : 'Awaiting 5★ Rating'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Dispatch Radar (Incoming Requests for Direct Bidding) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-black text-zinc-900">
              {language === 'hi' ? 'नजदीकी कार्य रडार (Live Dispatch Radar)' : 'Live Hyperlocal Dispatch Radar'}
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-bold">{openRadarJobs.length} Open Requests</span>
        </div>

        {openRadarJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
            <CheckCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-zinc-800">Radar Active — Listening for Household Requests</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">You will hear an audio alert when a nearby citizen posts a job in your sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openRadarJobs.map(job => {
              const myExistingBid = job.bids?.find(b => b.workerId === activeWorker.id);

              return (
                <div key={job.id} className="bg-white border border-zinc-200 hover:border-zinc-900 p-5 rounded-2xl transition-all shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                        #{job.id}
                      </span>
                      <button
                        onClick={() => speakJobDetails(job)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{language === 'hi' ? 'सुनें' : 'Listen'}</span>
                      </button>
                    </div>

                    <h3 className="text-sm font-black text-zinc-900">{job.serviceTitle}</h3>
                    <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{job.customerAddress}</span>
                    </p>

                    <div className="mt-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Customer Offer</span>
                        <span className="text-base font-black text-zinc-900">₹{job.initialBudget}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Net 88% Pay</span>
                        <span className="text-xs font-black text-emerald-700">₹{(job.initialBudget * 0.88).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sahakar Direct Bidding Actions */}
                  <div className="pt-2 border-t border-zinc-100">
                    {myExistingBid ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex-1">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Offer Placed: ₹{myExistingBid.proposedPrice}</span>
                        </div>
                        <button
                          onClick={() => handleOpenBidModal(job)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 transition-all"
                        >
                          Revise
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => submitWorkerBid({
                            jobId: job.id,
                            proposedPrice: job.initialBudget,
                            etaMinutes: 15,
                            bidderNote: 'I accept your offered price. Ready to start.'
                          })}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                          Accept ₹{job.initialBudget}
                        </button>

                        <button
                          onClick={() => handleOpenBidModal(job)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 transition-all"
                        >
                          Counter-Bid
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Worker Welfare & PMSBY Social Security Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200 mb-1">
              <Heart className="w-3 h-3 text-teal-600" />
              <span>Cooperative Social Security Pool</span>
            </div>
            <h2 className="text-lg font-black text-zinc-900">Worker Welfare & PMSBY Ledger</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Accident Policy (PMSBY)</span>
            <div className="text-xl font-black text-zinc-900 mt-1">₹2,00,000</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ {activeWorker.insurancePolicyNo}</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Coop Pension Balance</span>
            <div className="text-xl font-black text-zinc-900 mt-1">₹{activeWorker.pensionSavings.toLocaleString()}</div>
            <p className="text-[11px] text-teal-700 font-semibold mt-0.5">+ ₹25 auto per job</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Emergency Reserve</span>
            <div className="text-xl font-black text-zinc-900 mt-1">₹{activeWorker.welfareBalance.toLocaleString()}</div>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Instant paperless claim</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Recent Ledger Credits</span>
          {welfareLedger.map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 text-xs">
              <span className="text-zinc-700 font-medium">{entry.description}</span>
              <span className="font-black text-emerald-700">+ ₹{entry.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Direct Worker Counter-Bid Modal */}
      {biddingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-zinc-200 relative animate-in fade-in">
            <button
              onClick={() => setBiddingJobId(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-zinc-900 mb-1">Submit Counter-Offer</h3>
            <p className="text-xs text-zinc-500 mb-4">Set your proposed price and estimated arrival time.</p>

            <form onSubmit={handleSendBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Your Price (₹)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBidPriceInput(prev => Math.max(150, prev - 20))}
                    className="w-10 h-10 rounded-xl bg-zinc-100 font-bold text-sm text-zinc-800"
                  >
                    -20
                  </button>
                  <input
                    type="number"
                    value={bidPriceInput}
                    onChange={(e) => setBidPriceInput(Number(e.target.value))}
                    className="w-full text-center text-xl font-black p-2 rounded-xl border border-zinc-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setBidPriceInput(prev => prev + 20)}
                    className="w-10 h-10 rounded-xl bg-zinc-100 font-bold text-sm text-zinc-800"
                  >
                    +20
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Estimated Arrival (Minutes)</label>
                <select
                  value={bidEtaInput}
                  onChange={(e) => setBidEtaInput(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-semibold"
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Note to Customer</label>
                <input
                  type="text"
                  value={bidNoteInput}
                  onChange={(e) => setBidNoteInput(e.target.value)}
                  placeholder="e.g. Bringing spare parts in kit."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Send Counter-Offer (₹{bidPriceInput})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Digital Pass Modal */}
      {digitalPassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full p-6 border border-zinc-200 text-center relative">
            <button
              onClick={() => setDigitalPassOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={activeWorker.avatar}
              alt={activeWorker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 mx-auto shadow-md mb-2"
            />
            <h3 className="text-base font-black text-zinc-900">{activeWorker.name}</h3>
            <p className="text-xs text-emerald-700 font-bold">{activeWorker.trade}</p>
            <p className="text-[10px] text-zinc-500">{activeWorker.societyName}</p>

            <div className="my-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 inline-block">
              <QrCode className="w-24 h-24 text-zinc-800" />
            </div>

            <div className="text-[10px] text-zinc-600 space-y-0.5 text-left bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 font-mono">
              <div>Aadhaar: {activeWorker.aadharMasked}</div>
              <div>Policy: {activeWorker.insurancePolicyNo}</div>
              <div>Status: {activeWorker.verificationStatus}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
