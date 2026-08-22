export type Role = 'customer' | 'worker' | 'admin';

export type Language = 'en' | 'hi' | 'ta' | 'mr' | 'bn' | 'te';

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
  standardItems: ServiceItem[];
  emergencyAvailable: boolean;
}

export interface WorkerProfile {
  id: string;
  name: string;
  nameHi?: string;
  phone: string;
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
  hourlyRate: number;
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

export type BookingStatus = 
  | 'SEARCHING'
  | 'MATCHED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceCategoryId: string;
  serviceTitle: string;
  selectedItems: { item: ServiceItem; quantity: number }[];
  bookingType: 'INSTANT_SOS' | 'SCHEDULED';
  scheduledTime: string;
  status: BookingStatus;
  workerId?: string;
  worker?: WorkerProfile;
  startOtp: string;
  completionOtp: string;
  totalAmount: number;
  workerWage: number;
  welfareCut: number;
  societyCut: number;
  platformCut: number;
  paymentStatus: 'PENDING' | 'PAID' | 'ESCROW';
  paymentMethod?: 'UPI' | 'CARD' | 'CASH';
  createdAt: string;
  completedAt?: string;
  rating?: number;
  reviewComment?: string;
  workProofPhoto?: string;
  problemDescription?: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  customerName: string;
  workerName: string;
  issueCategory: string;
  description: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  filedDate: string;
  resolutionNote?: string;
}

export interface DemandForecast {
  id: string;
  district: string;
  trade: string;
  currentAvailableWorkers: number;
  predictedDemand: number;
  surgeLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT';
  weatherTrigger?: string;
  reason: string;
  recommendation: string;
  recommendedMobilization?: number;
}

export interface WelfareLedgerEntry {
  id: string;
  date: string;
  type: 'INSURANCE_PMSBY' | 'PENSION_SAVINGS' | 'DISTRESS_GRANT' | 'DIVIDEND_PAYOUT';
  amount: number;
  description: string;
  status: 'CREDITED' | 'DEBITED';
}
