# SahakarSetu (सहकार सेतु) — Software Requirements Specification (SRS)
### Cooperative-Owned Digital Service Marketplace Platform
**Smart India Hackathon (SIH) | Ministry of Cooperation & National Labour Cooperative Federations**

---

## 1. Executive Summary & Problem Context

### 1.1 Background
Labour Cooperative Federations and Primary Labour Cooperative Societies in India represent a vast pool of certified, skilled blue-collar and pink-collar tradespeople (electricians, plumbers, carpenters, painters, domestic caregivers, HVAC technicians, gardeners, and facility cleaners). However, these workers remain underutilized and economically marginalized due to the absence of a dedicated digital discovery, scheduling, and payment marketplace.

### 1.2 Problem Statement
Commercial service aggregator platforms currently monopolize the urban home services market. They impose predatory commission fees (25%–35%), enforce algorithmic penalty systems, lack social security integration, and engage in surge pricing that harms consumers while keeping workers economically insecure.

### 1.3 Project Objective
**SahakarSetu** is a decentralized, cooperative-owned digital service marketplace that connects verified skilled craftsmen from Labour Cooperative Federations with households and institutions. The platform enforces an immutable **88/6/3/3 fair wage escrow split**, integrates **two-tier DigiLocker & Skill India KYC verification**, provides an **offline-first PWA with a multilingual AI voice interface**, and incorporates **predictive AI demand forecasting** for weather and festival surges.

---

## 2. User Roles & Stakeholder Personas

| Role | Persona / User Type | Core Responsibilities & Objectives |
| :--- | :--- | :--- |
| **`CUSTOMER`** | Citizen / Household / Institutional Facility Manager | Discovers standardized rate cards, books instant SOS 30-min or scheduled services, verifies worker identity, initiates Start OTP handshake, pays via split BharatQR/UPI, and rates service quality. |
| **`WORKER`** | Shramik / Cooperative Craftsman | Receives hyperlocal audio/visual dispatch alerts, listens to job briefs via Web Speech AI in regional languages, executes work via Dual-OTP validation, monitors live wallet earnings (88%), and accesses PMSBY insurance and micro-pensions. |
| **`PRIMARY_SOCIETY`** | Primary Labour Cooperative Society Manager | Endorses local worker credentials, conducts physical tool/skill verification, disburses fast-track emergency tool loans, and arbitrates initial citizen grievances. |
| **`FEDERATION_ADMIN`** | State/National Apex Federation Board | Governs regional minimum price floors, reviews DigiLocker KYC queue, monitors live macro KPIs, executes AI surge workforce mobilization vouchers, and manages the 3-tier grievance desk. |

---

## 3. Functional Requirements (FR)

### FR-1: User Management & Authentication
* **FR-1.1:** The system shall authenticate customers, workers, and administrators via mobile phone OTP and secure session tokens.
* **FR-1.2:** The system shall support seamless role-switching for demonstration and administrative oversight without losing active session states.
* **FR-1.3:** Customer profiles shall store delivery addresses, emergency contact flags, and booking histories with privacy masking.

### FR-2: Two-Tier DigiLocker & Skill India KYC Pipeline
* **FR-2.1 (Tier-1 Identity):** Automated Aadhaar/PAN identity verification via DigiLocker API integration.
* **FR-2.2 (DPDP Act Compliance):** Aadhaar numbers must be cryptographically masked (`XXXX-XXXX-1234`) on all public and worker-facing interfaces.
* **FR-2.3 (Tier-2 Skill Endorsement):** Validation of National Skill Development Corporation (NSDC / Skill India / ITI) certification IDs against national databases.
* **FR-2.4 (Society Gate):** Newly registered workers remain in `PENDING` status until endorsed by their Primary Labour Cooperative Society or Federation Admin.

