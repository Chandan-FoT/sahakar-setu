# SahakarSetu (सहकार सेतु) — System Requirements & Architecture Specification

**Decentralized Cooperative-Owned Digital Service Marketplace**  
*Built for the National Labour Cooperative Federation (NLCF) & Ministry of Cooperation*  
*Smart India Hackathon (SIH) | Production-Grade Reference Implementation*

---

## 1. Executive Summary & Core Concept

**SahakarSetu (सहकार सेतु)** is a decentralized, cooperative-owned digital home and facility service marketplace. It eliminates predatory commercial aggregators (who charge 25%–35% commissions and impose algorithmic penalties) by connecting verified, skilled tradespeople from Primary Labour Cooperative Societies directly with citizens and institutions.

### Core Value Pillars:
- **88/6/3/3 Fair-Wage Model**: 88% goes directly to the worker's wallet, 6% to worker social security (PMSBY accident insurance + micro-pensions), 3% to the Primary Cooperative Society reserve fund, and 3% for technology maintenance.
- **Democratic Dynamic Negotiation**: Transparent, two-way bidding between customer and worker with guaranteed wage floors.
- **Cryptographic Security Handshake**: Physical 4-digit Start OTP validation prevents unauthorized starts or ghost billing.
- **Real BharatQR & UPI Payment**: Direct mobile payments settled via dynamic QR and deep links (`chandan.bank@pingpay`).
- **Multilingual Voice AI**: Speech synthesis and recognition in Hindi and English tailored for low-literacy craftsmen.

---

## 2. Complete End-to-End Application Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 🏠 Citizen / Customer
    actor Worker as 👷 Cooperative Craftsman
    participant App as ⚡ SahakarSetu (React + Context)
    participant Cloud as 🗄️ Supabase Cloud (PostgreSQL)

    Note over Customer,Worker: Step 1: Authentication & Identity
    Customer->>App: Sign up / Log in via Mobile Number + SMS OTP + Password
    App->>Cloud: Validates credentials via salted SHA-256 & 10-digit match
    Worker->>App: Registers with Trade, Society, & Masked Aadhaar
    App->>Cloud: Persists to `worker_profiles` with verified trade credentials

    Note over Customer,Worker: Step 2: Service Request & SOS Dispatch
    Customer->>App: Creates request (e.g. Electrician, ₹350 budget, SOS 30-min)
    App->>Cloud: Inserts job record in `job_requests` (Status: `SEARCHING`)
    Cloud-->>Worker: Broadcasts to matching craftsmen via WebSockets & Radar

    Note over Customer,Worker: Step 3: Cooperative Dynamic Bidding
    Worker->>App: Reviews job scope & submits custom bid (e.g. ₹400, 15 min ETA)
    App->>Cloud: Writes offer to `bids_negotiations`
    Cloud-->>Customer: Real-time update displays bids with Worker KYC & Rating

    Note over Customer,Worker: Step 4: Deal Acceptance & Start OTP Handshake
    Customer->>App: Accepts chosen worker's bid
    App->>Cloud: Updates job status to `EN_ROUTE` & generates 4-digit Start OTP
    App-->>Customer: Displays locked physical Start OTP (e.g. 7102)
    Worker->>Customer: Physically arrives at location & asks for Start OTP
    Worker->>App: Enters 4-digit Start OTP into Worker Portal
    App->>Cloud: Validates OTP match -> updates job status to `IN_PROGRESS`

    Note over Customer,Worker: Step 5: Work Execution & PMSBY Insurance
    Note over Customer,Worker: Live job timer active; PMSBY ₹2,00,000 accidental cover enabled

    Note over Customer,Worker: Step 6: Work Completion & 88/6/3/3 Escrow Split
    Worker->>App: Taps "Mark Job Finished"
    App->>Cloud: Updates job status to `COMPLETED`
    App->>App: Calculates split: 88% Worker, 6% Welfare, 3% Society, 3% Infra

    Note over Customer,Worker: Step 7: BharatQR & Mobile UPI Payment
    Customer->>App: Scans dynamic BharatQR (chandan.bank@pingpay) or taps UPI app
    Customer->>App: Taps "Confirm & Pay via UPI"
    App->>Cloud: Sets payment_status = `PAID`

    Note over Customer,Worker: Step 8: GST Tax Invoice & Session Lock
    App-->>Customer: Renders locked official GST tax invoice with 5-star rating
    Customer->>App: Rates service & taps "Book Next Service" to unlock new booking
