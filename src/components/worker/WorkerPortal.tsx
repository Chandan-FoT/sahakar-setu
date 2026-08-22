import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Phone, MapPin, CheckCircle, 
  Award, Heart, Wallet, Volume2, QrCode, X
} from 'lucide-react';

export const WorkerPortal: React.FC = () => {
  const { 
    activeWorker, 
    bookings, 
    acceptBooking, 
    startJobWithOtp, 
    completeJob, 
    toggleWorkerAvailability, 
    welfareLedger,
    language,
    speakText,
    t 
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [digitalPassOpen, setDigitalPassOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('5000');
  const [loanPurpose, setLoanPurpose] = useState('Tool Replacement / Urgent Medical');
  const [loanSubmitted, setLoanSubmitted] = useState(false);

  const activeJob = bookings.find(b => 
    b.workerId === activeWorker.id && 
    (b.status === 'EN_ROUTE' || b.status === 'IN_PROGRESS')
  );

  const pendingDispatches = bookings.filter(b => 
    b.status === 'SEARCHING' || (b.status === 'MATCHED' && b.workerId === activeWorker.id)
  );

  const handleStartJob = (bookingId: string) => {
    const success = startJobWithOtp(bookingId, otpInput);
    if (!success) {
      setOtpError(true);
    } else {
      setOtpError(false);
      setOtpInput('');
    }
  };

  const speakJobDetails = (b: any) => {
    const speech = language === 'hi'
      ? `नया कार्य: ${b.serviceTitle}। स्थान: ${b.customerAddress}। शुद्ध आय: ₹${b.workerWage}। स्वीकार करने के लिए स्वीकार करें बटन दबाएं।`
      : `New Dispatch: ${b.serviceTitle} at ${b.customerAddress}. Net Direct Payout: ₹${b.workerWage}. Tap accept to proceed.`;
    speakText(speech);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Worker Shramik Profile & Availability Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Worker Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeWorker.avatar}
                alt={activeWorker.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-emerald-500 shadow-md"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold ${
                activeWorker.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
              }`}>
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {language === 'hi' && activeWorker.nameHi ? activeWorker.nameHi : activeWorker.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DigiLocker Verified</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                {activeWorker.trade} • {activeWorker.societyName}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  ★ {activeWorker.rating} ({activeWorker.reviewCount} reviews)
                </span>
                <span>•</span>
                <span className="font-medium">{activeWorker.completedJobs} Jobs Fulfilled</span>
                <span>•</span>
                <span className="font-bold text-slate-900">Coop ID: {activeWorker.societyId}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Worker */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => setDigitalPassOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>Digital ID Pass</span>
            </button>

            <button
              onClick={() => toggleWorkerAvailability(activeWorker.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeWorker.isAvailable
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeWorker.isAvailable ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
              <span>{activeWorker.isAvailable ? 'Status: ONLINE (GPS Live)' : 'Status: OFFLINE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Job Execution Card */}
      {activeJob && (
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  🚨 ACTIVE ASSIGNMENT #{activeJob.id}
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  {activeJob.bookingType === 'INSTANT_SOS' ? 'SOS Rapid Dispatch' : 'Scheduled'}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">
                {activeJob.serviceTitle}
              </h2>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm space-y-2 text-xs">
                <div className="flex items-start gap-2 text-emerald-100">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Customer Address:</strong> {activeJob.customerAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Customer Contact:</strong> {activeJob.customerName} ({activeJob.customerPhone})</span>
                </div>
                {activeJob.problemDescription && (
                  <p className="text-slate-300 italic pt-1 border-t border-white/10">
                    "{activeJob.problemDescription}"
                  </p>
                )}
              </div>

              {/* Step 1: Start OTP Handshake */}
              {activeJob.status === 'EN_ROUTE' && (
                <div className="bg-emerald-800/60 p-4 rounded-2xl border border-emerald-400/40 space-y-3">
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
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
                      className="w-32 bg-white text-slate-900 text-center font-black text-lg p-2 rounded-xl outline-none"
                    />
                    <button
                      onClick={() => handleStartJob(activeJob.id)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all"
                    >
                      Verify OTP & Start Work
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-red-300 font-bold">
                      Invalid OTP. Please ask the customer for their 4-digit Start OTP shown on their screen.
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Work In Progress & Completion */}
              {activeJob.status === 'IN_PROGRESS' && (
                <div className="bg-emerald-800/60 p-4 rounded-2xl border border-emerald-400/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Work in Progress — Safety Protocols Active</span>
                  </div>

                  <button
                    onClick={() => completeJob(activeJob.id)}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Job Finished & Collect UPI Payout (₹{activeJob.workerWage})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Financial Payout Summary */}
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between w-full lg:w-72">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Guaranteed Net Earnings</span>
                <div className="text-3xl font-black text-white mt-1">₹{activeJob.workerWage}</div>
                <p className="text-[11px] text-emerald-200 mt-1">88% Direct Payout to your Bank/UPI</p>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>+ Welfare Pool (6%):</span>
                  <span className="font-bold text-teal-300">₹{activeJob.welfareCut}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Society Fund (3%):</span>
                  <span>₹{activeJob.societyCut}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Live Dispatch Radar (Incoming Jobs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-black text-slate-900">
              {language === 'hi' ? 'नजदीकी कार्य रडार (Dispatch Radar)' : 'Live Hyperlocal Dispatch Radar'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">{pendingDispatches.length} Incoming Jobs</span>
        </div>

        {pendingDispatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Pending Dispatches in Your Sector</h3>
            <p className="text-xs text-slate-500 mt-0.5">You will hear an audio chime when a new household request arrives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDispatches.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border-2 border-emerald-500/80 p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-500" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      #{b.id}
                    </span>
                    <button
                      onClick={() => speakJobDetails(b)}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200"
                      title="Listen to job details"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{b.serviceTitle}</h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.customerAddress}</span>
                  </p>

                  <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Direct Wage</span>
                      <span className="text-base font-black text-emerald-700">₹{b.workerWage}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Welfare Cut</span>
                      <span className="text-xs font-bold text-teal-700">+ ₹{b.welfareCut}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => acceptBooking(b.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                  >
                    {t('acceptJob')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Worker Welfare & Social Security Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-bold mb-1">
              <Heart className="w-3.5 h-3.5 text-teal-600" />
              <span>Cooperative Social Security & Welfare Pool</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('welfareHeading')}</h2>
          </div>

          <button
            onClick={() => setLoanModalOpen(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all"
          >
            + Request Tool / Medical Micro-Grant
          </button>
        </div>

        {/* 3 Welfare Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-bold uppercase">Accident Insurance (PMSBY)</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹2,00,000</div>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
              ✓ Active Policy: {activeWorker.insurancePolicyNo}
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-sky-50 p-5 rounded-2xl border border-teal-200">
            <div className="flex items-center justify-between text-teal-800 mb-2">
              <span className="text-xs font-bold uppercase">Cooperative Pension Balance</span>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹{activeWorker.pensionSavings.toLocaleString()}</div>
            <p className="text-[11px] text-teal-700 mt-1 font-semibold">
              + ₹25 auto-contributed per job
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase">Emergency Distress Reserve</span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹{activeWorker.welfareBalance.toLocaleString()}</div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">
              Instant claim without paperwork
            </p>
          </div>
        </div>

        {/* Ledger Transaction History */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Welfare & Dividend Credits</h3>
          <div className="space-y-2">
            {welfareLedger.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    +₹
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{entry.description}</span>
                    <span className="text-[10px] text-slate-400">{entry.date} • {entry.id}</span>
                  </div>
                </div>
                <span className="font-black text-emerald-700 text-sm">+ ₹{entry.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Digital ID Card Modal */}
      {digitalPassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500" />

            <button
              onClick={() => setDigitalPassOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mt-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                OFFICIAL WORKER PASS
              </span>
            </div>

            <img
              src={activeWorker.avatar}
              alt={activeWorker.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 mx-auto shadow-md mb-2"
            />

            <h3 className="text-lg font-black text-slate-900">{activeWorker.name}</h3>
            <p className="text-xs font-bold text-emerald-700">{activeWorker.trade}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{activeWorker.societyName}</p>

            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <div className="w-32 h-32 bg-slate-900 text-white rounded-xl flex items-center justify-center p-2">
                <QrCode className="w-24 h-24 text-emerald-400" />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1 font-mono">SCAN TO VERIFY CREDENTIALS</span>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div><strong>Aadhaar Masked:</strong> {activeWorker.aadharMasked}</div>
              <div><strong>Coop Registry:</strong> {activeWorker.societyId}</div>
              <div><strong>Insurance:</strong> {activeWorker.insurancePolicyNo}</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Emergency Loan Modal */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative">
            <button
              onClick={() => setLoanModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">Request Cooperative Micro-Loan / Grant</h3>
            <p className="text-xs text-slate-500 mb-4">Interest-free tool & medical assistance for registered members.</p>

            {loanSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold">Request Disbursed to Primary Society</h4>
                <p className="text-xs">Approved via fast-track protocol. ₹{loanAmount} will be deposited to your UPI ID within 2 hours.</p>
                <button
                  onClick={() => {
                    setLoanModalOpen(false);
                    setLoanSubmitted(false);
                  }}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Amount Needed (₹)</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Purpose</label>
                  <select
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option>Tool Replacement / Upgraded Kit</option>
                    <option>Urgent Family Medical Emergency</option>
                    <option>Vehicle Repair / Commute Assistance</option>
                  </select>
                </div>

                <button
                  onClick={() => setLoanSubmitted(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Submit Instant Micro-Credit Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