### FR-3: Standardized Rate Card & Price Floor Governance
* **FR-3.1:** The catalog shall maintain government-benchmarked, standardized rate cards across 8+ trade categories (Electrician, Plumber, Carpenter, Caregiver, Painter, Appliance Repair, Cleaning, Gardener).
* **FR-3.2:** Each category shall include itemized task scope breakdowns with duration estimates and fixed base rates to prevent on-site overcharging.
* **FR-3.3:** The platform shall enforce regional minimum wage price floors indexed to annual cost-of-living adjustments, strictly prohibiting predatory commercial price-dumping.

### FR-4: Hyperlocal Geo-Matching & SOS Rapid Dispatch
* **FR-4.1:** The system shall implement spatial queries (PostGIS `ST_DWithin` / Haversine distance matrix) to match orders to the nearest available, verified worker within a **3 km radius**.
* **FR-4.2 (30-Minute SOS Dispatch):** For emergency trades (short circuits, pipe bursts), the system shall trigger rapid dispatch routing targeting on-site arrival in **under 30 minutes**.
* **FR-4.3:** Workers shall have a real-time online/offline availability toggle with background GPS telemetry.

### FR-5: Order Execution Lifecycle & Cryptographic Dual-OTP Handshake
* **FR-5.1:** State transition lifecycle: `SEARCHING` $\rightarrow$ `MATCHED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED` $\rightarrow$ `PAID`.
* **FR-5.2 (Start OTP):** Upon arrival on-site, the worker must input the customer's 4-digit **Start OTP** to start the job timer and unlock safety protocols.
* **FR-5.3 (Completion Verification):** Upon task conclusion, optional photo proof of work is captured, and completion verification triggers the automated escrow split.
* **FR-5.4:** In-app masked calling shall bridge communications between citizen and worker without revealing personal phone numbers.

### FR-6: Automated Fair-Wage Escrow Split Engine (88 / 6 / 3 / 3 Split)
* **FR-6.1:** Financial settlements must be calculated server-side to prevent client-side tampering using the locked formula:
  $$\text{Total Booking Fare} = \text{Base Inspection Fee} + \sum (\text{Task Unit Rate} \times \text{Quantity})$$
* **FR-6.2:** Instant financial distribution on job completion:
  * **88% $\rightarrow$ Direct Worker Payout:** Transferred instantly to worker's UPI/bank account.
  * **6% $\rightarrow$ Worker Social Security & Welfare Pool:** Directed into worker’s personal welfare ledger.
  * **3% $\rightarrow$ Primary Cooperative Society Fund:** Contributed to local society reserves and equipment pools.
  * **3% $\rightarrow$ Platform Maintenance & Tech Infrastructure:** Covers cloud hosting, SMS, maps, and voice API gateways.
* **FR-6.3:** Integration with BharatQR, UPI 2.0 AutoSplit, and simulated escrow settlement.

### FR-7: Worker Social Security, PMSBY & Micro-Pension Ledger
* **FR-7.1:** Every verified worker profile shall display an active **Pradhan Mantri Suraksha Bima Yojana (PMSBY)** ₹2,00,000 accidental death/disability insurance policy number.
* **FR-7.2:** The system shall maintain an immutable transaction ledger recording automatic micro-pension accumulations (+₹25 per completed job).
* **FR-7.3:** Workers can submit fast-track emergency tool replacement or medical micro-credit loan requests approved by society managers within 2 hours.

### FR-8: AI Demand Forecasting & Surge Mobilizer
* **FR-8.1:** A LightGBM / SARIMAX time-series regression model shall ingest meteorological telemetry (heatwave thresholds >42°C, torrential rainfall warnings) and festival calendars.
* **FR-8.2:** The model shall predict district-level trade demand spikes 48 hours in advance (e.g., +140% inverter/AC repair spikes during heatwaves, +120% drainage clogs during monsoons).
* **FR-8.3:** The Federation Admin can trigger **Workforce Mobilization Vouchers** with 1-click, routing surplus cooperative workers from outer zones into surge districts with transit subsidies.