```

### Detailed Flow Descriptions:

#### 1. Authentication & Onboarding
- **Multi-Format 10-Digit Mobile Matching**: Accepts raw digits (`9876543210`), prefixed (`+919876543210`), or spaced (`+91 98765 43210`). Non-numeric characters are stripped, extracting the core 10 digits.
- **Salted SHA-256 Password Cryptography**: Passwords are cryptographically hashed client-side using `crypto.subtle.digest('SHA-256')` with an application salt before verification.
- **Direct Database Persistence**: Workers are persisted to Supabase `worker_profiles` independently of third-party SMS rate limits.
- **Local Fallback Cache**: Credentials and registered accounts are safely preserved across browser sessions.

#### 2. Service Request & SOS Dispatch
- **Categorized Rate Cards**: Standardized base pricing for 8+ trades (Electrician, Plumber, Carpenter, Domestic Caregiver, Painter, Appliance Repair, Cleaning, Gardening).
- **Booking Modes**:
  - `INSTANT_SOS`: 30-minute rapid emergency response.
  - `SCHEDULED`: User-selected date and time slot.
- **Automated Trade Routing**: Electrician requests route exclusively to certified electricians, plumbing requests to plumbers, etc.

#### 3. Real-Time Dynamic Negotiation (Bidding)
- **Hyperlocal Worker Radar**: Available workers receive audio/visual dispatches within their certified category.
- **Counter-Offers**: Workers can accept the customer's proposed budget or submit a custom bid price and arrival ETA.
- **Customer Decision Cockpit**: Customer compares incoming bids showing worker photo, trade certifications, cooperative society name, distance, and 5-star rating.

#### 4. Physical Start OTP Handshake
- When the customer accepts a bid, the system transitions to `EN_ROUTE` and generates a secure 4-digit numeric **Start OTP**.
- The customer view displays the code with an official security instruction: *"Share this 4-digit security code with the service partner upon physical arrival to authorize the repair."*
- The worker cannot start the repair without physically requesting and entering this 4-digit code in their console.
- Verifying the code transitions the job to `IN_PROGRESS`.

#### 5. Fair-Wage Settlement (88/6/3/3 Escrow Engine)
Upon job completion, the total fare is programmatically distributed:
- **Worker Direct Wage**: 88%
- **Worker Welfare Pool (PMSBY + Micro-pension)**: 6%
- **Primary Cooperative Society Fund**: 3%
- **Platform & Technology Infrastructure**: 3%

#### 6. BharatQR & Real UPI Payment
- Displays dynamic BharatQR encoded with payment recipient `chandan.bank@pingpay`.
- Interactive deep link (`upi://pay?pa=chandan.bank@pingpay&pn=SahakarSetu...`) supports 1-tap launching into Google Pay, PhonePe, Paytm, BHIM, and CRED.
- Confirmed transactions permanently seal the payment in Supabase.

#### 7. Locked Tax Invoice & Review
- Generates an official, printable GST receipt displaying the job ID, transaction timestamp, price breakdown, and cooperative society affiliation.
- The `activeCustomerJobId` lock ensures the screen never reverts back to "Payment Due" on page refreshes or polling intervals.
- The customer can leave a 5-star rating, after which they can click **"Book Next Service"** to start fresh.

#### 8. Federation Admin & Society Governance
- **DigiLocker KYC Queue**: Review and approve newly registered workers with 1-click verification.
- **AI Demand Surge Mobilizer**: Predictive weather triggers (heatwave AC spikes, monsoon drainage clogs) generate workforce mobilization vouchers.
- **Democratic 3-Tier Grievance Desk**: Society mediation -> District arbitrator -> Apex federation review.

---

## 3. Overall System Architecture

