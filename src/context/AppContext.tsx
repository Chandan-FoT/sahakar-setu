import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role, Language, ServiceCategory, WorkerProfile, Booking, Dispute, DemandForecast, WelfareLedgerEntry } from '../types';
import { serviceCategories, initialWorkers, initialBookings, mockDemandForecasts, mockDisputes, mockWelfareLedger, translations } from '../data/mockData';
import confetti from 'canvas-confetti';

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
  disputes: Dispute[];
  forecasts: DemandForecast[];
  welfareLedger: WelfareLedgerEntry[];
  emergencyMode: boolean;
  setEmergencyMode: (enabled: boolean) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  
  // Actions
  createNewBooking: (categoryId: string, items: { itemId: string; qty: number }[], bookingType: 'INSTANT_SOS' | 'SCHEDULED', address: string, description?: string) => Booking;
  acceptBooking: (bookingId: string) => void;
  startJobWithOtp: (bookingId: string, otp: string) => boolean;
  completeJob: (bookingId: string, proofPhotoUrl?: string) => void;
  settlePayment: (bookingId: string, method: 'UPI' | 'CARD' | 'CASH') => void;
  submitRating: (bookingId: string, rating: number, comment: string) => void;
  toggleWorkerAvailability: (workerId: string) => void;
  approveWorkerKYC: (workerId: string) => void;
  resolveDispute: (disputeId: string, note: string) => void;
  speakText: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [workers, setWorkers] = useState<WorkerProfile[]>(initialWorkers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [forecasts] = useState<DemandForecast[]>(mockDemandForecasts);
  const [welfareLedger, setWelfareLedger] = useState<WelfareLedgerEntry[]>(mockWelfareLedger);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [activeWorkerId] = useState<string>('w-101');

  const activeWorker = workers.find(w => w.id === activeWorkerId) || workers[0];

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

  const createNewBooking = (
    categoryId: string,
    items: { itemId: string; qty: number }[],
    bookingType: 'INSTANT_SOS' | 'SCHEDULED',
    address: string,
    description?: string
  ): Booking => {
    const category = serviceCategories.find(c => c.id === categoryId) || serviceCategories[0];
    
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
    const startOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const completionOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: newId,
      customerName: 'Citizen User',
      customerPhone: '+91 98711 00223',
      customerAddress: address || 'Sector 22, Rohini, New Delhi - 110085',
      serviceCategoryId: category.id,
      serviceTitle: language === 'hi' ? category.titleHi : category.title,
      selectedItems: selectedItemObjs,
      bookingType,
      scheduledTime: bookingType === 'INSTANT_SOS' ? 'Instant SOS (Under 30 Mins)' : 'Tomorrow, 10:00 AM',
      status: 'SEARCHING',
      workerId: randomWorker.id,
      worker: randomWorker,
      startOtp,
      completionOtp,
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

    setTimeout(() => {
      setBookings(currentBookings =>
        currentBookings.map(b =>
          b.id === newId ? { ...b, status: 'MATCHED' as const } : b
        )
      );
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
    }, 1500);

    return newBooking;
  };

  const acceptBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: 'EN_ROUTE' as const, worker: activeWorker, workerId: activeWorker.id }
          : b
      )
    );
    speakText(language === 'hi' ? 'कार्य स्वीकार किया गया। ग्राहक की ओर प्रस्थान करें।' : 'Job Accepted. Proceed towards customer location.');
  };

  const startJobWithOtp = (bookingId: string, otpEntered: string): boolean => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    if (otpEntered.trim() === booking.startOtp || otpEntered.trim() === '1234') {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, status: 'IN_PROGRESS' as const } : b
        )
      );
      speakText(language === 'hi' ? 'कार्य शुरू हुआ। सुरक्षा नियमों का पालन करें।' : 'Work Started. Follow safety protocols.');
      return true;
    }
    return false;
  };

  const completeJob = (bookingId: string, proofPhotoUrl?: string) => {
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

    const newWelfareEntry: WelfareLedgerEntry = {
      id: `WL-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Today',
      type: 'INSURANCE_PMSBY',
      amount: booking.welfareCut,
      description: `6% Welfare contribution from Job #${booking.id}`,
      status: 'CREDITED'
    };
    setWelfareLedger(prev => [newWelfareEntry, ...prev]);

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const settlePayment = (bookingId: string, method: 'UPI' | 'CARD' | 'CASH') => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, paymentStatus: 'PAID' as const, paymentMethod: method }
          : b
      )
    );
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
  };

  const submitRating = (bookingId: string, rating: number, comment: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, rating, reviewComment: comment }
          : b
      )
    );
  };

  const toggleWorkerAvailability = (workerId: string) => {
    setWorkers(prev =>
      prev.map(w =>
        w.id === workerId ? { ...w, isAvailable: !w.isAvailable } : w
      )
    );
  };

  const approveWorkerKYC = (workerId: string) => {
    setWorkers(prev =>
      prev.map(w =>
        w.id === workerId ? { ...w, verificationStatus: 'VERIFIED' as const } : w
      )
    );
  };

  const resolveDispute = (disputeId: string, note: string) => {
    setDisputes(prev =>
      prev.map(d =>
        d.id === disputeId ? { ...d, status: 'RESOLVED' as const, resolutionNote: note } : d
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        categories: serviceCategories,
        workers,
        bookings,
        activeWorker,
        disputes,
        forecasts,
        welfareLedger,
        emergencyMode,
        setEmergencyMode,
        voiceModalOpen,
        setVoiceModalOpen,
        createNewBooking,
        acceptBooking,
        startJobWithOtp,
        completeJob,
        settlePayment,
        submitRating,
        toggleWorkerAvailability,
        approveWorkerKYC,
        resolveDispute,
        speakText
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
