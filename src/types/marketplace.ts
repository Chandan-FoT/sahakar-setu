export type Role = 'customer' | 'worker' | 'admin';
export type Language = 'en' | 'hi' | 'ta' | 'mr' | 'bn' | 'te';

export interface AuthUser {
  id: string;
  phone: string;
  role: Role;
  fullName: string;
  email?: string;
  address?: string;
  trade?: string;
  societyName?: string;
  district?: string;
  experienceYears?: number;
  hourlyRate?: number;
  aadharMasked?: string;
  avatar?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  rating?: number;
}

export interface WorkerProfile {
  id: string;
  userId?: string;
  name: string;
  nameHi?: string;
  phone: string;
  email?: string;
  trade: string;
  tradeHi?: string;
  secondaryTrades: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  societyName: string;
  societyId: string;
  district: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  aadharMasked: string;
  skillCertifications: string[];
  avatar: string;
  hourlyRateFloor: number;
  distanceKm: number;
  isAvailable: boolean;
  completedJobs: number;
  badges: string[];
  welfareBalance: number;
  pensionSavings: number;
  insurancePolicyNo: string;
  lat: number;
  lng: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  nameHi: string;
  baseRate: number;
  unit: string;
  durationMinutes: number;
}

export interface ServiceCategory {
  id: string;
  title: string;
  titleHi: string;
  icon: string;
  color: string;
  badge?: string;
  description: string;
  descriptionHi: string;
  baseInspectionFee: number;
  emergencyAvailable: boolean;
  standardItems: ServiceItem[];
}

export type JobStatus = 
  | 'BIDDING_OPEN'    // Customer posted initial budget, waiting for bids
  | 'NEGOTIATING'     // Counter-offers are being exchanged
  | 'DEAL_LOCKED'     // Price agreed upon, worker assigned
  | 'EN_ROUTE'        // Worker is navigating to customer address
  | 'IN_PROGRESS'     // Start OTP verified, repair underway
  | 'COMPLETED'       // Work finished & verified
  | 'CANCELLED';

export interface BidNegotiation {
  id: string;
  jobRequestId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerTrade: string;
  workerRating: number;
  workerReviewCount: number;
  workerSociety: string;
  proposedPrice: number;
  estimatedArrivalMinutes: number;
  bidderNote?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  createdAt: string;
}

export interface JobRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceCategoryId: string;
  serviceTitle: string;
  problemDescription: string;
  bookingType: 'INSTANT_SOS' | 'SCHEDULED';
  initialBudget: number;
  agreedPrice?: number;
  status: JobStatus;
  selectedWorkerId?: string;
  selectedWorker?: WorkerProfile;
  bids: BidNegotiation[];
  startOtp: string;
  completionOtp: string;
  workerWage?: number;    // 88%
  welfareCut?: number;    // 6%
  societyCut?: number;    // 3%
  platformCut?: number;   // 3%
  paymentStatus: 'PENDING' | 'ESCROW' | 'PAID';
  paymentMethod?: 'UPI' | 'CARD' | 'CASH';
  workProofPhoto?: string;
  rating?: number;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WelfareLedgerEntry {
  id: string;
  date: string;
  type: 'INSURANCE_PMSBY' | 'PENSION_SAVINGS' | 'DISTRESS_GRANT' | 'DIVIDEND_PAYOUT';
  amount: number;
  description: string;
  status: 'CREDITED' | 'DEBITED';
}