```
+---------------------------------------------------------------------------------------+
|                               SahakarSetu Architecture                                |
+---------------------------------------------------------------------------------------+
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                             ┌─────────────────────────┐
│     CUSTOMER PORTAL     │                             │      WORKER PORTAL      │
│  • Service Discovery    │                             │  • Radar Dispatch       │
│  • Custom Bidding Radar │                             │  • Dynamic Bidding Desk │
│  • Start OTP Generation │                             │  • Start OTP Validator  │
│  • BharatQR / UPI Pay   │                             │  • PMSBY Welfare Wallet │
│  • Tax Invoice Locking  │                             │  • Web Speech Assistant │
└────────────┬────────────┘                             └────────────┬────────────┘
             │                                                     │
             └──────────────────────────┬──────────────────────────┘
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION CORE & STATE LAYER (React 18)                         │
│  • AppContext.tsx: Global State Store & Real-Time Orchestration                       │
│  • Web Crypto API: Salted SHA-256 Credential Hashing                                  │
│  • BroadcastChannel API: Cross-Tab / Multi-Device Synchronization                     │
│  • Web Speech AI Engine: Text-to-Speech (hi-IN, en-IN) & Voice Commands               │
│  • 88/6/3/3 Escrow Calculator & BharatQR Generator                                    │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD INFRASTRUCTURE                                 │
│  • PostgreSQL 15 Database (Relational Store)                                          │
│  • PostgREST (Auto-generated REST API Layer)                                          │
│  • Supabase Realtime (WebSocket Pub/Sub for Bids & Statuses)                          │
│                                                                                       │
│  Tables:                                                                              │
│    ├── profiles             (Users: Citizen, Worker, Admin)                          │
│    ├── worker_profiles      (Trade, Society, Hourly Rate, Welfare, Insurance)         │
│    ├── job_requests         (Orders, Status, OTPs, Wage Splits, Payment)             │
│    └── bids_negotiations    (Realtime Worker Offers, Counter-bids, ETAs)              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. File and Folder Structure

```
coop-service-marketplace/
├── .env                              # Local environment variables (git-ignored)
├── .env.example                      # Template for environment configuration
├── .gitignore                        # Git ignore definitions (protects secrets & node_modules)
├── index.html                        # HTML entry point with responsive viewport & fonts
├── package.json                      # NPM dependencies, build scripts, & metadata
├── package-lock.json                 # Pinned dependency lockfile
├── postcss.config.js                 # PostCSS plugin configuration for Tailwind CSS
├── tailwind.config.js                # Tailwind CSS custom palettes, typography & animations
├── tsconfig.json                     # TypeScript compiler configuration (strict mode)
├── vite.config.ts                    # Vite build tool configuration with React plugins
├── supabase-schema.sql               # Complete PostgreSQL database schema definitions
├── requirements.md                   # System requirements & architecture specification
│
├── src/                              # Application source code
│   ├── App.tsx                       # Main application shell with role-switching header & router
│   ├── main.tsx                      # DOM root bootstrapping with AppProvider wrapper
│   ├── index.css                     # Global Tailwind styles, custom animations, print styles
│   ├── vite-env.d.ts                 # Vite environment type declarations
│   │
│   ├── components/                   # Modular UI component hierarchy
│   │   ├── admin/
│   │   │   └── AdminPortal.tsx       # Federation dashboard: KYC approvals, dispute desk, surge AI
│   │   ├── auth/
│   │   │   └── AuthPage.tsx          # Mobile login, SMS OTP verification, & worker onboarding
│   │   ├── common/
│   │   │   ├── Header.tsx            # Navigation bar, language toggle, user badge, role switcher
│   │   │   ├── Footer.tsx            # Cooperative federation footer, statutory links, version
│   │   │   └── VoiceAssistantModal.tsx # Web Speech AI microphone interface (Hindi / English)
│   │   ├── customer/
│   │   │   └── CustomerPortal.tsx    # Citizen portal: booking, live radar, OTP view, UPI payment
│   │   └── worker/
│   │       ├── WorkerPortal.tsx      # Craftsman portal: radar alerts, bidding, OTP gate, wallet
│   │       └── WorkerRegisterModal.tsx # Craftsman registration modal with society affiliation
│   │
│   ├── context/
│   │   └── AppContext.tsx            # Central state store: auth, jobs, bids, WebSockets, broadcast
│   │
│   ├── data/
│   │   ├── mockData.ts               # Translation dictionaries (hi/en), disputes, AI surge data
│   │   └── mockMarketplaceData.ts    # Service categories, rate cards, and cooperative society seeds
│   │
│   ├── lib/
│   │   ├── smsService.ts             # SMS OTP dispatch service & mobile formatting utilities
│   │   └── supabase.ts               # Supabase client, auth functions, SHA-256 hashing, DB sync
│   │
│   └── types/
│       ├── index.ts                  # Shared platform interfaces (translations, categories)
│       └── marketplace.ts            # Core domain types: JobRequest, Bid, WorkerProfile, AuthUser
```

---

## 5. Technical Stack

| Layer | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 (TypeScript)** | Component-based reactive UI, strict typing, functional hooks (`useState`, `useEffect`, `useContext`, `useRef`). |
| **Build & Tooling** | **Vite 5** | Lightning-fast Hot Module Replacement (HMR), optimized production bundling (< 5s build time). |
| **Styling & Design** | **Tailwind CSS 3** | Utility-first responsive design, custom Indian cooperative color palettes (emerald, amber, slate), print stylesheets. |
| **Iconography & UI** | **Lucide React** | Clean, accessible SVG iconography for trade categories, status indicators, and actions. |
| **Visual Effects** | **Canvas-Confetti** | Celebration feedback animations on successful OTP verification, bid acceptance, and payments. |
| **Database & Cloud** | **Supabase (PostgreSQL 15)** | Relational data persistence, Row-Level Security, PostgREST automatic REST API endpoints. |
| **Real-Time Sync** | **Supabase Realtime & WebSockets** | Instant multi-device push updates for job requests, incoming bids, and status handshakes. |
| **Cross-Tab Sync** | **BroadcastChannel API** | Seamless live coordination between multiple browser tabs/windows (`sahakar_market_sync`). |
| **Cryptography** | **Web Crypto API (SubtleCrypto)** | Salted SHA-256 password hashing and secure random UUID generation (`crypto.randomUUID`). |
| **Voice AI & TTS** | **Web Speech API** | Hands-free voice commands (`SpeechRecognition`) and spoken job briefings (`SpeechSynthesis` in `hi-IN` & `en-IN`). |
| **Payment Gateway** | **BharatQR & NPCI UPI Intent** | Dynamic SVG BharatQR generator and deep linking (`upi://pay?pa=chandan.bank@pingpay...`) for instant mobile UPI app checkout. |
| **Mobile Normalization** | **Custom Indian Phone Regex Engine** | Normalizes phone formats (`+91`, spaces, hyphens) to 10 core digits for database querying. |