### FR-9: Multilingual Web Speech AI Voice Assistant
* **FR-9.1:** Integrated Web Speech API (`SpeechSynthesisUtterance` & `SpeechRecognition`) supporting **Hindi and English** (with extensible Tamil, Marathi, Bengali, Telugu dictionaries).
* **FR-9.2:** Audio playback of job briefs (trade, address, net earnings) tailored for low-literacy Shramiks.
* **FR-9.3:** Voice command recognition for hands-free job acceptance (`"स्वीकार करें"` / `"Accept"`).

### FR-10: 3-Tier Grievance & Dispute Redressal Desk
* **FR-10.1:** Democratic 3-tier dispute resolution desk: Tier 1 (Society Mediation) $\rightarrow$ Tier 2 (District Federation Arbitrator) $\rightarrow$ Tier 3 (Apex Board Review).
* **FR-10.2:** Transparent settlement payouts funded via the cooperative goodwill reserve pool.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
* **NFR-1.1:** REST API response latency shall be $< 200\text{ ms}$ under standard network conditions.
* **NFR-1.2:** Hyperlocal spatial matching query execution time shall be $< 100\text{ ms}$ across 100,000+ indexed worker coordinates using PostGIS R-Tree spatial indexing.
* **NFR-1.3:** The frontend PWA initial load time (First Contentful Paint) shall be $< 1.2\text{ s}$ on 3G/4G mobile networks.

### NFR-2: Security, Privacy & Data Protection
* **NFR-2.1 (DPDP Act 2023 Compliance):** Personal Identifiable Information (PII) such as Aadhaar numbers and customer phone numbers must be masked in transit and at rest.
* **NFR-2.2:** Cryptographic hash verification on all OTP operations with a 3-attempt throttling lock to prevent brute-force attacks.
* **NFR-2.3:** Server-side parameterized queries via Prisma ORM to guarantee 100% immunity against SQL injection vulnerabilities.

### NFR-3: Reliability, Availability & Offline Resilience
* **NFR-3.1:** 99.9% platform availability target with stateless backend microservice containers.
* **NFR-3.2:** Service Worker caching strategies (Cache-First for UI assets, Network-First with offline fallback for active booking data) enabling field workers to view job directions during signal loss.

### NFR-4: Usability & Accessibility
* **NFR-4.1:** WCAG 2.1 Level AA compliance with high-contrast cooperative color palettes.
* **NFR-4.2:** Complete touch-first responsive design adapted for 4.7" entry-level smartphones through 27" desktop monitors.
* **NFR-4.3:** Native font support for Devanagari script (`Noto Sans Devanagari`) alongside Latin typography (`Inter`).

---

## 5. Technical Specifications & Architecture Stack

```
+-----------------------------------------------------------------------------------+
|                        SahakarSetu Full-Stack Architecture                        |
+--------------------------+----------------------------+---------------------------+
| 🌐 Frontend Layer        | 📡 Application Gateway     | 🗄️ Persistence & National |
| • React 18 + TypeScript  | • Node.js / Express.js     | • Prisma ORM              |
| • Vite Bundler           | • REST API Endpoints       | • SQLite (Dev) / PostGIS  |
| • Tailwind CSS           | • 88/6/3/3 Escrow Engine   | • DigiLocker API Ready    |
| • Web Speech AI Engine   | • Dual-OTP Validator       | • Skill India NSDC Hook   |
| • PWA Service Worker     | • LightGBM AI Predictor    | • UPI 2.0 AutoSplit Stack |
+--------------------------+----------------------------+---------------------------+
```

### 5.1 Technology Stack Summary
* **Client Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Web Speech API.
* **Backend Application:** Node.js, Express.js, TypeScript, CORS middleware.
* **Database & ORM:** Prisma ORM, SQLite (`dev.db` for instant local dev) / PostgreSQL + PostGIS (Production cloud).
* **AI & Machine Learning:** LightGBM / Python FastAPI time-series microservice for meteorological demand forecasting.
* **Deployment & CI/CD:** GitHub Actions workflow (`.github/workflows/deploy.yml`), Vite production bundling, Docker container readiness.

---

## 6. Database Schema Specifications

