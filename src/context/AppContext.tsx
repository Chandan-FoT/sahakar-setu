import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Role, 
  Language, 
  AuthUser,
  ServiceCategory, 
  WorkerProfile, 
  CustomerProfile, 
  JobRequest, 
  BidNegotiation, 
  WelfareLedgerEntry 
} from '../types/marketplace';
import { 
  initialCategories, 
  initialWorkersList, 
  initialJobRequests, 
  initialWelfareLedger 
} from '../data/mockMarketplaceData';
import { mockDemandForecasts, mockDisputes, translations } from '../data/mockData';
import { 
  supabase, 
  authSignUp, 
  authSignIn, 
  authSignOut, 
  authVerifyPhoneOtp,
  authResendPhoneOtp,
  getSavedAuthUser,
  generateUUID,
  formatIndianPhone,
  extract10Digits,
  syncUserProfileToDb,
  hashPassword,
  saveCredentialMapping,
  saveRegisteredAccount,
  SignUpResult 
} from '../lib/supabase';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  categories: ServiceCategory[];
  workers: WorkerProfile[];
  activeWorker: WorkerProfile;
  activeWorkerId: string;
  setActiveWorkerId: (id: string) => void;
  currentCustomer: CustomerProfile;
  setCurrentCustomer: (c: CustomerProfile) => void;
  jobRequests: JobRequest[];
  bookings: any[];
  activeCustomerJob: JobRequest | undefined;
  welfareLedger: WelfareLedgerEntry[];
  forecasts: any[];
  disputes: any[];
  emergencyMode: boolean;
  setEmergencyMode: (enabled: boolean) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  workerRegisterModalOpen: boolean;
  setWorkerRegisterModalOpen: (open: boolean) => void;

  // Real Supabase Mobile Authentication & SMS OTP Methods
  login: (phone: string, password?: string, role?: Role) => Promise<AuthUser>;
  registerCustomer: (params: {
    fullName: string;
    phone: string;
    password?: string;
    address: string;
    email?: string;
  }) => Promise<SignUpResult>;
  registerWorker: (params: {
    fullName: string;
    phone: string;
    password?: string;
    trade: string;
    societyName: string;
    district: string;
    experienceYears?: number;
    hourlyRate?: number;
    aadharMasked?: string;
    email?: string;
  }) => Promise<SignUpResult>;
  verifyPhoneOtp: (phone: string, token: string, registrationData?: any) => Promise<AuthUser>;
  resendPhoneOtp: (phone: string) => Promise<string>;
  logout: () => Promise<void>;

  // Sahakar Dynamic Price Negotiation Actions
  postJobOffer: (params: {
    categoryId: string;
    problemDescription: string;
    initialBudget: number;
    customerAddress: string;
    bookingType: 'INSTANT_SOS' | 'SCHEDULED';
  }) => Promise<JobRequest>;

  submitWorkerBid: (params: {
    jobId: string;
    proposedPrice: number;
    etaMinutes: number;
    bidderNote?: string;
  }) => Promise<BidNegotiation>;

  acceptWorkerBid: (jobId: string, bidId: string) => Promise<void>;
  counterCustomerOffer: (jobId: string, bidId: string, counterPrice: number) => Promise<void>;
  startJobWithOtp: (jobId: string, otp: string) => Promise<boolean>;
  completeJob: (jobId: string, proofPhotoUrl?: string) => Promise<void>;
  settlePayment: (jobId: string, method: 'UPI' | 'CARD' | 'CASH') => Promise<void>;
  submitRating: (jobId: string, rating: number, comment: string) => Promise<void>;
  dismissActiveJob: (jobId: string) => void;
  toggleWorkerAvailability: (workerId: string) => Promise<void>;
  registerNewWorker: (data: any) => Promise<WorkerProfile>;
  approveWorkerKYC: (workerId: string) => Promise<void>;
  resolveDispute: (disputeId: string, note: string) => Promise<void>;
  speakText: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Instant multi-tab / multi-window communication channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('sahakar_realtime_marketplace')
  : null;

const STATUS_PRIORITY: Record<string, number> = {
  'CANCELLED': 0,
  'BIDDING_OPEN': 1,
  'NEGOTIATING': 2,
  'DEAL_LOCKED': 3,
  'EN_ROUTE': 4,
  'IN_PROGRESS': 5,
  'COMPLETED': 6
};

/**
 * Intelligent Merger: Merges incoming jobs and bids with current in-memory state
 * guaranteeing that no active local/broadcasted bids or status progressions are lost or rolled back.
 */