---

## 6. Database Schema Summary

### Table: `profiles`
Represents registered users across all roles (Citizens, Craftsmen, Federation Admins).
- `id` (UUID, Primary Key)
- `role` (`'customer'` | `'worker'` | `'admin'`)
- `full_name` (Text)
- `phone` (Text)
- `address` (Text)
- `avatar_url` (Text)
- `created_at` / `updated_at` (Timestamp)

### Table: `worker_profiles`
Represents verified craftsmen belonging to Primary Labour Cooperative Societies.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Nullable reference to `profiles.id`)
- `name` (Text)
- `phone` (Text)
- `trade` (Text, e.g. "Electrician & Power Care")
- `experience_years` (Integer)
- `society_name` (Text, e.g. "Central District Labour Cooperative Federation #12")
- `society_id` (Text, NOT NULL, default: `'COOP-DL-2026-091'`)
- `district` (Text)
- `verification_status` (`'VERIFIED'` | `'PENDING'` | `'SUSPENDED'`)
- `aadhar_masked` (Text, DPDP-compliant `XXXX-XXXX-1234`)
- `hourly_rate_floor` (Numeric)
- `rating` (Numeric, default: 5.0)
- `review_count` (Integer)
- `completed_jobs` (Integer)
- `is_available` (Boolean)
- `welfare_balance` / `pension_savings` (Numeric)
- `insurance_policy_no` (Text, PMSBY policy identifier)

### Table: `job_requests`
Represents active and completed customer service orders.
- `id` (Text, Primary Key, e.g. `JOB-1042`)
- `customer_id` (UUID)
- `customer_name` (Text)
- `customer_phone` (Text)
- `customer_address` (Text)
- `service_category_id` (Text)
- `service_title` (Text)
- `problem_description` (Text)
- `booking_type` (`'INSTANT_SOS'` | `'SCHEDULED'`)
- `initial_budget` / `agreed_price` (Numeric)
- `status` (`'SEARCHING'` | `'MATCHED'` | `'EN_ROUTE'` | `'IN_PROGRESS'` | `'COMPLETED'` | `'CANCELLED'`)
- `selected_worker_id` (UUID)
- `start_otp` (Text, 4-digit code)
- `completion_otp` (Text, 4-digit code)
- `worker_wage` (Numeric, 88%)
- `welfare_cut` (Numeric, 6%)
- `society_cut` (Numeric, 3%)
- `platform_cut` (Numeric, 3%)
- `payment_status` (`'PENDING'` | `'PAID'`)
- `payment_method` (`'UPI'` | `'BHARAT_QR'`)

### Table: `bids_negotiations`
Represents live counter-offers and bids submitted by workers for specific jobs.
- `id` (Text, Primary Key, e.g. `BID-4821`)
- `job_request_id` (Text, References `job_requests.id`)
- `worker_id` (UUID)
- `worker_name` (Text)
- `worker_avatar` (Text)
- `worker_trade` (Text)
- `worker_rating` (Numeric)
- `worker_society` (Text)
- `worker_distance_km` (Numeric)
- `proposed_price` (Numeric)
- `eta_minutes` (Integer)
- `status` (`'PENDING'` | `'ACCEPTED'` | `'REJECTED'`)
- `created_at` (Timestamp)

---

## 7. Statutory & Policy Compliance Alignment

1. **Multi-State Co-operative Societies Act (MSCS Act 2002 / 2023 Amendments)**: Promotes cooperative autonomy, democratic member control, and equitable economic participation.
2. **Digital Personal Data Protection (DPDP) Act 2023**: Enforces privacy by design, purpose limitation, and masked identity storage for Aadhaar (`XXXX-XXXX-1234`) and mobile contact information.
3. **Pradhan Mantri Suraksha Bima Yojana (PMSBY)**: Integrates active ₹2,00,000 accidental risk coverage funded transparently through the 6% welfare deduction.
4. **Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)**: Channelizes micro-pension accumulations (+₹25/job) into national unorganized worker pension accounts.
5. **National Skill Development Corporation (NSDC / Skill India)**: Standardizes trade quality benchmarks to protect both consumers and certified craftsmen.
