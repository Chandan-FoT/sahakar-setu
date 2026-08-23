import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceCategory, Booking } from '../../types';
import { 
  Zap, Droplets, Hammer, HeartHandshake, Paintbrush, Tv, Sparkles, Sprout, 
  Search, ShieldCheck, Clock, MapPin, Phone, ArrowRight, QrCode, X, User, Edit3, Check
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { 
    categories, 
    bookings, 
    emergencyMode, 
    setEmergencyMode, 
    createNewBooking, 
    settlePayment, 
    submitRating, 
    currentCustomer,
    setCurrentCustomer,
    language, 
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [bookingType, setBookingType] = useState<'INSTANT_SOS' | 'SCHEDULED'>('INSTANT_SOS');
  const [customerAddress, setCustomerAddress] = useState(currentCustomer.address);
  const [customerName, setCustomerName] = useState(currentCustomer.name);
  const [customerPhone, setCustomerPhone] = useState(currentCustomer.phone);
  const [problemDescription, setProblemDescription] = useState('');
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-amber-500" />;
      case 'Droplets': return <Droplets className="w-6 h-6 text-sky-500" />;
      case 'Hammer': return <Hammer className="w-6 h-6 text-amber-700" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-rose-500" />;
      case 'Paintbrush': return <Paintbrush className="w-6 h-6 text-emerald-600" />;
      case 'Tv': return <Tv className="w-6 h-6 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-teal-500" />;
      case 'Sprout': return <Sprout className="w-6 h-6 text-green-600" />;
      default: return <Zap className="w-6 h-6 text-emerald-600" />;
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.titleHi.includes(searchQuery) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (emergencyMode) {
      return matchesSearch && c.emergencyAvailable;
    }
    return matchesSearch;
  });

  const activeBookings = bookings.filter(b => b.status !== 'CANCELLED');

  const openServiceModal = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    const initialQtys: Record<string, number> = {};
    if (cat.standardItems.length > 0) {
      initialQtys[cat.standardItems[0].id] = 1;
    }
    setItemQuantities(initialQtys);
    setBookingType(emergencyMode || cat.emergencyAvailable ? 'INSTANT_SOS' : 'SCHEDULED');
    setCustomerAddress(currentCustomer.address);
    setCustomerName(currentCustomer.name);
    setCustomerPhone(currentCustomer.phone);
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const calculateSubtotal = () => {
    if (!selectedCategory) return 0;
    let total = selectedCategory.baseInspectionFee;
    selectedCategory.standardItems.forEach(item => {
      const qty = itemQuantities[item.id] || 0;
      total += item.baseRate * qty;
    });
    return total;
  };

  const handleConfirmBooking = () => {
    if (!selectedCategory) return;
    const selectedList = Object.entries(itemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (selectedList.length === 0 && selectedCategory.standardItems.length > 0) {
      selectedList.push({ itemId: selectedCategory.standardItems[0].id, qty: 1 });
    }

    setCurrentCustomer({
      name: customerName,
      phone: customerPhone,
      address: customerAddress
    });

    createNewBooking(
      selectedCategory.id,
      selectedList,
      bookingType,
      customerAddress,
      problemDescription,
      customerName,
      customerPhone
    );

    setSelectedCategory(null);
    setItemQuantities({});
    setProblemDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 0. Real Customer Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen Account:</span>
              <span className="text-sm font-black text-slate-900">{currentCustomer.name}</span>
              <span className="text-xs text-slate-500 font-mono">({currentCustomer.phone})</span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentCustomer.address}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{editingProfile ? 'Close Editor' : 'Edit Customer / Change Address'}</span>
        </button>
      </div>

      {/* Customer Profile Quick Edit Panel */}
      {editingProfile && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 animate-in fade-in space-y-4">
          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Update Real Customer Details for Service Dispatch
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={currentCustomer.name}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                placeholder="e.g. Chandan Kumar"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Phone Number</label>
              <input
                type="text"
                value={currentCustomer.phone}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                placeholder="+91 98765 12345"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Address</label>
              <input
                type="text"
                value={currentCustomer.address}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                placeholder="e.g. House #14, Sector 5, Rohini, New Delhi"
              />
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(false)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      )}

      {/* 1. Hero Search & Value Proposition Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-700/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'hi' ? '100% प्रमाणित सहकारी श्रमिक' : 'Govt & Federation Endorsed Labour Societies'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {language === 'hi' ? (
              <>
                घर की हर मरम्मत के लिए <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                  प्रमाणित सहकारी कारीगर
                </span>
              </>
            ) : (
              <>
                Book Verified Cooperative Professionals. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                  Fair Wages. Zero Exploitation.
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {language === 'hi'
              ? 'बिचौलियों के भारी कमीशन से मुक्त। पारदर्शी रेट कार्ड, डिजिटल इनवॉइस और 30 मिनट आपातकालीन त्वरित सेवा।'
              : 'Direct connection to district labour cooperative federations. 88% of your money goes straight into the skilled worker’s pocket with social security.'}
          </p>

          {/* Search Bar & Instant Filter */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 flex-1 px-3 py-2 text-white w-full">
              <Search className="w-5 h-5 text-emerald-300 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="bg-transparent text-sm placeholder:text-emerald-200/70 text-white outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-emerald-200 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                emergencyMode 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{emergencyMode ? 'SOS Mode ON (30 Min)' : 'Urgent SOS 30-Min'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Bookings Live Tracker Strip */}
      {activeBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>{language === 'hi' ? 'सक्रिय बुकिंग एवं लाइव ट्रैकिंग' : 'Active Orders & Live Dispatch Tracker'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">{activeBookings.length} In Progress / Completed</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                      #{b.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {b.serviceTitle}
                    </span>
                  </div>

                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    b.status === 'EN_ROUTE' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    b.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800' :
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  <span>Customer: </span>
                  <strong className="text-slate-800">{b.customerName}</strong> • {b.customerAddress}
                </div>

                {b.worker && (
                  <div className="mt-3 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.worker.avatar}
                        alt={b.worker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">{b.worker.name}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-xs text-slate-500">{b.worker.trade} • {b.worker.societyName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5">
                            ★ {b.worker.rating}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                            DigiLocker Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${b.worker.phone}`}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 shadow-sm transition-all"
                      title="Call Worker (Privacy Protected)"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {b.status !== 'COMPLETED' && (
                  <div className="mt-4 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                        🔒 {t('startOtp')} (Share on worker arrival)
                      </span>
                      <span className="text-lg font-black text-emerald-700 tracking-widest">
                        {b.startOtp}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-emerald-800">
                      <span>Total Fair Wage</span>
                      <p className="text-base font-black text-slate-900">₹{b.totalAmount}</p>
                    </div>
                  </div>
                )}

                {b.status === 'COMPLETED' && (
                  <div className="mt-4 flex items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500">
                      <span>Total: </span>
                      <span className="font-bold text-slate-900 text-sm">₹{b.totalAmount}</span>
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.paymentStatus === 'PAID' ? '✓ PAID VIA UPI' : 'PAYMENT DUE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => setActivePaymentBooking(b)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          Pay ₹{b.totalAmount} (Split UPI)
                        </button>
                      )}

                      {!b.rating && (
                        <button
                          onClick={() => setRatingBooking(b)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                        >
                          Rate Service ★
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Service Catalog Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {language === 'hi' ? 'सहकारी सेवा श्रेणियां' : 'Cooperative Service Catalog'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' 
                ? 'न्यूनतम दरें, शून्य अतिरिक्त प्रभार और सीधे कामगार कल्याण में योगदान।'
                : 'Government standardized rate cards with guaranteed cooperative dividend back to craftsmen.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{filteredCategories.length} Verified Trades Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => openServiceModal(cat)}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {getIcon(cat.icon)}
                  </div>

                  {cat.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                      {cat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {language === 'hi' ? cat.titleHi : cat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? cat.descriptionHi : cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspection Fee</span>
                  <span className="text-sm font-black text-slate-900">₹{cat.baseInspectionFee}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Service Detail & Rate Card Estimator Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                {getIcon(selectedCategory.icon)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'hi' ? selectedCategory.titleHi : selectedCategory.title}
                </h3>
                <p className="text-xs text-slate-500">Cooperative Standardized Rate Card</p>
              </div>
            </div>

            {/* Task Itemizer */}
            <div className="space-y-3 my-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Required Tasks / Add Scope:
              </span>

              {selectedCategory.standardItems.map(item => {
                const qty = itemQuantities[item.id] || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/50">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {language === 'hi' ? item.nameHi : item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ₹{item.baseRate} / {item.unit} • ~{item.durationMinutes} mins
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">{qty}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fair Wage Transparency Chart */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 my-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">Transparent Cooperative Split</span>
                <span className="text-xs font-black text-emerald-700">Subtotal: ₹{calculateSubtotal()}</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5 flex overflow-hidden shadow-inner">
                <div className="bg-emerald-600 h-2.5" style={{ width: '88%' }} title="88% Direct Worker Wage" />
                <div className="bg-teal-400 h-2.5" style={{ width: '6%' }} title="6% Worker Welfare Fund" />
                <div className="bg-amber-400 h-2.5" style={{ width: '3%' }} title="3% Primary Society Fund" />
                <div className="bg-sky-400 h-2.5" style={{ width: '3%' }} title="3% Platform Infrastructure" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-slate-600">
                <div>
                  <span className="font-bold text-emerald-800">₹{(calculateSubtotal() * 0.88).toFixed(1)}</span> (88% Worker)
                </div>
                <div>
                  <span className="font-bold text-teal-700">₹{(calculateSubtotal() * 0.06).toFixed(1)}</span> (6% Welfare)
                </div>
                <div>
                  <span className="font-bold text-amber-700">₹{(calculateSubtotal() * 0.03).toFixed(1)}</span> (3% Society)
                </div>
                <div>
                  <span className="font-bold text-sky-700">₹{(calculateSubtotal() * 0.03).toFixed(1)}</span> (3% Tech)
                </div>
              </div>
            </div>

            {/* Address and Booking Mode */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Address</label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 outline-none w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Problem Description (Optional)</label>
                <input
                  type="text"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Switchboard sparking or leaking kitchen tap"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingType('INSTANT_SOS')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    bookingType === 'INSTANT_SOS'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Instant SOS (30 Mins)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingType('SCHEDULED')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    bookingType === 'SCHEDULED'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Scheduled Slot</span>
                </button>
              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm Booking & Dispatch Cooperative Craftsman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. UPI Split Settlement & Invoice Modal */}
      {activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative text-center">
            <button
              onClick={() => setActivePaymentBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <QrCode className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Instant UPI Split Settlement</h3>
            <p className="text-xs text-slate-500 mt-0.5">Booking #{activePaymentBooking.id} • {activePaymentBooking.serviceTitle}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Worker Direct Payout (88%):</span>
                <span className="font-bold text-slate-900">₹{activePaymentBooking.workerWage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Worker Welfare & Insurance (6%):</span>
                <span className="font-bold text-teal-700">₹{activePaymentBooking.welfareCut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cooperative Society Fund (3%):</span>
                <span className="font-bold text-amber-700">₹{activePaymentBooking.societyCut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Tech (3%):</span>
                <span className="font-bold text-sky-700">₹{activePaymentBooking.platformCut}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount Due:</span>
                <span>₹{activePaymentBooking.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                settlePayment(activePaymentBooking.id, 'UPI');
                setActivePaymentBooking(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Pay ₹{activePaymentBooking.totalAmount} via BharatQR / UPI</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Rating & Feedback Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-center relative">
            <button
              onClick={() => setRatingBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900">Rate Cooperative Professional</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your review builds trust and community reputation for {ratingBooking.worker?.name || 'Worker'}.
            </p>

            <div className="flex items-center justify-center gap-2 my-5">
              {[1, 2, 3, 4, 5].map(starIndex => (
                <button
                  key={starIndex}
                  onClick={() => setStars(starIndex)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    starIndex <= stars ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience (e.g., on-time arrival, excellent repair quality)..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none text-slate-800 mb-4"
            />

            <button
              onClick={() => {
                submitRating(ratingBooking.id, stars, reviewComment || 'Excellent cooperative service.');
                setRatingBooking(null);
                setReviewComment('');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Submit Review & Endorsement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
