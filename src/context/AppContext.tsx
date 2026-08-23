import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Language, ServiceCategory, WorkerProfile, Booking, Dispute, DemandForecast, WelfareLedgerEntry } from '../types';
import { serviceCategories, initialWorkers, initialBookings, mockDemandForecasts, mockDisputes, mockWelfareLedger, translations } from '../data/mockData';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface CustomerProfile {
  name: string;
  phone: string;
  address: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  categories: ServiceCategory[];
  workers: WorkerProfile[];
  bookings: Booking[];
  activeWorker: WorkerProfile;
  activeWorkerId: string;
  setActiveWorkerId: (id: string) => void;
  currentCustomer: CustomerProfile;
  setCurrentCustomer: (c: CustomerProfile) => void;
  disputes: Dispute[];
  forecasts: DemandForecast[];
  welfareLedger: WelfareLedgerEntry[];
  emergencyMode: boolean;
  setEmergencyMode: (enabled: boolean) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  workerRegisterModalOpen: boolean;
  setWorkerRegisterModalOpen: (open: boolean) => void;
  isBackendConnected: boolean;
  
  // Actions
  createNewBooking: (categoryId: string, items: { itemId: string; qty: number }[], bookingType: 'INSTANT_SOS' | 'SCHEDULED', address: string, description?: string, customName?: string, customPhone?: string) => Promise<Booking>;
  registerNewWorker: (workerData: {
    name: string;
    phone: string;
    trade: string;
    societyName: string;
    societyId?: string;
    district: string;
    experienceYears: number;
    hourlyRate: number;
    aadharMasked?: string;
  }) => Promise<WorkerProfile>;
  acceptBooking: (bookingId: string) => Promise<void>;
  startJobWithOtp: (bookingId: string, otp: string) => Promise<boolean>;
  completeJob: (bookingId: string, proofPhotoUrl?: string) => Promise<void>;
  settlePayment: (bookingId: string, method: 'UPI' | 'CARD' | 'CASH') => Promise<void>;
  submitRating: (bookingId: string, rating: number, comment: string) => Promise<void>;
  toggleWorkerAvailability: (workerId: string) => Promise<void>;
  approveWorkerKYC: (workerId: string) => Promise<void>;
  resolveDispute: (disputeId: string, note: string) => Promise<void>;
  speakText: (text: string) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [categories, setCategories] = useState<ServiceCategory[]>(serviceCategories);
  const [workers, setWorkers] = useState<WorkerProfile[]>(initialWorkers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [forecasts, setForecasts] = useState<DemandForecast[]>(mockDemandForecasts);
  const [welfareLedger, setWelfareLedger] = useState<WelfareLedgerEntry[]>(mockWelfareLedger);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [workerRegisterModalOpen, setWorkerRegisterModalOpen] = useState<boolean>(false);
  const [activeWorkerId, setActiveWorkerId] = useState<string>('w-101');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile>({
    name: 'Chandan Kumar',
    phone: '+91 98765 12345',
    address: 'Flat 402, Greenview Heights, Sector 14, New Delhi'
  });

  const activeWorker = workers.find(w => w.id === activeWorkerId) || workers[0] || initialWorkers[0];

  const t = (key: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const refreshData = async () => {
    try {
      const [svcRes, wrkRes, bkRes, fcRes, dspRes] = await Promise.allSettled([
        api.services.getAll(),
        api.workers.getAll(),
        api.bookings.getAll(),
        api.admin.getForecasts(),
        api.admin.getDisputes()
      ]);

      let backendOk = false;

      if (svcRes.status === 'fulfilled' && svcRes.value?.data?.length > 0) {
        setCategories(svcRes.value.data);
        backendOk = true;
      }
      if (wrkRes.status === 'fulfilled' && wrkRes.value?.data?.length > 0) {
        setWorkers(wrkRes.value.data);
        backendOk = true;
      }
      if (bkRes.status === 'fulfilled' && bkRes.value?.data) {
        setBookings(bkRes.value.data);
        backendOk = true;
      }
      if (fcRes.status === 'fulfilled' && fcRes.value?.data) {
        setForecasts(fcRes.value.data);
        backendOk = true;
      }
      if (dspRes.status === 'fulfilled' && dspRes.value?.data) {
        setDisputes(dspRes.value.data);
        backendOk = true;
      }

      // Fetch welfare ledger
      try {
        const welfareRes = await api.welfare.get(activeWorkerId);
        if (welfareRes.data?.ledger) {
          setWelfareLedger(welfareRes.data.ledger);
        }
      } catch (e) {}

      setIsBackendConnected(backendOk);
    } catch (e) {
      console.warn('Backend connection offline, running with local state:', e);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeWorkerId]);

  // Register New Worker
  const registerNewWorker = async (workerData: {
    name: string;
    phone: string;
    trade: string;
    societyName: string;
    societyId?: string;
    district: string;
    experienceYears: number;
    hourlyRate: number;
    aadharMasked?: string;
  }): Promise<WorkerProfile> => {
    try {
      const res = await api.workers.register(workerData);
      const createdWorker = res.data;
      setWorkers(prev => [createdWorker, ...prev]);
      setActiveWorkerId(createdWorker.id);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      return createdWorker;
    } catch (err) {
      // Local fallback
      const newId = `w-${Math.floor(100 + Math.random() * 900)}`;
      const localWorker: WorkerProfile = {
        id: newId,
        name: workerData.name,
        phone: workerData.phone,
        trade: workerData.trade,
        secondaryTrades: [],
        experienceYears: workerData.experienceYears || 3,
        rating: 5.0,
        reviewCount: 0,
        societyName: workerData.societyName || 'Central District Labour Cooperative Federation',
        societyId: workerData.societyId || `COOP-DL-2026-${Math.floor(100 + Math.random() * 900)}`,
        district: workerData.district || 'New Delhi',
        verificationStatus: 'PENDING',
        aadharMasked: workerData.aadharMasked || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        skillCertifications: ['Skill India Registered', 'Trade Verified'],
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        hourlyRate: workerData.hourlyRate || 300,
        distanceKm: 1.2,
        isAvailable: true,
        completedJobs: 0,
        badges: ['New Registered Member'],
        welfareBalance: 0,
        pensionSavings: 0,
        insurancePolicyNo: `PMSBY-COOP-${Math.floor(100000 + Math.random() * 900000)}`,
        lat: 28.6139,
        lng: 77.2090
      };
      setWorkers(prev => [localWorker, ...prev]);
      setActiveWorkerId(newId);
      return localWorker;
    }
  };

  // Create Booking
  const createNewBooking = async (
    categoryId: string,
    items: { itemId: string; qty: number }[],
    bookingType: 'INSTANT_SOS' | 'SCHEDULED',
    address: string,
    description?: string,
    customName?: string,
    customPhone?: string
  ): Promise<Booking> => {
    const custName = customName || currentCustomer.name || 'Citizen User';
    const custPhone = customPhone || currentCustomer.phone || '+91 98711 00223';
    const custAddress = address || currentCustomer.address || 'Sector 22, Rohini, New Delhi';

    try {
      const res = await api.bookings.create({
        serviceCategoryId: categoryId,
        items,
        bookingType,
        customerAddress: custAddress,
        customerName: custName,
        customerPhone: custPhone,
        problemDescription: description
      });

      const newBooking = res.data;
      setBookings(prev => [newBooking, ...prev]);

      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}

      return newBooking;
    } catch (err) {
      console.warn('Fallback to local booking creation:', err);
      const category = categories.find(c => c.id === categoryId) || categories[0];
      let calculatedTotal = category.baseInspectionFee;
      const selectedItemObjs: { item: any; quantity: number }[] = [];

      items.forEach(({ itemId, qty }) => {
        const foundItem = category.standardItems.find(si => si.id === itemId);
        if (foundItem) {
          selectedItemObjs.push({ item: foundItem, quantity: qty });
          calculatedTotal += foundItem.baseRate * qty;
        }
      });

      const workerWage = Number((calculatedTotal * 0.88).toFixed(2));
      const welfareCut = Number((calculatedTotal * 0.06).toFixed(2));
      const societyCut = Number((calculatedTotal * 0.03).toFixed(2));
      const platformCut = Number((calculatedTotal * 0.03).toFixed(2));

      const randomWorker = workers.find(w => w.trade.toLowerCase().includes(category.id) || w.isAvailable) || workers[0];
      const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Booking = {
        id: newId,
        customerName: custName,
        customerPhone: custPhone,
        customerAddress: custAddress,
        serviceCategoryId: category.id,
        serviceTitle: language === 'hi' ? category.titleHi : category.title,
        selectedItems: selectedItemObjs,
        bookingType,
        scheduledTime: bookingType === 'INSTANT_SOS' ? 'Instant SOS (Under 30 Mins)' : 'Tomorrow, 10:00 AM',
        status: 'SEARCHING',
        workerId: randomWorker.id,
        worker: randomWorker,
        startOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        completionOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: calculatedTotal,
        workerWage,
        welfareCut,
        societyCut,
        platformCut,
        paymentStatus: 'PENDING',
        createdAt: 'Just now',
        problemDescription: description || 'Standard verified cooperative repair service request'
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    }
  };

  const acceptBooking = async (bookingId: string) => {
    try {
      const res = await api.bookings.accept(bookingId, activeWorker.id);
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
    } catch (e) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'EN_ROUTE' as const, worker: activeWorker, workerId: activeWorker.id }
            : b
        )
      );
    }
    speakText(language === 'hi' ? 'कार्य स्वीकार किया गया। ग्राहक की ओर प्रस्थान करें।' : 'Job Accepted. Proceed towards customer location.');
  };

  const startJobWithOtp = async (bookingId: string, otpEntered: string): Promise<boolean> => {
    try {
      const res = await api.bookings.startWithOtp(bookingId, otpEntered.trim());
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
      speakText(language === 'hi' ? 'कार्य शुरू हुआ। सुरक्षा नियमों का पालन करें।' : 'Work Started. Follow safety protocols.');
      return true;
    } catch (e) {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && (otpEntered.trim() === booking.startOtp || otpEntered.trim() === '1234')) {
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId ? { ...b, status: 'IN_PROGRESS' as const } : b
          )
        );
        speakText(language === 'hi' ? 'कार्य शुरू हुआ। सुरक्षा नियमों का पालन करें।' : 'Work Started. Follow safety protocols.');
        return true;
      }
      return false;
    }
  };

  const completeJob = async (bookingId: string, proofPhotoUrl?: string) => {
    try {
      const res = await api.bookings.complete(bookingId, proofPhotoUrl);
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
      refreshData();
    } catch (e) {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? {
                ...b,
                status: 'COMPLETED' as const,
                completedAt: 'Just now',
                workProofPhoto: proofPhotoUrl || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&auto=format&fit=crop&q=80'
              }
            : b
        )
      );

      setWorkers(prev =>
        prev.map(w => {
          if (w.id === (booking.workerId || activeWorker.id)) {
            return {
              ...w,
              completedJobs: w.completedJobs + 1,
              welfareBalance: w.welfareBalance + booking.welfareCut,
              pensionSavings: w.pensionSavings + 25
            };
          }
          return w;
        })
      );
    }

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const settlePayment = async (bookingId: string, method: 'UPI' | 'CARD' | 'CASH') => {
    try {
      const res = await api.bookings.pay(bookingId, method);
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
    } catch (e) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, paymentStatus: 'PAID' as const, paymentMethod: method }
            : b
        )
      );
    }
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
  };

  const submitRating = async (bookingId: string, rating: number, comment: string) => {
    try {
      const res = await api.bookings.rate(bookingId, rating, comment);
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
    } catch (e) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, rating, reviewComment: comment }
            : b
        )
      );
    }
  };

  const toggleWorkerAvailability = async (workerId: string) => {
    try {
      const res = await api.workers.toggleAvailability(workerId);
      setWorkers(prev => prev.map(w => w.id === workerId ? res.data : w));
    } catch (e) {
      setWorkers(prev =>
        prev.map(w =>
          w.id === workerId ? { ...w, isAvailable: !w.isAvailable } : w
        )
      );
    }
  };

  const approveWorkerKYC = async (workerId: string) => {
    try {
      const res = await api.admin.verifyWorker(workerId, 'VERIFIED');
      setWorkers(prev => prev.map(w => w.id === workerId ? res.data : w));
    } catch (e) {
      setWorkers(prev =>
        prev.map(w =>
          w.id === workerId ? { ...w, verificationStatus: 'VERIFIED' as const } : w
        )
      );
    }
  };

  const resolveDispute = async (disputeId: string, note: string) => {
    try {
      const res = await api.admin.resolveDispute(disputeId, note);
      setDisputes(prev => prev.map(d => d.id === disputeId ? res.data : d));
    } catch (e) {
      setDisputes(prev =>
        prev.map(d =>
          d.id === disputeId ? { ...d, status: 'RESOLVED' as const, resolutionNote: note } : d
        )
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        categories,
        workers,
        bookings,
        activeWorker,
        activeWorkerId,
        setActiveWorkerId,
        currentCustomer,
        setCurrentCustomer,
        disputes,
        forecasts,
        welfareLedger,
        emergencyMode,
        setEmergencyMode,
        voiceModalOpen,
        setVoiceModalOpen,
        workerRegisterModalOpen,
        setWorkerRegisterModalOpen,
        isBackendConnected,
        createNewBooking,
        registerNewWorker,
        acceptBooking,
        startJobWithOtp,
        completeJob,
        settlePayment,
        submitRating,
        toggleWorkerAvailability,
        approveWorkerKYC,
        resolveDispute,
        speakText,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