```prisma
// Users Table (Citizens, Workers, Admins)
model User {
  id            String          @id @default(uuid())
  phone         String          @unique
  name          String
  email         String?
  role          String          @default("CUSTOMER") // CUSTOMER | WORKER | ADMIN
  createdAt     DateTime        @default(now())
  workerProfile WorkerProfile?
  bookings      Booking[]
}

// Worker Profile & Cooperative Affiliation
model WorkerProfile {
  id                  String               @id @default(uuid())
  userId              String               @unique
  user                User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  trade               String
  tradeHi             String?
  secondaryTrades     String               @default("[]")
  experienceYears     Int                  @default(5)
  rating              Float                @default(5.0)
  reviewCount         Int                  @default(0)
  societyName         String
  societyId           String
  district            String
  verificationStatus  String               @default("VERIFIED") // PENDING | VERIFIED | SUSPENDED
  aadharMasked        String
  skillCertifications String               @default("[]")
  avatar              String
  hourlyRate          Float                @default(300)
  distanceKm          Float                @default(1.5)
  isAvailable         Boolean              @default(true)
  completedJobs       Int                  @default(0)
  badges              String               @default("[]")
  welfareBalance      Float                @default(0)
  pensionSavings      Float                @default(0)
  insurancePolicyNo   String
  lat                 Float                @default(28.6139)
  lng                 Float                @default(77.2090)
  createdAt           DateTime             @default(now())
  bookings            Booking[]
  welfareLedger       WelfareTransaction[]
}

// Service Catalog & Standard Rate Cards
model ServiceCategory {
  id                 String        @id
  title              String
  titleHi            String
  icon               String
  color              String
  badge              String?
  description        String
  descriptionHi      String
  baseInspectionFee  Float
  emergencyAvailable Boolean       @default(false)
  createdAt          DateTime      @default(now())
  standardItems      ServiceItem[]
  bookings           Booking[]
}

model ServiceItem {
  id              String          @id
  categoryId      String
  category        ServiceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name            String
  nameHi          String
  baseRate        Float
  unit            String
  durationMinutes Int
}

// Bookings & Escrow Wage Split
model Booking {
  id                 String          @id
  customerId         String?
  customer           User?           @relation(fields: [customerId], references: [id])
  customerName       String
  customerPhone      String
  customerAddress    String
  serviceCategoryId  String
  serviceCategory    ServiceCategory @relation(fields: [serviceCategoryId], references: [id])
  serviceTitle       String
  selectedItemsJson  String          @default("[]")
  bookingType        String          @default("INSTANT_SOS") // INSTANT_SOS | SCHEDULED
  scheduledTime      String
  status             String          @default("SEARCHING") // SEARCHING | MATCHED | EN_ROUTE | IN_PROGRESS | COMPLETED | CANCELLED
  workerId           String?
  worker             WorkerProfile?  @relation(fields: [workerId], references: [id])
  startOtp           String
  completionOtp      String
  totalAmount        Float
  workerWage         Float           // 88% Direct Payout
  welfareCut         Float           // 6% Social Security
  societyCut         Float           // 3% Society Reserve
  platformCut        Float           // 3% Tech Infra
  paymentStatus      String          @default("PENDING") // PENDING | PAID | ESCROW
  paymentMethod      String?         // UPI | CARD | CASH
  problemDescription String?
  rating             Int?
  reviewComment      String?
  workProofPhoto     String?
  createdAt          DateTime        @default(now())
  completedAt        DateTime?
}

// Micro-Welfare & Pension Ledger
model WelfareTransaction {
  id          String        @id
  workerId    String
  worker      WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)
  date        String
  type        String        // INSURANCE_PMSBY | PENSION_SAVINGS | DISTRESS_GRANT | DIVIDEND_PAYOUT
  amount      Float
  description String
  status      String        @default("CREDITED") // CREDITED | DEBITED
  createdAt   DateTime      @default(now())
}
```

---

