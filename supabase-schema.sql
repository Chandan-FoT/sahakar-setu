-- =========================================================
-- SahakarSetu (सहकार सेतु) — Complete Supabase SQL Schema & Realtime Setup
-- Copy and paste this directly into your Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 0. QUICK MIGRATION FOR EXISTING TABLES (Fixes Foreign Key & UUID syntax errors)
-- =========================================================
ALTER TABLE IF EXISTS public.bids_negotiations DROP CONSTRAINT IF EXISTS bids_negotiations_worker_id_fkey;
ALTER TABLE IF EXISTS public.bids_negotiations DROP CONSTRAINT IF EXISTS bids_negotiations_job_request_id_fkey;
ALTER TABLE IF EXISTS public.job_requests DROP CONSTRAINT IF EXISTS job_requests_customer_id_fkey;
ALTER TABLE IF EXISTS public.job_requests DROP CONSTRAINT IF EXISTS job_requests_selected_worker_id_fkey;
ALTER TABLE IF EXISTS public.worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_user_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.worker_profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.worker_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.job_requests ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.job_requests ALTER COLUMN customer_id TYPE TEXT;
ALTER TABLE IF EXISTS public.job_requests ALTER COLUMN selected_worker_id TYPE TEXT;
ALTER TABLE IF EXISTS public.bids_negotiations ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.bids_negotiations ALTER COLUMN job_request_id TYPE TEXT;
ALTER TABLE IF EXISTS public.bids_negotiations ALTER COLUMN worker_id TYPE TEXT;
ALTER TABLE IF EXISTS public.welfare_transactions ALTER COLUMN worker_id TYPE TEXT;

-- =========================================================
-- 1. PROFILES TABLE (Linked with Mobile Auth & Profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2. WORKER PROFILES TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  trade TEXT NOT NULL,
  experience_years INT DEFAULT 3,
  society_name TEXT NOT NULL,
  society_id TEXT NOT NULL,
  district TEXT NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'SUSPENDED')),
  aadhar_masked TEXT,
  hourly_rate_floor NUMERIC(10, 2) DEFAULT 300.00,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  welfare_balance NUMERIC(10, 2) DEFAULT 0.00,
  pension_savings NUMERIC(10, 2) DEFAULT 0.00,
  insurance_policy_no TEXT,
  lat NUMERIC(10, 7) DEFAULT 28.6139,
  lng NUMERIC(10, 7) DEFAULT 77.2090,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. JOB REQUESTS TABLE (Sahakar Dynamic Price Negotiation & Orders)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.job_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT NOT NULL,
  service_category_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  problem_description TEXT,
  booking_type VARCHAR(20) DEFAULT 'INSTANT_SOS' CHECK (booking_type IN ('INSTANT_SOS', 'SCHEDULED')),
  initial_budget NUMERIC(10, 2) NOT NULL,
  agreed_price NUMERIC(10, 2),
  status VARCHAR(20) DEFAULT 'BIDDING_OPEN' CHECK (status IN ('BIDDING_OPEN', 'NEGOTIATING', 'DEAL_LOCKED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  selected_worker_id TEXT,
  start_otp VARCHAR(6) NOT NULL,
  completion_otp VARCHAR(6) NOT NULL,
  worker_wage NUMERIC(10, 2),    -- 88%
  welfare_cut NUMERIC(10, 2),    -- 6%
  society_cut NUMERIC(10, 2),    -- 3%
  platform_cut NUMERIC(10, 2),   -- 3%
  payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'ESCROW', 'PAID')),
  payment_method VARCHAR(20) DEFAULT 'UPI',
  rating INT,
  review_comment TEXT,
  work_proof_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 4. BIDS & NEGOTIATIONS TABLE (Worker Counter-Offers & Realtime Bids)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.bids_negotiations (
  id TEXT PRIMARY KEY,
  job_request_id TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  worker_avatar TEXT,
  worker_trade TEXT NOT NULL,
  worker_rating NUMERIC(3, 2) DEFAULT 5.0,
  worker_society TEXT,
  proposed_price NUMERIC(10, 2) NOT NULL,
  estimated_arrival_minutes INT DEFAULT 15,
  bidder_note TEXT,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 5. WELFARE TRANSACTIONS LEDGER (PMSBY & Micro-Pensions)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.welfare_transactions (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  job_id TEXT,
  date TEXT NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('INSURANCE_PMSBY', 'PENSION_SAVINGS', 'DISTRESS_GRANT', 'DIVIDEND_PAYOUT')),
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'CREDITED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 6. REALTIME ENABLEMENT (Enable Supabase Realtime Replication)
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids_negotiations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.worker_profiles;

-- =========================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read & authenticated write policies for demonstration
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Workers are readable by everyone" ON public.worker_profiles;
CREATE POLICY "Workers are readable by everyone" ON public.worker_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Workers can be created" ON public.worker_profiles;
CREATE POLICY "Workers can be created" ON public.worker_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Job requests are readable by everyone" ON public.job_requests;
CREATE POLICY "Job requests are readable by everyone" ON public.job_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "Bids are readable by everyone" ON public.bids_negotiations;
CREATE POLICY "Bids are readable by everyone" ON public.bids_negotiations FOR ALL USING (true);

DROP POLICY IF EXISTS "Welfare transactions readable by everyone" ON public.welfare_transactions;
CREATE POLICY "Welfare transactions readable by everyone" ON public.welfare_transactions FOR ALL USING (true);