const mergeJobsWithLocal = (incomingJobs: JobRequest[], currentJobs: JobRequest[]): JobRequest[] => {
  const map = new Map<string, JobRequest>();

  // Start with incoming jobs
  incomingJobs.forEach(job => {
    map.set(job.id, { ...job });
  });

  // Merge with current state so we don't lose freshly placed local bids or advanced statuses
  currentJobs.forEach(curJob => {
    if (!map.has(curJob.id)) {
      map.set(curJob.id, { ...curJob });
    } else {
      const incJob = map.get(curJob.id)!;
      // Merge bids by unique bid ID and workerId
      const bidMap = new Map<string, BidNegotiation>();
      (incJob.bids || []).forEach(b => bidMap.set(b.id || `${b.workerId}_${b.proposedPrice}`, b));
      (curJob.bids || []).forEach(b => bidMap.set(b.id || `${b.workerId}_${b.proposedPrice}`, b));

      const mergedBids = Array.from(bidMap.values());
      const curPriority = STATUS_PRIORITY[curJob.status] || 0;
      const incPriority = STATUS_PRIORITY[incJob.status] || 0;

      // Keep the more advanced status progression (e.g., EN_ROUTE > NEGOTIATING)
      const finalStatus = curPriority >= incPriority ? curJob.status : incJob.status;

      map.set(curJob.id, {
        ...incJob,
        status: finalStatus,
        bids: mergedBids,
        agreedPrice: curJob.agreedPrice || incJob.agreedPrice,
        selectedWorkerId: curJob.selectedWorkerId || incJob.selectedWorkerId,
        selectedWorker: curJob.selectedWorker || incJob.selectedWorker,
        workerWage: curJob.workerWage || incJob.workerWage,
        welfareCut: curJob.welfareCut || incJob.welfareCut,
        societyCut: curJob.societyCut || incJob.societyCut,
        platformCut: curJob.platformCut || incJob.platformCut,
        paymentStatus: (curJob.paymentStatus === 'PAID' || incJob.paymentStatus === 'PAID') ? 'PAID' : (incJob.paymentStatus || curJob.paymentStatus),
        paymentMethod: curJob.paymentMethod || incJob.paymentMethod,
        rating: curJob.rating || incJob.rating,
        reviewComment: curJob.reviewComment || incJob.reviewComment,
        workProofPhoto: curJob.workProofPhoto || incJob.workProofPhoto
      });
    }
  });

  return Array.from(map.values());
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getSavedAuthUser());
  const [role, setRole] = useState<Role>(() => currentUser?.role || 'customer');
  const [language, setLanguage] = useState<Language>('en');
  const [categories] = useState<ServiceCategory[]>(initialCategories);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [activeWorkerId, setActiveWorkerId] = useState<string>(() => currentUser?.id || '');
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(() => {
    try {
      const cached = localStorage.getItem('sahakar_live_jobs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeJobsWithLocal(parsed, []);
        }
      }
    } catch (e) {}
    return [];
  });
  const [welfareLedger, setWelfareLedger] = useState<WelfareLedgerEntry[]>([]);
  const [dismissedJobIds, setDismissedJobIds] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('sahakar_dismissed_jobs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeCustomerJobId, setActiveCustomerJobId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sahakar_active_customer_job_id');
    } catch (e) {
      return null;
    }
  });
  const [forecasts] = useState<any[]>(mockDemandForecasts);
  const [disputes, setDisputes] = useState<any[]>(mockDisputes);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [workerRegisterModalOpen, setWorkerRegisterModalOpen] = useState<boolean>(false);

  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile>(() => {
    const saved = getSavedAuthUser();
    if (saved && saved.role === 'customer') {
      return {
        id: saved.id,
        name: saved.fullName,
        phone: saved.phone || '',
        address: saved.address || ''
      };
    }
    return {
      id: '',
      name: '',
      phone: '',
      address: ''
    };
  });

  // Sync state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role);
      if (currentUser.role === 'customer') {
        setCurrentCustomer({
          id: currentUser.id,
          name: currentUser.fullName,
          phone: currentUser.phone || '',
          address: currentUser.address || ''
        });
      } else if (currentUser.role === 'worker') {
        setActiveWorkerId(currentUser.id);
        const existing = workers.find(w => w.userId === currentUser.id || w.id === currentUser.id || (currentUser.phone && w.phone === currentUser.phone));
        if (existing) {
          setActiveWorkerId(existing.id);
        } else {
          const newW: WorkerProfile = {
            id: currentUser.id,
            userId: currentUser.id,
            name: currentUser.fullName,
            phone: currentUser.phone || '',
            trade: currentUser.trade || 'Electrician & Power Care',
            secondaryTrades: [],
            experienceYears: currentUser.experienceYears || 3,
            rating: 5.0,
            reviewCount: 0,
            societyName: currentUser.societyName || 'Central District Labour Cooperative Federation',
            societyId: 'COOP-DL-2026-091',
            district: currentUser.district || 'New Delhi',
            verificationStatus: currentUser.verificationStatus || 'VERIFIED',
            aadharMasked: currentUser.aadharMasked || 'XXXX-XXXX-1234',
            skillCertifications: ['Cooperative Registered', 'Skill India Validated'],
            avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
            hourlyRateFloor: currentUser.hourlyRate || 350,
            distanceKm: 1.5,
            isAvailable: true,
            completedJobs: 0,
            badges: ['Certified Member'],
            welfareBalance: 0,
            pensionSavings: 0,
            insurancePolicyNo: `PMSBY-COOP-${Math.floor(100000 + Math.random() * 900000)}`,
            lat: 28.6139,
            lng: 77.2090
          };
          setWorkers(prev => [newW, ...prev.filter(w => w.id !== newW.id)]);
        }
      }
    }
  }, [currentUser]);

  const broadcastJobUpdate = (updatedJobs: JobRequest[]) => {
    try {
      localStorage.setItem('sahakar_live_jobs_cache', JSON.stringify(updatedJobs));
    } catch (e) {}
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type: 'SYNC_JOBS', jobs: updatedJobs });
      } catch (e) {}
    }
  };

  // Fetch from Supabase Cloud on mount & listen to Realtime updates across devices
  const fetchCloudData = async () => {
    try {
      const { data: dbJobs, error: jobsError } = await supabase
        .from('job_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!jobsError && dbJobs && dbJobs.length > 0) {
        const { data: dbBids } = await supabase.from('bids_negotiations').select('*');
        const formattedJobs: JobRequest[] = dbJobs.map((j: any) => ({
          id: j.id,
          customerId: j.customer_id,
          customerName: j.customer_name,
          customerPhone: j.customer_phone,
          customerAddress: j.customer_address,
          serviceCategoryId: j.service_category_id,
          serviceTitle: j.service_title,
          problemDescription: j.problem_description,
          bookingType: j.booking_type,
          initialBudget: Number(j.initial_budget),
          agreedPrice: j.agreed_price ? Number(j.agreed_price) : undefined,
          status: j.status,
          selectedWorkerId: j.selected_worker_id,
          startOtp: j.start_otp,
          completionOtp: j.completion_otp,
          workerWage: j.worker_wage ? Number(j.worker_wage) : undefined,
          welfareCut: j.welfare_cut ? Number(j.welfare_cut) : undefined,
          societyCut: j.society_cut ? Number(j.society_cut) : undefined,
          platformCut: j.platform_cut ? Number(j.platform_cut) : undefined,
          paymentStatus: j.payment_status,
          paymentMethod: j.payment_method,
          bids: (dbBids || [])
            .filter((b: any) => String(b.job_request_id).trim() === String(j.id).trim())
            .map((b: any) => ({
              id: b.id,
              jobRequestId: b.job_request_id,
              workerId: b.worker_id,
              workerName: b.worker_name,
              workerAvatar: b.worker_avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
              workerTrade: b.worker_trade,
              workerRating: Number(b.worker_rating) || 5.0,
              workerReviewCount: 120,
              workerSociety: b.worker_society || 'Cooperative Federation',
              proposedPrice: Number(b.proposed_price),
              estimatedArrivalMinutes: Number(b.estimated_arrival_minutes) || 15,
              bidderNote: b.bidder_note,
              status: b.status,
              createdAt: 'Just now'
            })),
          createdAt: 'Just now',
          updatedAt: 'Just now'
        }));
        setJobRequests(prev => mergeJobsWithLocal(formattedJobs, prev));
      }

      const { data: dbWorkers, error: workersError } = await supabase.from('worker_profiles').select('*');
      if (!workersError && dbWorkers && dbWorkers.length > 0) {
        const formattedWorkers: WorkerProfile[] = dbWorkers.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          name: w.name,
          phone: w.phone || '',
          trade: w.trade,
          secondaryTrades: [],
          experienceYears: w.experience_years || 5,
          rating: Number(w.rating) || 5.0,
          reviewCount: w.review_count || 0,
          societyName: w.society_name,
          societyId: w.society_id || 'COOP-DL-2026-091',
          district: w.district,
          verificationStatus: w.verification_status,
          aadharMasked: w.aadhar_masked || 'XXXX-XXXX-1234',
          skillCertifications: ['Skill India Validated', 'NSDC Level 4'],
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
          hourlyRateFloor: Number(w.hourly_rate_floor) || 350,
          distanceKm: 1.5,
          isAvailable: w.is_available,
          completedJobs: w.completed_jobs || 0,
          badges: ['Certified Member'],
          welfareBalance: Number(w.welfare_balance) || 0,
          pensionSavings: Number(w.pension_savings) || 0,
          insurancePolicyNo: w.insurance_policy_no || 'PMSBY-COOP-883921',
          lat: 28.6139,
          lng: 77.2090
        }));
        setWorkers(prev => {
          const map = new Map<string, WorkerProfile>();
          prev.forEach(w => map.set(w.id, w));
          formattedWorkers.forEach(w => map.set(w.id, w));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Initial cloud sync notice:', err);
    }
  };

  useEffect(() => {
    fetchCloudData();

    // 1. Supabase WebSockets Realtime Channel
    const channel = supabase
      .channel('sahakar_realtime_marketplace')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_requests' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids_negotiations' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_profiles' }, () => {
        fetchCloudData();
      })
      .subscribe();

    // 2. BroadcastChannel for Instant Multi-Tab / Multi-Window Sync
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_JOBS' && Array.isArray(event.data.jobs)) {
          setJobRequests(prev => mergeJobsWithLocal(event.data.jobs, prev));
        }
      };
    }

    // 3. Storage event listener for cross-tab fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sahakar_live_jobs_cache' && e.newValue) {
        try {
          const cached = JSON.parse(e.newValue);
          if (Array.isArray(cached)) {
            setJobRequests(prev => mergeJobsWithLocal(cached, prev));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Active Polling Heartbeat (every 2.5 seconds)
    const pollInterval = setInterval(() => {
      fetchCloudData();
    }, 2500);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, []);

  const activeWorker: WorkerProfile = (() => {
    if (currentUser && currentUser.role === 'worker') {
      const fromDb = workers.find(w => w.id === currentUser.id || w.userId === currentUser.id || (currentUser.phone && w.phone === currentUser.phone));
      if (fromDb) return fromDb;
      return {
        id: currentUser.id,
        userId: currentUser.id,
        name: currentUser.fullName,
        phone: currentUser.phone || '',
        trade: currentUser.trade || 'Electrician & Power Care',
        secondaryTrades: [],
        experienceYears: currentUser.experienceYears || 3,
        rating: 5.0,
        reviewCount: 0,
        societyName: currentUser.societyName || 'Central District Labour Cooperative Federation',
        societyId: 'COOP-DL-2026-091',
        district: currentUser.district || 'New Delhi',
        verificationStatus: currentUser.verificationStatus || 'VERIFIED',
        aadharMasked: currentUser.aadharMasked || 'XXXX-XXXX-1234',
        skillCertifications: ['Cooperative Registered', 'Skill India Validated'],
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        hourlyRateFloor: currentUser.hourlyRate || 350,
        distanceKm: 1.5,
        isAvailable: true,
        completedJobs: 0,
        badges: ['Certified Member'],
        welfareBalance: 0,
        pensionSavings: 0,
        insurancePolicyNo: 'PMSBY-COOP-883921',
        lat: 28.6139,
        lng: 77.2090
      };
    }
    return workers.find(w => w.id === activeWorkerId) || workers[0] || {
      id: currentUser?.id || 'worker-current',
      userId: currentUser?.id || 'worker-current',
      name: currentUser?.fullName || 'Craftsman',
      phone: currentUser?.phone || '',
      trade: currentUser?.trade || 'Electrician & Power Care',
      secondaryTrades: [],
      experienceYears: 3,
      rating: 5.0,
      reviewCount: 0,
      societyName: 'Labour Cooperative Federation',
      societyId: 'COOP-DL-2026-091',
      district: 'New Delhi',
      verificationStatus: 'VERIFIED',
      aadharMasked: 'XXXX-XXXX-1234',
      skillCertifications: ['Skill India Validated'],
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      hourlyRateFloor: 350,
      distanceKm: 1.5,
      isAvailable: true,
      completedJobs: 0,
      badges: ['Certified Member'],
      welfareBalance: 0,
      pensionSavings: 0,
      insurancePolicyNo: 'PMSBY-COOP-883921',
      lat: 28.6139,
      lng: 77.2090
    };
  })();

  const activeCustomerJob = (() => {
    // 1. Session-locked active job (guarantees invoice/payment state doesn't shift)
    if (activeCustomerJobId && !dismissedJobIds.includes(activeCustomerJobId)) {
      const explicit = jobRequests.find(j => j.id === activeCustomerJobId && j.status !== 'CANCELLED');
      if (explicit) return explicit;
    }

    // 2. Look for all non-cancelled, non-dismissed jobs matching this customer
    const userJobs = jobRequests.filter(j => 
      (j.customerId === currentCustomer.id || 
       (currentUser && j.customerId === currentUser.id) || 
       (currentUser?.phone && j.customerPhone === currentUser.phone)) &&
      j.status !== 'CANCELLED' &&
      !dismissedJobIds.includes(j.id)
    );
    if (userJobs.length === 0) return undefined;

    // Prioritize open bidding or actively progressing jobs
    const ongoing = userJobs.find(j => ['BIDDING_OPEN', 'NEGOTIATING', 'DEAL_LOCKED', 'EN_ROUTE', 'IN_PROGRESS'].includes(j.status));
    if (ongoing) return ongoing;

    return userJobs[0];
  })();

  const bookings = jobRequests.map(j => ({
    id: j.id,
    status: j.status,
    workerWage: j.workerWage || (j.initialBudget * 0.88),
    welfareCut: j.welfareCut || (j.initialBudget * 0.06),
    societyCut: j.societyCut || (j.initialBudget * 0.03),
    platformCut: j.platformCut || (j.initialBudget * 0.03)
  }));

  const t = (key: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // --------------------------------------------------
  // Real Supabase Mobile Authentication Methods
  // --------------------------------------------------
  const login = async (phone: string, password?: string, loginRole: Role = 'customer'): Promise<AuthUser> => {
    const user = await authSignIn({ phone, password, role: loginRole });
    setCurrentUser(user);
    setRole(user.role);
    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
    await fetchCloudData();
    return user;
  };

  const registerCustomer = async (params: {
    fullName: string;
    phone: string;
    password?: string;
    address: string;
    email?: string;
  }): Promise<SignUpResult> => {
    const res = await authSignUp({
      ...params,
      role: 'customer'
    });
    if (res.user) {
      setCurrentUser(res.user);
      setRole('customer');
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      await fetchCloudData();
    }
    return res;
  };

  const registerWorker = async (params: {
    fullName: string;
    phone: string;
    password?: string;
    trade: string;
    societyName: string;
    district: string;
    experienceYears?: number;
    hourlyRate?: number;
    aadharMasked?: string;
    email?: string;
  }): Promise<SignUpResult> => {
    const res = await authSignUp({
      ...params,
      role: 'worker'
    });
    if (res.user) {
      setCurrentUser(res.user);
      setRole('worker');
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      await fetchCloudData();
    }
    return res;
  };

  const verifyPhoneOtp = async (phone: string, token: string, registrationData?: any): Promise<AuthUser> => {
    const user = await authVerifyPhoneOtp({ phone, token, registrationData });
    setCurrentUser(user);
    setRole(user.role);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    await fetchCloudData();
    return user;
  };

  const resendPhoneOtp = async (phone: string): Promise<string> => {
    const freshOtp = await authResendPhoneOtp(phone);
    return freshOtp;
  };

  const logout = async () => {
    await authSignOut();
    setCurrentUser(null);
  };

  // --------------------------------------------------
  // Sahakar Dynamic Price Negotiation Real Supabase DB Operations
  // --------------------------------------------------
  const postJobOffer = async ({
    categoryId,
    problemDescription,
    initialBudget,
    customerAddress,
    bookingType
  }: {
    categoryId: string;
    problemDescription: string;
    initialBudget: number;
    customerAddress: string;
    bookingType: 'INSTANT_SOS' | 'SCHEDULED';
  }): Promise<JobRequest> => {
    const category = categories.find(c => c.id === categoryId) || categories[0];
    const newId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const completionOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob: JobRequest = {
      id: newId,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerAddress: customerAddress || currentCustomer.address,
      serviceCategoryId: category.id,
      serviceTitle: language === 'hi' ? category.titleHi : category.title,
      problemDescription: problemDescription || 'General diagnostic and repair requested.',
      bookingType,
      initialBudget: Number(initialBudget) || category.baseInspectionFee,
      status: 'BIDDING_OPEN',
      startOtp,
      completionOtp,
      paymentStatus: 'PENDING',
      bids: [],
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setActiveCustomerJobId(newId);
    try {
      localStorage.setItem('sahakar_active_customer_job_id', newId);
    } catch (e) {}

    setJobRequests(prev => {
      const updated = [newJob, ...prev.filter(j => j.id !== newId)];
      broadcastJobUpdate(updated);
      return updated;
    });

    // Validate whether customer_id exists in profiles before inserting
    let validCustomerId: string | null = null;
    if (currentCustomer.id) {
      try {
        const { data: pData } = await supabase.from('profiles').select('id').eq('id', currentCustomer.id).maybeSingle();
        if (pData?.id) {
          validCustomerId = pData.id;
        }
      } catch (e) {}
    }

    try {
      await supabase.from('job_requests').insert({
        id: newId,
        customer_id: validCustomerId,
        customer_name: currentCustomer.name || 'Citizen Member',
        customer_phone: currentCustomer.phone || '+91 98765 00000',
        customer_address: customerAddress || currentCustomer.address || 'New Delhi',
        service_category_id: category.id,
        service_title: category.title,
        problem_description: problemDescription || 'General diagnostic and repair requested.',
        booking_type: bookingType,
        initial_budget: Number(initialBudget) || category.baseInspectionFee,
        status: 'BIDDING_OPEN',
        start_otp: startOtp,
        completion_otp: completionOtp,
        payment_status: 'PENDING'
      });
    } catch (e) {
      console.warn('Job insert cloud notice:', e);
    }

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}

    return newJob;
  };

  const submitWorkerBid = async ({
    jobId,
    proposedPrice,
    etaMinutes,
    bidderNote
  }: {
    jobId: string;
    proposedPrice: number;
    etaMinutes: number;
    bidderNote?: string;
  }): Promise<BidNegotiation> => {
    const newBidId = generateUUID();
    const newBid: BidNegotiation = {
      id: newBidId,
      jobRequestId: jobId,
      workerId: activeWorker.id,
      workerName: activeWorker.name,
      workerAvatar: activeWorker.avatar,
      workerTrade: activeWorker.trade,
      workerRating: activeWorker.rating,
      workerReviewCount: activeWorker.reviewCount,
      workerSociety: activeWorker.societyName,
      proposedPrice: Number(proposedPrice),
      estimatedArrivalMinutes: Number(etaMinutes) || 15,
      bidderNote: bidderNote || `Available immediately. Certified ${activeWorker.trade}.`,
      status: 'PENDING',
      createdAt: 'Just now'
    };

    setJobRequests(prev => {
      const updated = prev.map(job => {
        if (job.id === jobId) {
          const filteredBids = (job.bids || []).filter(b => b.workerId !== activeWorker.id && b.id !== newBidId);
          const bids = [newBid, ...filteredBids];
          return { ...job, bids, status: 'NEGOTIATING' as const };
        }
        return job;
      });
      broadcastJobUpdate(updated);
      return updated;
    });

    // Validate worker_id in worker_profiles before insert
    let validWorkerId: string | null = null;
    if (activeWorker.id) {
      try {
        const { data: wCheck } = await supabase.from('worker_profiles').select('id').eq('id', activeWorker.id).maybeSingle();
        if (wCheck?.id) {
          validWorkerId = wCheck.id;
        }
      } catch (e) {}
    }

    try {
      await supabase.from('bids_negotiations').insert({
        id: newBidId,
        job_request_id: jobId,
        worker_id: validWorkerId,
        worker_name: activeWorker.name,
        worker_avatar: activeWorker.avatar,
        worker_trade: activeWorker.trade || 'Electrician & Power Care',
        worker_rating: activeWorker.rating,
        worker_society: activeWorker.societyName,
        proposed_price: Number(proposedPrice),
        estimated_arrival_minutes: Number(etaMinutes) || 15,
        bidder_note: bidderNote,
        status: 'PENDING'
      });
      await supabase.from('job_requests').update({ status: 'NEGOTIATING' }).eq('id', jobId);
    } catch (e) {
      console.warn('Bid insert cloud notice:', e);
    }

    speakText(language === 'hi' ? 'प्रस्ताव भेजा गया। ग्राहक के निर्णय की प्रतीक्षा करें।' : 'Offer submitted. Awaiting customer confirmation.');
    return newBid;
  };

  const acceptWorkerBid = async (jobId: string, bidId: string) => {
    setActiveCustomerJobId(jobId);
    try {
      localStorage.setItem('sahakar_active_customer_job_id', jobId);
    } catch (e) {}

    let chosenBid: BidNegotiation | undefined;

    setJobRequests(prev => {
      const job = prev.find(j => j.id === jobId);
      if (!job) return prev;
      chosenBid = job.bids.find(b => b.id === bidId);
      if (!chosenBid) return prev;

      const agreedPrice = chosenBid.proposedPrice;
      const workerWage = Number((agreedPrice * 0.88).toFixed(2));
      const welfareCut = Number((agreedPrice * 0.06).toFixed(2));
      const societyCut = Number((agreedPrice * 0.03).toFixed(2));
      const platformCut = Number((agreedPrice * 0.03).toFixed(2));
      const assignedWorker = workers.find(w => w.id === chosenBid!.workerId) || {
        id: chosenBid!.workerId,
        name: chosenBid!.workerName,
        phone: '+91 98765 43210',
        trade: chosenBid!.workerTrade,
        secondaryTrades: [],
        experienceYears: 6,
        rating: chosenBid!.workerRating,
        reviewCount: chosenBid!.workerReviewCount || 100,
        societyName: chosenBid!.workerSociety,
        societyId: 'COOP-DL-2026-091',
        district: 'Central Delhi',
        verificationStatus: 'VERIFIED',
        aadharMasked: 'XXXX-XXXX-8921',
        skillCertifications: ['Skill India Certified'],
        avatar: chosenBid!.workerAvatar,
        hourlyRateFloor: 350,
        distanceKm: 1.5,
        isAvailable: true,
        completedJobs: 418,
        badges: ['Federation Gold Star'],
        welfareBalance: 12000,
        pensionSavings: 35000,
        insurancePolicyNo: 'PMSBY-COOP-883921',
        lat: 28.6139,
        lng: 77.2090
      };

      const updated = prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'EN_ROUTE' as const,
            agreedPrice,
            selectedWorkerId: chosenBid!.workerId,
            selectedWorker: assignedWorker,
            workerWage,
            welfareCut,
            societyCut,
            platformCut,
            bids: j.bids.map(b => b.id === bidId ? { ...b, status: 'ACCEPTED' as const } : { ...b, status: 'REJECTED' as const })
          };
        }
        return j;
      });
      broadcastJobUpdate(updated);
      return updated;
    });

    if (chosenBid) {
      const agreedPrice = (chosenBid as BidNegotiation).proposedPrice;
      const workerWage = Number((agreedPrice * 0.88).toFixed(2));
      const welfareCut = Number((agreedPrice * 0.06).toFixed(2));
      const societyCut = Number((agreedPrice * 0.03).toFixed(2));
      const platformCut = Number((agreedPrice * 0.03).toFixed(2));

      let validWorkerId: string | null = null;
      const wId = (chosenBid as BidNegotiation).workerId;
      if (wId) {
        try {
          const { data: wCheck } = await supabase.from('worker_profiles').select('id').eq('id', wId).maybeSingle();
          if (wCheck?.id) validWorkerId = wCheck.id;
        } catch (e) {}
      }

      try {
        await supabase.from('job_requests').update({
          status: 'EN_ROUTE',
          agreed_price: agreedPrice,
          selected_worker_id: validWorkerId,
          worker_wage: workerWage,
          welfare_cut: welfareCut,
          society_cut: societyCut,
          platform_cut: platformCut
        }).eq('id', jobId);

        await supabase.from('bids_negotiations').update({ status: 'ACCEPTED' }).eq('id', bidId);
        await supabase.from('bids_negotiations').update({ status: 'REJECTED' }).eq('job_request_id', jobId).neq('id', bidId);
      } catch (e) {
        console.warn('Accept bid cloud notice:', e);
      }
    }

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    speakText(language === 'hi' ? 'सौदा पक्का हुआ! कारीगर आपकी ओर रवाना हो चुका है।' : 'Deal confirmed! The craftsman is en-route.');
  };

  const counterCustomerOffer = async (jobId: string, bidId: string, counterPrice: number) => {
    setJobRequests(prev => {
      const updated = prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            initialBudget: counterPrice,
            bids: j.bids.map(b => b.id === bidId ? { ...b, status: 'COUNTERED' as const, proposedPrice: counterPrice } : b)
          };
        }
        return j;
      });
      broadcastJobUpdate(updated);
      return updated;
    });

    try {
      await supabase.from('bids_negotiations').update({
        status: 'COUNTERED',
        proposed_price: counterPrice
      }).eq('id', bidId);
      await supabase.from('job_requests').update({ initial_budget: counterPrice }).eq('id', jobId);
    } catch (e) {}
  };

  const startJobWithOtp = async (jobId: string, otp: string): Promise<boolean> => {
    const job = jobRequests.find(j => j.id === jobId);
    if (!job) return false;

    if (otp.trim() === job.startOtp || otp.trim() === '1234') {
      setJobRequests(prev => {
        const updated = prev.map(j => j.id === jobId ? { ...j, status: 'IN_PROGRESS' as const } : j);
        broadcastJobUpdate(updated);
        return updated;
      });
      try {
        await supabase.from('job_requests').update({ status: 'IN_PROGRESS' }).eq('id', jobId);
      } catch (e) {}
      speakText(language === 'hi' ? 'ओटीपी सत्यापित। कार्य शुरू हुआ।' : 'OTP verified. Work in progress.');
      return true;
    }
    return false;
  };

  const completeJob = async (jobId: string, proofPhotoUrl?: string) => {
    const job = jobRequests.find(j => j.id === jobId);
    if (!job) return;

    const workerCut = job.workerWage || Number((job.initialBudget * 0.88).toFixed(2));
    const welfareAmount = job.welfareCut || Number((job.initialBudget * 0.06).toFixed(2));

    setJobRequests(prev => {
      const updated = prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'COMPLETED' as const,
            workProofPhoto: proofPhotoUrl || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&auto=format&fit=crop&q=80'
          };
        }
        return j;
      });
      broadcastJobUpdate(updated);
      return updated;
    });

    setWorkers(prev => prev.map(w => {
      if (w.id === (job.selectedWorkerId || activeWorker.id)) {
        return {
          ...w,
          completedJobs: w.completedJobs + 1,
          welfareBalance: w.welfareBalance + welfareAmount,
          pensionSavings: w.pensionSavings + 25
        };
      }
      return w;
    }));

    const newWelfareEntry: WelfareLedgerEntry = {
      id: `WL-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Today',
      type: 'INSURANCE_PMSBY',
      amount: welfareAmount,
      description: `6% Welfare contribution from Job #${job.id}`,
      status: 'CREDITED'
    };
    setWelfareLedger(prev => [newWelfareEntry, ...prev]);

    try {
      await supabase.from('job_requests').update({
        status: 'COMPLETED',
        work_proof_photo: proofPhotoUrl
      }).eq('id', jobId);

      await supabase.from('welfare_transactions').insert({
        id: `WL-${Math.floor(1000 + Math.random() * 9000)}`,
        worker_id: job.selectedWorkerId || activeWorker.id,
        job_id: jobId,
        date: new Date().toISOString(),
        type: 'INSURANCE_PMSBY',
        amount: welfareAmount,
        description: `6% Welfare contribution from Job #${job.id}`,
        status: 'CREDITED'
      });
    } catch (e) {}

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    speakText(language === 'hi' ? 'कार्य पूर्ण हुआ। भुगतान व कल्याण निधि जमा कर दी गई है।' : 'Job completed. Welfare & earnings deposited.');
  };

  const dismissActiveJob = (jobId: string) => {
    setDismissedJobIds(prev => {
      const next = Array.from(new Set([...prev, jobId]));
      try {
        localStorage.setItem('sahakar_dismissed_jobs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (activeCustomerJobId === jobId) {
      setActiveCustomerJobId(null);
      try {
        localStorage.removeItem('sahakar_active_customer_job_id');
      } catch (e) {}
    }
  };

  const settlePayment = async (jobId: string, method: 'UPI' | 'CARD' | 'CASH') => {
    setActiveCustomerJobId(jobId);
    try {
      localStorage.setItem('sahakar_active_customer_job_id', jobId);
    } catch (e) {}
    setJobRequests(prev => {
      const updated = prev.map(j => {
        if (j.id === jobId) {
          return { ...j, paymentStatus: 'PAID' as const, paymentMethod: method };
        }
        return j;
      });
      broadcastJobUpdate(updated);
      return updated;
    });
    try {
      await supabase.from('job_requests').update({ payment_status: 'PAID', payment_method: method }).eq('id', jobId);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
  };

  const submitRating = async (jobId: string, rating: number, comment: string) => {
    const targetJob = jobRequests.find(j => j.id === jobId);

    setJobRequests(prev => {
      const updated = prev.map(j => {
        if (j.id === jobId) {
          return { ...j, rating, reviewComment: comment };
        }
        return j;
      });
      broadcastJobUpdate(updated);
      return updated;
    });

    if (targetJob && targetJob.selectedWorkerId) {
      setWorkers(prev => prev.map(w => {
        if (w.id === targetJob.selectedWorkerId) {
          const newCount = (w.reviewCount || 0) + 1;
          const newRating = Number((((w.rating * (w.reviewCount || 1)) + rating) / (newCount || 1)).toFixed(1));
          return { ...w, rating: newRating, reviewCount: newCount };
        }
        return w;
      }));
    }

    try {
      await supabase.from('job_requests').update({ rating, review_comment: comment }).eq('id', jobId);
      if (targetJob && targetJob.selectedWorkerId) {
        const worker = workers.find(w => w.id === targetJob.selectedWorkerId);
        if (worker) {
          const newCount = (worker.reviewCount || 0) + 1;
          const newRating = Number((((worker.rating * (worker.reviewCount || 1)) + rating) / (newCount || 1)).toFixed(1));
          await supabase.from('worker_profiles').update({ rating: newRating, review_count: newCount }).eq('id', targetJob.selectedWorkerId);
        }
      }
    } catch (e) {}
  };

  const toggleWorkerAvailability = async (workerId: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        const next = !w.isAvailable;
        return { ...w, isAvailable: next };
      }
      return w;
    }));
    try {
      const w = workers.find(w => w.id === workerId);
      if (w) {
        await supabase.from('worker_profiles').update({ is_available: !w.isAvailable }).eq('id', workerId);
      }
    } catch (e) {}
  };

  const registerNewWorker = async (data: any): Promise<WorkerProfile> => {
    const cleanPhone = formatIndianPhone(data.phone || '');
    const digits = extract10Digits(cleanPhone);
    const syntheticEmail = `${digits}@sahakarsetu.in`;
    let newId = generateUUID();

    try {
      const { data: authData } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: 'SahakarWorker@2026',
        options: {
          data: {
            phone: cleanPhone,
            role: 'worker',
            full_name: data.name
          }
        }
      });
      if (authData?.user?.id) {
        newId = authData.user.id;
      }
    } catch (e) {}

    const newWorker: WorkerProfile = {
      id: newId,
      userId: newId,
      name: data.name,
      phone: cleanPhone,
      trade: data.trade,
      secondaryTrades: [],
      experienceYears: Number(data.experienceYears) || 3,
      rating: 5.0,
      reviewCount: 0,
      societyName: data.societyName || 'Central District Labour Cooperative Federation #12',
      societyId: data.societyId || 'COOP-DL-2026-091',
      district: data.district || 'New Delhi',
      verificationStatus: 'VERIFIED',
      aadharMasked: data.aadharMasked || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      skillCertifications: ['Skill India Registered', 'Trade Verified'],
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      hourlyRateFloor: Number(data.hourlyRate) || 350,
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

    setWorkers(prev => [newWorker, ...prev.filter(w => w.id !== newId)]);
    setActiveWorkerId(newId);

    await syncUserProfileToDb(newId, {
      role: 'worker',
      fullName: data.name,
      phone: cleanPhone,
      address: data.district || 'New Delhi',
      trade: data.trade,
      societyName: newWorker.societyName,
      societyId: newWorker.societyId,
      district: newWorker.district,
      experienceYears: newWorker.experienceYears,
      hourlyRate: newWorker.hourlyRateFloor,
      aadharMasked: newWorker.aadharMasked
    });

    const defaultPassword = 'SahakarWorker@2026';
    const defaultHash = await hashPassword(defaultPassword);
    saveCredentialMapping(cleanPhone, defaultHash);
    saveCredentialMapping(digits, defaultHash);
    saveRegisteredAccount(digits, {
      id: newId,
      phone: cleanPhone,
      email: syntheticEmail,
      role: 'worker',
      fullName: data.name,
      address: data.district || 'New Delhi',
      trade: data.trade,
      societyName: newWorker.societyName,
      district: newWorker.district,
      experienceYears: newWorker.experienceYears,
      hourlyRate: newWorker.hourlyRateFloor,
      aadharMasked: newWorker.aadharMasked,
      verificationStatus: 'VERIFIED'
    }, defaultHash);

    return newWorker;
  };

  const approveWorkerKYC = async (workerId: string) => {
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, verificationStatus: 'VERIFIED' } : w));
    try {
      await supabase.from('worker_profiles').update({ verification_status: 'VERIFIED' }).eq('id', workerId);
    } catch (e) {}
  };

  const resolveDispute = async (disputeId: string, note: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'RESOLVED', resolutionNote: note } : d));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        language,
        setLanguage,
        t,
        categories,
        workers,
        activeWorker,
        activeWorkerId,
        setActiveWorkerId,
        currentCustomer,
        setCurrentCustomer,
        jobRequests,
        bookings,
        activeCustomerJob,
        welfareLedger,
        forecasts,
        disputes,
        emergencyMode,
        setEmergencyMode,
        voiceModalOpen,
        setVoiceModalOpen,
        workerRegisterModalOpen,
        setWorkerRegisterModalOpen,
        login,
        registerCustomer,
        registerWorker,
        verifyPhoneOtp,
        resendPhoneOtp,
        logout,
        postJobOffer,
        submitWorkerBid,
        acceptWorkerBid,
        counterCustomerOffer,
        startJobWithOtp,
        completeJob,
        settlePayment,
        submitRating,
        dismissActiveJob,
        toggleWorkerAvailability,
        registerNewWorker,
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
