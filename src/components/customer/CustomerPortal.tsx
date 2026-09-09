import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceCategory, JobRequest } from '../../types/marketplace';
import { 
  Zap, Droplets, Hammer, HeartHandshake, Tv, Sparkles, 
  Search, ShieldCheck, Clock, MapPin, Phone, ArrowRight, 
  QrCode, X, User, Edit3, Check, DollarSign, MessageSquare, AlertCircle,
  Copy, CheckCircle2, Star, Download, Printer, RefreshCw, Volume2, Shield
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { 
    categories, 
    jobRequests,
    activeCustomerJob,
    emergencyMode, 
    setEmergencyMode, 
    postJobOffer,
    acceptWorkerBid,
    counterCustomerOffer,
    settlePayment, 
    submitRating, 
    dismissActiveJob,
    currentCustomer,
    setCurrentCustomer,
    language, 
    speakText,
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [biddingModalOpen, setBiddingModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('electrician');
  const [problemText, setProblemText] = useState('');
  const [proposedBudget, setProposedBudget] = useState(350);
  const [bookingUrgency, setBookingUrgency] = useState<'INSTANT_SOS' | 'SCHEDULED'>('INSTANT_SOS');
  const [customAddress, setCustomAddress] = useState(currentCustomer.address);
  const [editingProfile, setEditingProfile] = useState(false);

  // Counter Modal State
  const [counterModalBid, setCounterModalBid] = useState<{ jobId: string; bidId: string; currentPrice: number } | null>(null);
  const [customCounterAmount, setCustomCounterAmount] = useState(400);

  // Payment & Rating Modal State
  const [activePaymentJob, setActivePaymentJob] = useState<JobRequest | null>(null);
  const [ratingJob, setRatingJob] = useState<JobRequest | null>(null);
  const [stars, setStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Expert Work']);
  const [reviewComment, setReviewComment] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Live Timer for Work in Progress
  const [workElapsedSeconds, setWorkElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (activeCustomerJob?.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setWorkElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setWorkElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCustomerJob?.status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyOtp = (otp: string) => {
    try {
      navigator.clipboard.writeText(otp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    } catch (e) {}
  };

  const toggleReviewTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getLifecycleStep = (job: JobRequest | undefined) => {
    if (!job) return 0;
    if (job.status === 'BIDDING_OPEN' || job.status === 'NEGOTIATING') return 1;
    if (job.status === 'DEAL_LOCKED' || job.status === 'EN_ROUTE') return 2;
    if (job.status === 'IN_PROGRESS') return 3;
    if (job.status === 'COMPLETED' && job.paymentStatus !== 'PAID') return 4;
    if (job.status === 'COMPLETED' && job.paymentStatus === 'PAID') return 5;
    return 1;
  };

  const currentStep = getLifecycleStep(activeCustomerJob);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-amber-800" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'Tv': return <Tv className="w-5 h-5 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600" />;
      default: return <Zap className="w-5 h-5 text-emerald-600" />;
    }
  };

  const openNewJobForCategory = (cat: ServiceCategory) => {
    setSelectedCatId(cat.id);
    setProposedBudget(cat.baseInspectionFee + 150);
    setProblemText('');
    setBiddingModalOpen(true);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    await postJobOffer({
      categoryId: selectedCatId,
      problemDescription: problemText || 'General maintenance/repair needed.',
      initialBudget: proposedBudget,
      customerAddress: customAddress || currentCustomer.address,
      bookingType: bookingUrgency
    });
    setBiddingModalOpen(false);
  };

  const filteredCategories = categories.filter(c => {
    const matches = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.titleHi.includes(searchQuery) ||
                    c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return emergencyMode ? matches && c.emergencyAvailable : matches;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 font-sans">
      
      {/* 1. Minimalist Customer Identity Bar */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-sm">
            <User className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Citizen:</span>
              <span className="text-sm font-black text-zinc-900">{currentCustomer.name || 'Citizen Member'}</span>
              {currentCustomer.phone && <span className="text-xs text-zinc-500 font-mono">({currentCustomer.phone})</span>}
            </div>
            <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{currentCustomer.address || 'Location not set — click Edit Address'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
          <span>{editingProfile ? 'Close' : 'Edit Address'}</span>
        </button>
      </div>

      {/* Customer Quick Edit Panel */}
      {editingProfile && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 animate-in fade-in space-y-3">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Update Location & Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={currentCustomer.name}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
              className="text-xs p-2.5 rounded-xl border border-zinc-300 bg-white outline-none focus:border-zinc-900 font-medium"
              placeholder="Full Name"
            />
            <input
              type="text"
              value={currentCustomer.phone}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
              className="text-xs p-2.5 rounded-xl border border-zinc-300 bg-white outline-none focus:border-zinc-900 font-medium"
              placeholder="Phone Number"
            />
            <input
              type="text"
              value={currentCustomer.address}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
              className="text-xs p-2.5 rounded-xl border border-zinc-300 bg-white outline-none focus:border-zinc-900 font-medium"
              placeholder="Delivery / Home Address"
            />
          </div>
          <button
            onClick={() => setEditingProfile(false)}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-all"
          >
            Save Address
          </button>
        </div>
      )}

      {/* 2. Sahakar Active Dynamic 5-Stage Lifecycle Room (If a Job Request Exists) */}
      {activeCustomerJob && (
        <div className="bg-white border-2 border-emerald-600/70 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden space-y-6 animate-in fade-in">
          
          {/* 5-Step Visual Stepper Bar */}
          <div className="space-y-3 pb-5 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg">
                🤝 Sahakar Negotiation Room #{activeCustomerJob.id}
              </span>
              <span className="text-xs font-bold text-zinc-500">
                Step {currentStep} of 5
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { step: 1, label: '1. Bidding' },
                { step: 2, label: '2. En Route' },
                { step: 3, label: '3. In Progress' },
                { step: 4, label: '4. Payment' },
                { step: 5, label: '5. Invoice' }
              ].map(s => (
                <div key={s.step} className="space-y-1">
                  <div className={`h-2 rounded-full transition-all ${
                    currentStep >= s.step ? 'bg-emerald-600' : 'bg-zinc-200'
                  }`} />
                  <span className={`text-[10px] font-bold block truncate text-center ${
                    currentStep === s.step ? 'text-emerald-800 font-black' : currentStep > s.step ? 'text-zinc-700' : 'text-zinc-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Job Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                {activeCustomerJob.serviceTitle}
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                "{activeCustomerJob.problemDescription}" • <span className="font-semibold text-zinc-800">{activeCustomerJob.customerAddress}</span>
              </p>
            </div>

            <div className="text-left sm:text-right bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agreed / Proposed Price</span>
              <span className="text-2xl font-black text-zinc-900">₹{activeCustomerJob.agreedPrice || activeCustomerJob.initialBudget}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* STAGE 1: BIDDING & NEGOTIATION */}
          {/* ========================================================= */}
          {(activeCustomerJob.status === 'BIDDING_OPEN' || activeCustomerJob.status === 'NEGOTIATING') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Incoming Offers from Nearby Craftsmen ({activeCustomerJob.bids?.length || 0})</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-medium">Bids update in real-time</span>
              </div>

              {(!activeCustomerJob.bids || activeCustomerJob.bids.length === 0) ? (
                <div className="bg-zinc-50 rounded-2xl p-6 text-center border border-dashed border-zinc-200">
                  <Clock className="w-7 h-7 text-zinc-400 mx-auto mb-2 animate-spin" />
                  <h4 className="text-xs font-bold text-zinc-800">Broadcasting your request to online workers...</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Technicians within 3 km are reviewing your ₹{activeCustomerJob.initialBudget} offer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeCustomerJob.bids.map(bid => (
                    <div key={bid.id} className="bg-zinc-50/80 hover:bg-white border border-zinc-200 hover:border-emerald-500 p-4 rounded-2xl transition-all shadow-sm flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={bid.workerAvatar} alt={bid.workerName} className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shadow-sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-zinc-900">{bid.workerName}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <p className="text-[11px] text-zinc-500">{bid.workerTrade} • ★ {bid.workerRating}</p>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              ETA: ~{bid.estimatedArrivalMinutes} mins
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">Bid Offer</span>
                          <span className="text-lg font-black text-emerald-700">₹{bid.proposedPrice}</span>
                        </div>
                      </div>

                      {bid.bidderNote && (
                        <p className="text-[11px] text-zinc-600 italic bg-white p-2 rounded-lg border border-zinc-100">
                          "{bid.bidderNote}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60">
                        <button
                          onClick={() => acceptWorkerBid(activeCustomerJob.id, bid.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                          Accept ₹{bid.proposedPrice} Deal
                        </button>

                        <button
                          onClick={() => {
                            setCounterModalBid({ jobId: activeCustomerJob.id, bidId: bid.id, currentPrice: bid.proposedPrice });
                            setCustomCounterAmount(bid.proposedPrice - 20);
                          }}
                          className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-all"
                        >
                          Counter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 2: WORKER EN ROUTE & START OTP */}
          {/* ========================================================= */}
          {(activeCustomerJob.status === 'EN_ROUTE' || activeCustomerJob.status === 'DEAL_LOCKED') && (
            <div className="space-y-4 animate-in fade-in">
              {/* Assigned Craftsman Identity Card */}
              {(() => {
                const wProfile = activeCustomerJob.selectedWorker;
                const acceptedBid = activeCustomerJob.bids?.find(b => b.workerId === activeCustomerJob.selectedWorkerId) || 
                                    activeCustomerJob.bids?.find(b => b.status === 'ACCEPTED');

                const name = wProfile?.name || acceptedBid?.workerName || 'Assigned Craftsman';
                const avatar = wProfile?.avatar || acceptedBid?.workerAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80';
                const trade = wProfile?.trade || acceptedBid?.workerTrade || 'Certified Technician';
                const society = wProfile?.societyName || acceptedBid?.workerSociety || 'Labour Cooperative Federation';
                const rating = wProfile?.rating || acceptedBid?.workerRating || 5.0;
                const phone = wProfile?.phone || '+91 98765 43210';

                return (
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img src={avatar} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-900">{name}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>DigiLocker KYC</span>
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium">{trade} • {society}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                          <span>★ {rating} Rating</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">En Route to your address (~10 mins)</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${phone}`}
                      className="px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {name.split(' ')[0]}</span>
                    </a>
                  </div>
                );
              })()}

              {/* Start OTP Display Card */}
              <div className="bg-emerald-50 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200/80 px-2.5 py-0.5 rounded inline-block mb-1">
                      🔒 Step 2: 4-Digit Start OTP
                    </span>
                    <h3 className="text-sm font-black text-zinc-900">
                      Share this code with the craftsman on arrival
                    </h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      The craftsman must enter this 4-digit code in their portal to verify authentication and begin the work.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="bg-white border-2 border-emerald-600 px-4 py-2 rounded-xl text-3xl font-black text-emerald-800 tracking-widest font-mono shadow-sm">
                      {activeCustomerJob.startOtp}
                    </div>

                    <button
                      onClick={() => handleCopyOtp(activeCustomerJob.startOtp)}
                      className="p-3 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 transition-all"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => speakText(`Your start O T P is ${activeCustomerJob.startOtp}`)}
                      className="p-3 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 transition-all"
                      title="Listen to OTP"
                    >
                      <Volume2 className="w-5 h-5 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Arrival Verification Protocol Notice */}
                <div className="pt-3 border-t border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Share this 4-digit security code with the service partner upon physical arrival to authorize the repair.</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 3: WORK IN PROGRESS */}
          {/* ========================================================= */}
          {activeCustomerJob.status === 'IN_PROGRESS' && (
            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-6 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-200 text-sky-950 text-xs font-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-ping" />
                    <span>WORK IN PROGRESS • REPAIR ACTIVE</span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 mt-2">
                    Craftsman is on-site performing diagnosis and repair
                  </h3>
                  <p className="text-xs text-zinc-600">
                    OTP was verified successfully. All operations are protected under the Sahakar Cooperative Safety Guarantee.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-sky-200 text-center shadow-sm w-full sm:w-44">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Elapsed Work Time</span>
                  <span className="text-2xl font-black text-sky-900 font-mono">
                    {formatTimer(workElapsedSeconds || 145)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">● Live Timer</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-sky-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>3-Tier Guarantee:</strong> 30-day rework warranty + ₹2 Lakh insurance cover.</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-sky-800 font-semibold px-2.5 py-1 bg-sky-50 rounded-lg border border-sky-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Service Partner Active</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 4: WORK COMPLETED & PAYMENT DUE */}
          {/* ========================================================= */}
          {activeCustomerJob.status === 'COMPLETED' && activeCustomerJob.paymentStatus !== 'PAID' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded inline-block mb-1">
                    🎉 WORK COMPLETED • PAYMENT DUE
                  </span>
                  <h3 className="text-lg font-black text-zinc-900">
                    Job Finished Successfully! Settle Fair-Wage Bill
                  </h3>
                  <p className="text-xs text-zinc-600">
                    100% transparent cooperative split breakdown benchmarked by the National Labour Cooperative Federation.
                  </p>
                </div>

                <div className="text-left sm:text-right bg-white p-3 rounded-2xl border border-amber-200 shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Bill</span>
                  <p className="text-2xl font-black text-zinc-950">₹{activeCustomerJob.agreedPrice}</p>
                </div>
              </div>

              {/* 88-6-3-3 Transparent Cooperative Split Ledger */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                <h4 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] border-b border-zinc-100 pb-1.5">
                  Transparent Split Breakdown (सहकार न्यायसंगत भुगतान)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-700">
                  <div className="flex justify-between p-2 rounded-lg bg-zinc-50">
                    <span>Direct Craftsman Wage (88%):</span>
                    <strong className="text-zinc-900 font-bold">₹{activeCustomerJob.workerWage}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-teal-50 text-teal-900">
                    <span>PMSBY Accident Insurance (6%):</span>
                    <strong className="font-bold">₹{activeCustomerJob.welfareCut}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-amber-50 text-amber-900">
                    <span>Coop Society Welfare Pool (3%):</span>
                    <strong className="font-bold">₹{activeCustomerJob.societyCut}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-sky-50 text-sky-900">
                    <span>Platform Tech Infrastructure (3%):</span>
                    <strong className="font-bold">₹{activeCustomerJob.platformCut}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setActivePaymentJob(activeCustomerJob)}
                  className="w-full sm:w-auto flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pay ₹{activeCustomerJob.agreedPrice} via BharatQR / Instant UPI</span>
                </button>

                <button
                  onClick={() => settlePayment(activeCustomerJob.id, 'CASH')}
                  className="w-full sm:w-auto px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4 text-zinc-600" />
                  <span>I Paid Cash to Worker</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 5: RATING & OFFICIAL TAX INVOICE */}
          {/* ========================================================= */}
          {activeCustomerJob.status === 'COMPLETED' && activeCustomerJob.paymentStatus === 'PAID' && (
            <div className="bg-emerald-50/70 border-2 border-emerald-500 rounded-2xl p-6 space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PAYMENT SETTLED • SERVICE CERTIFIED</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mt-1">
                    Job Completed & Verified
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Payment of ₹{activeCustomerJob.agreedPrice} was credited directly to the craftsman's cooperative wallet.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    onClick={() => dismissActiveJob(activeCustomerJob.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Book Next Service</span>
                  </button>
                </div>
              </div>

              {/* 5-Star Rating Section (If Not Yet Rated) */}
              {!activeCustomerJob.rating ? (
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-black text-zinc-900">Rate Your Cooperative Craftsman</h4>
                    <p className="text-xs text-zinc-500">Your feedback builds social trust in the Labour Cooperative Federation.</p>
                    
                    <div className="flex justify-center gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          onClick={() => setStars(s)}
                          className={`text-3xl transition-transform hover:scale-125 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Feedback Tags */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Punctual ⏱️', 'Skill Expert 🛠️', 'Polite & Respectful 🤝', 'Fair Pricing 💰', 'Clean Work 🧹'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleReviewTag(tag)}
                        className={`text-xs px-3 py-1 rounded-xl border transition-all ${
                          selectedTags.includes(tag) ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write a brief review regarding work quality, timeliness, etc."
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:border-zinc-900"
                    />
                    <button
                      onClick={() => {
                        const feedback = `${selectedTags.join(', ')}. ${reviewComment}`.trim();
                        submitRating(activeCustomerJob.id, stars, feedback || 'Excellent cooperative service.');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Submit {stars}★ Rating
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>Your Rating:</strong> {'★'.repeat(activeCustomerJob.rating)} — "{activeCustomerJob.reviewComment}"</span>
                  </div>
                </div>
              )}

              {/* Official Cooperative Tax Invoice Document View */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-300 shadow-sm text-xs space-y-4 font-mono">
                <div className="flex justify-between items-start border-b border-zinc-200 pb-3">
                  <div>
                    <h4 className="font-black text-sm text-zinc-900 font-sans">SAHAKAR SETU • OFFICIAL CO-OP INVOICE</h4>
                    <p className="text-[10px] text-zinc-500 font-sans">National Labour Cooperative Federation • Reg: DL-COOP-2026-091</p>
                    <p className="text-[10px] text-emerald-800 font-bold font-sans">GST Exempt under Section 12A (Labour Co-op Act)</p>
                  </div>
                  <div className="text-right text-[11px] text-zinc-600 font-sans">
                    <div><strong>Invoice No:</strong> INV-{activeCustomerJob.id.replace('JOB-', '')}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] font-sans">
                  <div>
                    <span className="text-zinc-400 font-bold uppercase text-[9px] block">Customer Details</span>
                    <strong className="text-zinc-900">{activeCustomerJob.customerName}</strong>
                    <div className="text-zinc-600">{activeCustomerJob.customerPhone}</div>
                    <div className="text-zinc-600">{activeCustomerJob.customerAddress}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-bold uppercase text-[9px] block">Craftsman / Society</span>
                    <strong className="text-zinc-900">{activeCustomerJob.selectedWorker?.name || 'Verified Craftsman'}</strong>
                    <div className="text-zinc-600">{activeCustomerJob.serviceTitle}</div>
                    <div className="text-emerald-700 font-semibold">DigiLocker KYC Validated</div>
                  </div>
                </div>

                <table className="w-full text-left border-t border-b border-zinc-200 py-2">
                  <thead>
                    <tr className="text-zinc-400 uppercase text-[9px] border-b border-zinc-100">
                      <th className="py-1">Description</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-[11px]">
                    <tr>
                      <td className="py-1.5">Direct Craftsman Fair-Wage (88%)</td>
                      <td className="py-1.5 text-right font-bold">₹{activeCustomerJob.workerWage}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Pradhan Mantri PMSBY Worker Social Security (6%)</td>
                      <td className="py-1.5 text-right font-bold text-teal-800">₹{activeCustomerJob.welfareCut}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Labour Cooperative Society Welfare Pool (3%)</td>
                      <td className="py-1.5 text-right font-bold text-amber-800">₹{activeCustomerJob.societyCut}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Digital Platform Infrastructure (3%)</td>
                      <td className="py-1.5 text-right font-bold text-sky-800">₹{activeCustomerJob.platformCut}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-900 font-black text-sm text-zinc-900">
                      <td className="py-2">Total Amount Paid</td>
                      <td className="py-2 text-right">₹{activeCustomerJob.agreedPrice}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="text-center text-[10px] text-zinc-400 font-sans pt-1">
                  Thank you for supporting cooperative gig workers! 🤝 Sahakar Setu
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 3. Hero Custom Job Banner (Name Your Price Button) */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-zinc-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-semibold border border-zinc-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Fair-Wage Dynamic Price Negotiation (सहकार वार्ता)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Need a Quick Repair? Name Your Price.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Post your budget directly to certified cooperative craftsmen in your sector. Get instant counter-offers and pick the best price and arrival time.
          </p>
        </div>

        <button
          onClick={() => setBiddingModalOpen(true)}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span>Post Custom Job / Name Price</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Service Categories Catalog Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-zinc-900">Cooperative Trade Categories</h2>
            <p className="text-xs text-zinc-500">Standard rate baselines benchmarked by the National Labour Cooperative Federation.</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search electrician, plumber..."
              className="bg-transparent outline-none text-zinc-800 text-xs w-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => openNewJobForCategory(cat)}
              className="bg-white border border-zinc-200 hover:border-zinc-900 p-5 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                    {getIcon(cat.icon)}
                  </div>
                  <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                    From ₹{cat.baseInspectionFee}
                  </span>
                </div>
                <h3 className="text-sm font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? cat.titleHi : cat.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? cat.descriptionHi : cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>Negotiate Rate</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Custom Job Offer Modal (Direct Bidding Request Drawer) */}
      {biddingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 max-h-[90vh] overflow-y-auto relative animate-in fade-in">
            <button
              onClick={() => setBiddingModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                NAME YOUR PRICE • DIRECT BIDDING
              </span>
              <h3 className="text-lg font-black text-zinc-900 mt-1">Post Service Offer</h3>
              <p className="text-xs text-zinc-500">Technicians nearby will review your offer and counter-bid in real-time.</p>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Select Trade Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-semibold outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (Base: ₹{c.baseInspectionFee})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Problem Description</label>
                <textarea
                  required
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  rows={2}
                  placeholder="e.g. Kitchen tap leaking continuously, need valve replacement."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none"
                />
              </div>

              {/* Proposed Budget Stepper */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-700">Your Initial Proposed Budget</label>
                  <span className="text-xl font-black text-emerald-700">₹{proposedBudget}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="2000"
                  step="50"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>Min: ₹150</span>
                  <span>Recommended: ₹{proposedBudget}</span>
                  <span>Max: ₹2000</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Service Address</label>
                <input
                  type="text"
                  required
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setBookingUrgency('INSTANT_SOS')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bookingUrgency === 'INSTANT_SOS' ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SOS Urgent (30 Mins)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingUrgency('SCHEDULED')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bookingUrgency === 'SCHEDULED' ? 'bg-zinc-900 text-white border-zinc-950 shadow-sm' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled Slot</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Broadcast Offer to Nearby Craftsmen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Counter-Offer Modal (Customer Counters a Worker's Bid) */}
      {counterModalBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-zinc-200 relative text-center">
            <button
              onClick={() => setCounterModalBid(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-zinc-900 mb-1">Submit Counter-Offer</h3>
            <p className="text-xs text-zinc-500 mb-4">Worker proposed ₹{counterModalBid.currentPrice}. Enter your counter price:</p>

            <div className="flex items-center justify-center gap-3 my-4">
              <button
                onClick={() => setCustomCounterAmount(prev => Math.max(100, prev - 20))}
                className="w-9 h-9 rounded-xl bg-zinc-100 font-bold text-sm text-zinc-800"
              >
                -20
              </button>
              <span className="text-2xl font-black text-zinc-900">₹{customCounterAmount}</span>
              <button
                onClick={() => setCustomCounterAmount(prev => prev + 20)}
                className="w-9 h-9 rounded-xl bg-zinc-100 font-bold text-sm text-zinc-800"
              >
                +20
              </button>
            </div>

            <button
              onClick={() => {
                counterCustomerOffer(counterModalBid.jobId, counterModalBid.bidId, customCounterAmount);
                setCounterModalBid(null);
              }}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Send Counter ₹{customCounterAmount}
            </button>
          </div>
        </div>
      )}

      {/* 7. BharatQR / Instant UPI Settlement Modal */}
      {activePaymentJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-zinc-200 relative text-center">
            <button
              onClick={() => setActivePaymentJob(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-zinc-900">Instant BharatQR / UPI Payment</h3>
            <p className="text-xs text-zinc-500 mb-3">Job #{activePaymentJob.id} • {activePaymentJob.serviceTitle}</p>

            {/* Dynamic UPI QR Code Box */}
            <div className="my-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 inline-block text-center w-full">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=chandan.bank@pingpay&pn=Chandan&am=${activePaymentJob.agreedPrice}&cu=INR&tn=SahakarSetu Job ${activePaymentJob.id}`)}`}
                alt="UPI QR Code - chandan.bank@pingpay"
                className="w-40 h-40 mx-auto rounded-xl shadow-sm border border-zinc-200 bg-white p-2"
              />
              <div className="mt-3 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl py-1.5 px-3 text-xs text-emerald-900 font-mono font-bold">
                <span>chandan.bank@pingpay</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('chandan.bank@pingpay');
                    speakText('UPI ID copied');
                  }}
                  className="p-1 hover:bg-emerald-200/70 rounded text-emerald-800 transition-colors"
                  title="Copy UPI ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 font-bold block mt-1.5">
                Scan with Google Pay, PhonePe, Paytm, BHIM, CRED
              </span>
              <a
                href={`upi://pay?pa=chandan.bank@pingpay&pn=Chandan&am=${activePaymentJob.agreedPrice}&cu=INR&tn=SahakarSetu%20Job%20${activePaymentJob.id}`}
                className="inline-flex items-center justify-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold mt-1 underline"
              >
                Tap to pay directly via UPI App →
              </a>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-left text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Worker Direct (88%):</span>
                <span className="font-bold text-zinc-900">₹{activePaymentJob.workerWage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">PMSBY Welfare (6%):</span>
                <span className="font-bold text-teal-700">₹{activePaymentJob.welfareCut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Society Fund (3%):</span>
                <span className="font-bold text-amber-700">₹{activePaymentJob.societyCut || 10.50}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Platform Tech (3%):</span>
                <span className="font-bold text-sky-700">₹{activePaymentJob.platformCut || 10.50}</span>
              </div>
              <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-black text-sm text-zinc-900">
                <span>Total Amount:</span>
                <span>₹{activePaymentJob.agreedPrice}</span>
              </div>
            </div>

            <button
              onClick={() => {
                settlePayment(activePaymentJob.id, 'UPI');
                setActivePaymentJob(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Pay ₹{activePaymentJob.agreedPrice} via UPI</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
