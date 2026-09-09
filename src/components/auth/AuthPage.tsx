import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types/marketplace';
import { 
  Building2, User, Wrench, Shield, Lock, Phone, MapPin, 
  ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, KeyRound, RefreshCw, CheckCircle2,
  Smartphone
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    login, 
    registerCustomer, 
    registerWorker, 
    verifyPhoneOtp, 
    resendPhoneOtp, 
    categories 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // SMS OTP Verification Step State
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);

  // Primary Auth Field: Mobile Number
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Customer Fields
  const [address, setAddress] = useState('');

  // Worker Fields
  const [trade, setTrade] = useState('Electrician & Power Care');
  const [societyName, setSocietyName] = useState('Central District Labour Cooperative Federation #12');
  const [district, setDistrict] = useState('New Delhi');
  const [experienceYears, setExperienceYears] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [aadharLast4, setAadharLast4] = useState('');

  // 1. Handle Registration or Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const cleanPhone = phone.trim();

    try {
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number (+91 XXXXX XXXXX).');
      }

      if (authMode === 'signin') {
        if (!cleanPhone || !password.trim()) {
          throw new Error('Please enter both mobile number and password.');
        }
        await login(cleanPhone, password, selectedRole);
      } else {
        // Sign Up Mode
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        if (selectedRole === 'customer') {
          if (!fullName.trim() || !address.trim()) {
            throw new Error('Please fill in your full name, home address, and mobile number.');
          }

          const regData = { fullName, phone: cleanPhone, password, address, role: 'customer' };
          const res = await registerCustomer(regData);

          if (res.requiresOtpVerification) {
            setPendingRegistrationData({ ...regData, generatedOtp: res.generatedOtp });
            setVerificationPending(true);
            setInfoMsg(res.message || `SMS OTP code sent to ${cleanPhone}: ${res.generatedOtp}`);
          }
        } else if (selectedRole === 'worker') {
          if (!fullName.trim()) {
            throw new Error('Please fill in your full name and cooperative federation details.');
          }

          const regData = {
            fullName,
            phone: cleanPhone,
            password,
            trade,
            societyName,
            district,
            experienceYears,
            hourlyRate,
            aadharMasked: aadharLast4 ? `XXXX-XXXX-${aadharLast4}` : 'XXXX-XXXX-1234',
            role: 'worker'
          };
          const res = await registerWorker(regData);

          if (res.requiresOtpVerification) {
            setPendingRegistrationData({ ...regData, generatedOtp: res.generatedOtp });
            setVerificationPending(true);
            setInfoMsg(res.message || `SMS OTP code sent to ${cleanPhone}: ${res.generatedOtp}`);
          }
        } else {
          throw new Error('Admin self-registration is restricted. Please sign in with official federation mobile credentials.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle SMS OTP Verification Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMsg('Please enter the 6-digit SMS code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await verifyPhoneOtp(phone, verificationCode, pendingRegistrationData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired SMS OTP. Please try again or use direct verify.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Resend SMS Code
  const handleResend = async () => {
    try {
      const freshOtp = await resendPhoneOtp(phone);
      if (pendingRegistrationData) {
        setPendingRegistrationData({ ...pendingRegistrationData, generatedOtp: freshOtp });
      }
      setInfoMsg(`A fresh SMS OTP has been sent to ${phone}: ${freshOtp}`);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg('Failed to resend SMS code. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-12 font-sans">
      
      {/* Brand Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 text-white mb-3 shadow-md border border-zinc-800">
          <Building2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          SahakarSetu <span className="text-emerald-700 font-bold">सहकार सेतु</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          National Cooperative Digital Service Marketplace • Mobile Auth Gateway
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* VIEW A: SMS OTP VERIFICATION SCREEN                      */}
        {/* ======================================================== */}
        {verificationPending ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <Smartphone className="w-6 h-6 text-emerald-700" />
              </div>
              <h2 className="text-lg font-black text-zinc-900">Verify Mobile Number</h2>
              <p className="text-xs text-zinc-500">
                Enter the 6-digit SMS OTP sent to <strong className="text-zinc-900">{phone}</strong>
              </p>
            </div>

            {infoMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 text-center">
                  6-Digit SMS Verification Code (एसएमएस ओटीपी)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-2xl font-black tracking-widest p-3 rounded-2xl border-2 border-zinc-300 focus:border-zinc-950 bg-zinc-50 outline-none font-mono"
                />
                
                {pendingRegistrationData?.generatedOtp && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-medium">
                      One-Time Password: <strong className="font-mono font-black text-emerald-950 text-sm tracking-wider ml-1">{pendingRegistrationData.generatedOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(pendingRegistrationData.generatedOtp)}
                      className="px-2.5 py-1 bg-emerald-200 hover:bg-emerald-300 text-emerald-950 rounded-lg font-bold text-xs transition-colors"
                    >
                      Fill OTP
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
              <button
                type="button"
                onClick={handleResend}
                className="text-zinc-600 hover:text-zinc-950 font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Resend SMS Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationPending(false);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-zinc-500 hover:text-zinc-800 font-semibold"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW B: MOBILE SIGN IN & REGISTRATION FORM               */
          /* ======================================================== */
          <>
            {/* Step 1: Role Persona Selector Tabs */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2 text-center">
                Step 1: Select Your Account Role
              </span>
              <div className="grid grid-cols-3 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    selectedRole === 'customer'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('worker');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    selectedRole === 'worker'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Worker</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setAuthMode('signin');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Step 2: Sign In vs Sign Up Toggle */}
            {selectedRole !== 'admin' && (
              <div className="flex border-b border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 ${
                    authMode === 'signin'
                      ? 'border-zinc-950 text-zinc-950 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Mobile Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 ${
                    authMode === 'signup'
                      ? 'border-zinc-950 text-zinc-950 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Register New {selectedRole === 'customer' ? 'Citizen' : 'Craftsman'}
                </button>
              </div>
            )}

            {/* Error Alert Box */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Real Mobile Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Sign Up Specific Fields */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Full Name (पूरा नाम) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 bg-white font-medium outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Customer Only Fields */}
                  {selectedRole === 'customer' && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Home / Delivery Address (निवास पता) *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Flat 402, Greenview Heights, Sector 14"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 bg-white font-medium outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Worker Only Fields */}
                  {selectedRole === 'worker' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Primary Trade Skill (मुख्य कौशल) *
                        </label>
                        <select
                          value={trade}
                          onChange={(e) => setTrade(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-semibold outline-none"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Labour Cooperative Society Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={societyName}
                          onChange={(e) => setSocietyName(e.target.value)}
                          placeholder="e.g. North Delhi Shramik Sahakari Samiti"
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-medium outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 mb-1">
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="40"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 mb-1">
                            Aadhaar Last 4 Digits
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="5542"
                            value={aadharLast4}
                            onChange={(e) => setAadharLast4(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Mobile Number (मोबाइल नंबर) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={selectedRole === 'admin' ? '+91 98000 00001' : '+91 98765 43210'}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 bg-white font-medium outline-none focus:border-zinc-900 font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Indian format: +91 followed by 10-digit mobile number
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Password (सुरक्षित पासवर्ड) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-zinc-300 bg-white font-medium outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>
                  {loading 
                    ? 'Processing...' 
                    : authMode === 'signin' 
                      ? `Sign In as ${selectedRole.toUpperCase()}` 
                      : `Continue with Mobile Verification`}
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </form>

            {/* Security Footnote */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secured with Supabase SMS Authentication & DPDP Act Data Masking</span>
            </div>
          </>
        )}

      </div>

    </div>
  );
};

