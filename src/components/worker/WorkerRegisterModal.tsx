import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, CheckCircle, ShieldCheck, Award, Building, Phone, MapPin, Sparkles } from 'lucide-react';

export const WorkerRegisterModal: React.FC = () => {
  const { workerRegisterModalOpen, setWorkerRegisterModalOpen, registerNewWorker, categories, setRole } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [trade, setTrade] = useState('Electrician & Power Care');
  const [societyName, setSocietyName] = useState('Central District Labour Cooperative Federation #12');
  const [district, setDistrict] = useState('New Delhi - Central District');
  const [experienceYears, setExperienceYears] = useState(6);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [aadhar, setAadhar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successWorker, setSuccessWorker] = useState<any>(null);

  if (!workerRegisterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 10) return;

    setIsSubmitting(true);
    try {
      const created = await registerNewWorker({
        name,
        phone,
        trade,
        societyName,
        district,
        experienceYears,
        hourlyRate,
        aadharMasked: aadhar ? `XXXX-XXXX-${aadhar.slice(-4)}` : undefined
      });
      setSuccessWorker(created);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessWorker(null);
    setName('');
    setWorkerRegisterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center shadow-inner">
              <UserPlus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">श्रामिक पंजीकरण | Join as Craftsman</h2>
              <p className="text-xs text-emerald-200">National Labour Cooperative Federation (NLCF)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successWorker ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">पंजीकरण सफल! Registration Successful</h3>
            <p className="text-sm text-slate-600">
              Welcome, <strong className="text-emerald-700">{successWorker.name}</strong> ({successWorker.trade})! 
              Your profile has been created in the SQLite database and linked to <strong>{successWorker.societyName}</strong>.
            </p>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Worker ID:</span>
                <span className="font-mono font-bold text-slate-800">{successWorker.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">KYC Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Pending Federation Approval (Go to Admin Portal)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Insurance Cover:</span>
                <span className="font-bold text-emerald-700">₹2,00,000 (PMSBY Pre-Assigned)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setRole('worker');
                }}
                className="flex-1 bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md text-sm"
              >
                Go to Worker Console (Shramik View)
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setRole('admin');
                }}
                className="flex-1 bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-slate-900 transition-all text-sm"
              >
                Approve in Admin KYC Queue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cooperative Guarantee:</strong> Minimum 88% fair-wage floor guaranteed on all orders with zero commercial platform commissions.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (मोबाइल नंबर) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Trade (मुख्य कौशल) *
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                  <option value="Solar Panel & EV Technician">Solar Panel & EV Technician</option>
                  <option value="Monoblock & Submersible Pump Specialist">Pump Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience (अनुभव वर्ष)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Labour Cooperative Society (संबंधित प्राथमिक सहकारी समिति)
              </label>
              <input
                type="text"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                placeholder="e.g. North Delhi Shramik Sahakari Samiti"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District / Zone (कार्य क्षेत्र)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hourly Rate Floor (₹ प्रति घंटा)
                </label>
                <input
                  type="number"
                  step="50"
                  min="200"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                DigiLocker / Aadhaar Card (अंतिम 4 अंक)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 5542"
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register Worker in DB'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
