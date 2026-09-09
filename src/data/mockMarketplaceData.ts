import { ServiceCategory, WorkerProfile, JobRequest, WelfareLedgerEntry } from '../types/marketplace';

export const initialCategories: ServiceCategory[] = [
  {
    id: 'electrician',
    title: 'Electrician & Power Care',
    titleHi: 'इलेक्ट्रीशियन व विद्युत सेवा',
    icon: 'Zap',
    color: 'bg-amber-500',
    badge: 'Emergency Ready',
    description: 'Short circuits, wiring, fan/switchboard, inverter setups & load diagnostics.',
    descriptionHi: 'वायरिंग, स्विच बोर्ड, पंखा मरम्मत, इन्वर्टर व आपातकालीन विद्युत सहायता।',
    baseInspectionFee: 199,
    emergencyAvailable: true,
    standardItems: [
      { id: 'el-1', name: 'Emergency Short Circuit Fix', nameHi: 'शॉर्ट सर्किट ठीक करना', baseRate: 350, unit: 'per issue', durationMinutes: 45 },
      { id: 'el-2', name: 'Ceiling Fan Installation / Repair', nameHi: 'सीलिंग फैन इंस्टालेशन', baseRate: 250, unit: 'per unit', durationMinutes: 30 },
      { id: 'el-3', name: 'Switchboard / MCB Replacement', nameHi: 'स्विचबोर्ड बदलना', baseRate: 180, unit: 'per board', durationMinutes: 25 },
      { id: 'el-4', name: 'Inverter & Battery Setup', nameHi: 'इन्वर्टर व बैटरी सेटअप', baseRate: 600, unit: 'per setup', durationMinutes: 60 },
    ]
  },
  {
    id: 'plumber',
    title: 'Plumber & Water Works',
    titleHi: 'प्लंबर व जल पाइपलाइन सेवा',
    icon: 'Droplets',
    color: 'bg-sky-500',
    badge: 'Emergency Ready',
    description: 'Burst pipes, tap leaks, water tank cleaning, commode blockage & pump repairs.',
    descriptionHi: 'पाइप लीकेज, नल रिपेयर, वॉटर टैंक सफाई, मोटर पंप व ड्रेनेज समाधान।',
    baseInspectionFee: 199,
    emergencyAvailable: true,
    standardItems: [
      { id: 'pl-1', name: 'Emergency Pipe Leak Seal', nameHi: 'पाइप लीकेज सीलिंग', baseRate: 300, unit: 'per point', durationMinutes: 40 },
      { id: 'pl-2', name: 'Tap & Mixer Valve Fitting', nameHi: 'नल व मिक्सर फिटिंग', baseRate: 150, unit: 'per tap', durationMinutes: 20 },
      { id: 'pl-3', name: 'Commode Blockage Removal', nameHi: 'टॉयलेट ब्लॉकेज निकासी', baseRate: 400, unit: 'per unit', durationMinutes: 50 },
    ]
  },
  {
    id: 'carpenter',
    title: 'Carpenter & Woodcraft',
    titleHi: 'बढ़ई व लकड़ी कार्य',
    icon: 'Hammer',
    color: 'bg-amber-700',
    description: 'Furniture repair, door locks, modular kitchen woodwork, custom shelves & hinge fixes.',
    descriptionHi: 'फर्नीचर मरम्मत, दरवाजों के लॉक, अलमारी एवं वुडवर्क सेवाएं।',
    baseInspectionFee: 249,
    emergencyAvailable: false,
    standardItems: [
      { id: 'cp-1', name: 'Door Lock / Handle Fitting', nameHi: 'दरवाजा लॉक व हैंडल फिटिंग', baseRate: 250, unit: 'per door', durationMinutes: 35 },
      { id: 'cp-2', name: 'Wardrobe Hinge Adjustment', nameHi: 'अलमारी का कब्जा रिपेयर', baseRate: 200, unit: 'per pair', durationMinutes: 30 },
    ]
  },
  {
    id: 'caregiver',
    title: 'Elderly Care & Patient Assistant',
    titleHi: 'बुजुर्ग देखभाल व सहायक',
    icon: 'HeartHandshake',
    color: 'bg-rose-500',
    badge: 'Coop Certified',
    description: 'Compassionate senior care, mobility assistance, medication reminders & companionship.',
    descriptionHi: 'प्रशिक्षित वरिष्ठ नागरिक देखभाल, दवा निगरानी व दैनिक सहायता।',
    baseInspectionFee: 299,
    emergencyAvailable: true,
    standardItems: [
      { id: 'cg-1', name: 'Half-Day Senior Attendant (4 Hours)', nameHi: 'वरिष्ठ देखभाल (4 घंटे)', baseRate: 650, unit: 'per 4 hrs', durationMinutes: 240 },
      { id: 'cg-2', name: 'Full-Day Attendant (8 Hours)', nameHi: 'पूर्ण दिवस देखभाल (8 घंटे)', baseRate: 1100, unit: 'per 8 hrs', durationMinutes: 480 },
    ]
  },
  {
    id: 'appliance',
    title: 'Appliance Repair & AC Care',
    titleHi: 'उपकरण व एसी रिपेयर',
    icon: 'Tv',
    color: 'bg-indigo-600',
    badge: 'Popular',
    description: 'AC deep jet wash, refrigerator cooling, washing machine, and microwave maintenance.',
    descriptionHi: 'एसी जेट सर्विसिंग, वाशिंग मशीन, फ्रिज एवं माइक्रोवेव रिपेयर।',
    baseInspectionFee: 249,
    emergencyAvailable: true,
    standardItems: [
      { id: 'ap-1', name: 'Split AC Foam Jet Deep Wash', nameHi: 'स्प्लिट एसी फोम जेट सर्विस', baseRate: 499, unit: 'per unit', durationMinutes: 60 },
      { id: 'ap-2', name: 'Refrigerator Gas Top-up & Check', nameHi: 'फ्रिज कूलिंग व गैस चेक', baseRate: 850, unit: 'per visit', durationMinutes: 75 },
    ]
  },
  {
    id: 'cleaning',
    title: 'Deep House & Office Sanitation',
    titleHi: 'घर व ऑफिस गहरी सफाई',
    icon: 'Sparkles',
    color: 'bg-teal-500',
    description: 'Kitchen degreasing, bathroom deep scaling, sofa shampooing & floor polishing.',
    descriptionHi: 'रसोई, बाथरूम की गहरी स्वच्छता, सोफा शैम्पू व कीटाणुशोधन।',
    baseInspectionFee: 299,
    emergencyAvailable: false,
    standardItems: [
      { id: 'cl-1', name: 'Bathroom Deep Scaling (Acid-Free)', nameHi: 'बाथरूम डीप क्लीनिंग', baseRate: 399, unit: 'per bathroom', durationMinutes: 60 },
    ]
  }
];

export const initialWorkersList: WorkerProfile[] = [];

export const initialJobRequests: JobRequest[] = [];

export const initialWelfareLedger: WelfareLedgerEntry[] = [];

