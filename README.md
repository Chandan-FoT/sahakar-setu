# SahakarSetu (सहकार सेतु) 
### Cooperative-Owned Digital Service Marketplace Platform
**Smart India Hackathon (SIH) Solution** | *Ministry of Cooperation & National Labour Cooperative Federations*

---

##  Overview
**SahakarSetu** connects verified skilled trade workers (electricians, plumbers, carpenters, caregivers, painters, appliance repairers, gardeners, etc.) belonging to Labour Cooperative Federations with households and institutions.

###  Key Features Implemented:
1. **Consumer / Citizen Portal:**
   - Browse standardized cooperative rate cards with zero surge pricing.
   - **Cooperative Fair Wage Breakdown:** Live visualization (88% directly to worker, 6% welfare & PMSBY insurance, 3% society fund, 3% platform tech).
   - **Instant 30-Minute SOS Dispatch & Scheduled Booking.**
   - **Live Worker Tracking & Start OTP security handshake.**
   - **Split UPI Invoicing & Settlement simulator with Confetti.**
   - Worker ratings & endorsements.

2. **Worker Portal (Shramik PWA):**
   - **Multilingual Web Speech AI Voice Assistant:** Listen to job briefs aloud in Hindi/English and accept bookings hands-free ("स्वीकार करें").
   - **Live Dispatch Radar:** Instant audio alert with distance and guaranteed net UPI earnings.
   - **Active Order Execution:** Customer Start OTP input & dual-handshake work verification.
   - **Worker Digital ID Pass:** Cryptographic QR code with DigiLocker verified badge and society registry ID.
   - **Worker Social Security & Welfare Hub:**
     - Pradhan Mantri Suraksha Bima Yojana (PMSBY ₹2,00,000 accidental cover) active status.
     - Accumulated Micro-Pension & Gratuity ledger.
     - Instant Emergency Tool / Medical micro-loan application.

3. **Federation Admin & Governance Dashboard:**
   - **AI Demand Forecasting & Surge Mobilizer:** Predictive time-series models detecting weather surges (monsoon drainage, summer heatwave grid loads) and dispatching workforce mobilization vouchers.
   - **DigiLocker KYC Queue:** Approve/Reject pending registrations with trade skill endorsements.
   - **Standard Rate Card & Wage Governance:** Regional minimum wage floors protecting workers from price dumping.
   - **3-Tier Dispute & Grievance Redressal:** Transparent arbitration between citizens and craftsmen.

---

##  Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open your browser at: **`http://localhost:5173`**

### 2. Build for Production
```bash
npm run build
```

---

## Project Structure
```
coop-service-marketplace/
├── prd.md                    # Comprehensive Product Requirements Document (PRD)
├── index.html                # HTML entry point with fonts & metadata
├── package.json              # Dependencies (React, TypeScript, Tailwind, Lucide, Confetti)
├── tailwind.config.js        # Cooperative Green & Saffron theme configuration
├── vite.config.ts            # Vite configuration
└── src/
    ├── types/index.ts        # TypeScript schemas for Workers, Bookings, Welfare, AI Forecasts
    ├── data/mockData.ts      # Authentic cooperative data & multilingual dictionary
    ├── context/AppContext.tsx# Global state & voice synthesis engine
    ├── components/
    │   ├── common/           # Header, Footer, Multilingual Voice Assistant
    │   ├── customer/         # Citizen booking, live tracking, split UPI payment
    │   ├── worker/           # Shramik dispatch radar, OTP verification, welfare ledger
    │   └── admin/            # AI Demand forecasting, KYC approval, rate governance
    ├── App.tsx               # Root layout & view switcher
    └── main.tsx              # React mounting
```