## 7. REST API Endpoints Specification

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and server uptime | None |
| `GET` | `/api/services` | Retrieve full catalog with standardized rate cards | None |
| `GET` | `/api/workers` | Retrieve verified worker roster with filters | `?trade=&isAvailable=` |
| `POST` | `/api/workers/register` | Self-onboarding for cooperative craftsmen | `{ name, phone, trade, societyName, district, hourlyRate }` |
| `PATCH` | `/api/workers/:id/availability` | Toggle worker online/offline GPS status | None |
| `GET` | `/api/bookings` | Fetch active and historical bookings | `?status=&workerId=` |
| `POST` | `/api/bookings` | Create booking with server-side 88/6/3/3 split | `{ serviceCategoryId, items, bookingType, customerAddress }` |
| `PATCH` | `/api/bookings/:id/accept` | Worker accepts booking $\rightarrow$ status `EN_ROUTE` | `{ workerId }` |
| `POST` | `/api/bookings/:id/start-otp` | Verify 4-digit start OTP $\rightarrow$ status `IN_PROGRESS` | `{ otp }` |
| `POST` | `/api/bookings/:id/complete` | Mark work completed, credit wallet & welfare fund | `{ proofPhotoUrl }` |
| `POST` | `/api/bookings/:id/pay` | Settle payment via UPI / BharatQR split | `{ paymentMethod }` |
| `POST` | `/api/bookings/:id/rate` | Submit 5-star customer review & feedback | `{ rating, comment }` |
| `GET` | `/api/welfare/:workerId` | Fetch PMSBY insurance policy & pension ledger | None |
| `POST` | `/api/welfare/loan-request` | Submit instant emergency tool/medical loan request | `{ workerId, amount, purpose }` |
| `GET` | `/api/admin/metrics` | Retrieve macro KPIs (wages disbursed, active societies) | None |
| `GET` | `/api/admin/demand-forecast` | Retrieve AI demand surge predictions | None |
| `PATCH` | `/api/admin/verify-worker/:id` | Approve/Reject worker DigiLocker KYC | `{ status: "VERIFIED" }` |
| `POST` | `/api/admin/resolve-dispute/:id` | Arbitrate dispute via cooperative mediation pool | `{ resolutionNote }` |

---

## 8. Statutory & Policy Compliance Alignment

1. **Multi-State Co-operative Societies Act (MSCS Act 2002 / 2023 Amendments):** Complies with cooperative autonomy, democratic control, and member economic participation standards.
2. **Digital Personal Data Protection (DPDP) Act 2023:** Enforces purpose limitation, data minimization, and masked identity storage for Aadhaar and mobile credentials.
3. **Pradhan Mantri Suraksha Bima Yojana (PMSBY):** Direct policy mapping providing ₹2,00,000 accidental risk coverage funded through the 6% welfare deduction.
4. **Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM):** Aligns micro-pension accumulations (+₹25/job) with national unorganized sector pension frameworks.
5. **National Skill Development Corporation (NSDC):** Standardizes skill certification levels ensuring certified quality service for consumers.

---

## 9. Verification & Acceptance Criteria

* ✅ **Acceptance Test 1 (Citizen Booking):** Citizen selects electrician repair $\rightarrow$ server computes transparent fare with 88/6/3/3 split $\rightarrow$ generates 4-digit Start OTP in SQLite database.
* ✅ **Acceptance Test 2 (Worker Handshake):** Worker receives live audio/radar dispatch $\rightarrow$ accepts $\rightarrow$ enters citizen Start OTP on arrival $\rightarrow$ job transitions to `IN_PROGRESS`.
* ✅ **Acceptance Test 3 (Welfare Settlement):** Job completion immediately increments worker's direct wallet by 88% and appends a verified 6% credit entry in the **PMSBY Welfare Ledger**.
* ✅ **Acceptance Test 4 (Admin KYC Approval):** Newly registered worker with `PENDING` status is reviewed and approved in the Admin KYC queue, instantly activating their dispatch availability.
* ✅ **Acceptance Test 5 (AI Surge Dispatch):** LightGBM weather trigger simulation generates proactive workforce mobilization vouchers for high-demand districts.
