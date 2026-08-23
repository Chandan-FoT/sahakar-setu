import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for SahakarSetu...');

  // 1. Clear existing data
  await prisma.welfareTransaction.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.demandForecast.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.serviceItem.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.workerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Service Categories & Standard Items
  const categoriesData = [
    {
      id: 'electrician',
      title: 'Electrician & Power Care',
      titleHi: 'इलेक्ट्रीशियन व विद्युत सेवा',
      icon: 'Zap',
      color: 'bg-amber-500',
      badge: 'Emergency Ready',
      description: 'Short-circuits, wiring, fan/switchboard installations, inverter setups & DB box maintenance.',
      descriptionHi: 'वायरिंग, स्विच बोर्ड, पंखा मरम्मत, इन्वर्टर व आपातकालीन विद्युत सहायता।',
      baseInspectionFee: 199,
      emergencyAvailable: true,
      items: [
        { id: 'el-1', name: 'Emergency Short Circuit Fix', nameHi: 'आपातकालीन शॉर्ट सर्किट ठीक करना', baseRate: 350, unit: 'per issue', durationMinutes: 45 },
        { id: 'el-2', name: 'Ceiling Fan Installation / Repair', nameHi: 'सीलिंग फैन इंस्टालेशन / रिपेयर', baseRate: 250, unit: 'per unit', durationMinutes: 30 },
        { id: 'el-3', name: 'Switchboard / MCB Replacement', nameHi: 'स्विचबोर्ड / एमसीबी बदलना', baseRate: 180, unit: 'per board', durationMinutes: 25 },
        { id: 'el-4', name: 'Complete Inverter & Battery Setup', nameHi: 'इन्वर्टर और बैटरी पूर्ण सेटअप', baseRate: 600, unit: 'per setup', durationMinutes: 60 },
        { id: 'el-5', name: '3-Phase Heavy Load Inspection', nameHi: '3-फेज लोड निरीक्षण एवं वायरिंग', baseRate: 750, unit: 'per visit', durationMinutes: 90 },
      ]
    },
    {
      id: 'plumber',
      title: 'Plumber & Water Works',
      titleHi: 'प्लंबर व जल पाइपलाइन सेवा',
      icon: 'Droplets',
      color: 'bg-sky-500',
      badge: 'Emergency Ready',
      description: 'Pipe bursts, tap leaks, water tank cleaning, sanitary fittings, motor pump repair.',
      descriptionHi: 'पाइप लीकेज, नल रिपेयर, वॉटर टैंक सफाई, मोटर पंप व ड्रेनेज समाधान।',
      baseInspectionFee: 199,
      emergencyAvailable: true,
      items: [
        { id: 'pl-1', name: 'Emergency Burst Pipe Leak Repair', nameHi: 'आपातकालीन पाइप लीकेज सीलिंग', baseRate: 300, unit: 'per point', durationMinutes: 40 },
        { id: 'pl-2', name: 'Tap & Mixer Valve Installation', nameHi: 'नल व मिक्सर फिटिंग', baseRate: 150, unit: 'per tap', durationMinutes: 20 },
        { id: 'pl-3', name: 'Toilet / Commode Blockage Removal', nameHi: 'टॉयलेट ब्लॉकेज निकासी', baseRate: 400, unit: 'per unit', durationMinutes: 50 },
        { id: 'pl-4', name: 'Water Tank Deep Chemical Cleansing', nameHi: 'पानी की टंकी गहरी सफाई', baseRate: 850, unit: 'up to 1000L', durationMinutes: 120 },
        { id: 'pl-5', name: 'Submersible / Monoblock Pump Service', nameHi: 'वाटर पंप व मोटर रिपेयर', baseRate: 500, unit: 'per pump', durationMinutes: 60 },
      ]
    },
    {
      id: 'carpenter',
      title: 'Carpenter & Woodwork',
      titleHi: 'बढ़ई व लकड़ी कार्य',
      icon: 'Hammer',
      color: 'bg-amber-700',
      description: 'Furniture repair, door locks, modular kitchen woodwork, custom shelves & hinge fixes.',
      descriptionHi: 'फर्नीचर मरम्मत, दरवाजों के लॉक, अलमारी एवं वुडवर्क सेवाएं।',
      baseInspectionFee: 249,
      emergencyAvailable: false,
      items: [
        { id: 'cp-1', name: 'Door Lock / Handle Repair & Fitting', nameHi: 'दरवाजा लॉक व हैंडल फिटिंग', baseRate: 250, unit: 'per door', durationMinutes: 35 },
        { id: 'cp-2', name: 'Wardrobe Hinge & Slider Adjustment', nameHi: 'अलमारी का कब्जा व स्लाइडर रिपेयर', baseRate: 200, unit: 'per pair', durationMinutes: 30 },
        { id: 'cp-3', name: 'Bed & Sofa Assembly / Tightening', nameHi: 'बेड व सोफा असेंबली', baseRate: 500, unit: 'per set', durationMinutes: 75 },
      ]
    },
    {
      id: 'caregiver',
      title: 'Elderly Care & Patient Assistant',
      titleHi: 'बुजुर्ग देखभाल व सहायक',
      icon: 'HeartHandshake',
      color: 'bg-rose-500',
      badge: 'Cooperative Certified',
      description: 'Trained compassionate care for seniors, mobility assistance, medication reminders & companionship.',
      descriptionHi: 'प्रशिक्षित वरिष्ठ नागरिक देखभाल, दवा निगरानी व दैनिक सहायता।',
      baseInspectionFee: 299,
      emergencyAvailable: true,
      items: [
        { id: 'cg-1', name: 'Half-Day Senior Attendant (4 Hours)', nameHi: 'वरिष्ठ देखभाल (4 घंटे)', baseRate: 650, unit: 'per 4 hrs', durationMinutes: 240 },
        { id: 'cg-2', name: 'Full-Day Attendant Care (8 Hours)', nameHi: 'पूर्ण दिवस देखभाल (8 घंटे)', baseRate: 1100, unit: 'per 8 hrs', durationMinutes: 480 },
        { id: 'cg-3', name: 'Post-Operative Mobility & Physio Aid', nameHi: 'शल्यक्रिया उपरांत फिजियो सहायता', baseRate: 500, unit: 'per session', durationMinutes: 60 },
      ]
    },
    {
      id: 'painter',
      title: 'Painter & Wall Finishes',
      titleHi: 'पेंटर व पुट्टी कारीगर',
      icon: 'Paintbrush',
      color: 'bg-emerald-600',
      description: 'Waterproofing, touch-ups, interior/exterior emulsion painting, texture walls.',
      descriptionHi: 'दीवार रंगाई, वॉटरप्रूफिंग, पुट्टी व टेक्सचर पेंटिंग।',
      baseInspectionFee: 249,
      emergencyAvailable: false,
      items: [
        { id: 'pt-1', name: 'Single Room Wall Fresh Coat (Labour)', nameHi: 'एक कमरे की दीवार पेंटिंग (मजदूरी)', baseRate: 1200, unit: 'per room', durationMinutes: 300 },
        { id: 'pt-2', name: 'Seepage & Damp Wall Treatment', nameHi: 'दीवार सीलन व वॉटरप्रूफिंग उपचार', baseRate: 800, unit: 'per wall', durationMinutes: 180 },
      ]
    },
    {
      id: 'appliance',
      title: 'Appliance Repair & AC Service',
      titleHi: 'उपकरण व एसी रिपेयर',
      icon: 'Tv',
      color: 'bg-indigo-600',
      badge: 'Popular',
      description: 'AC deep jet service, washing machine, refrigerator, microwave & water purifier filter change.',
      descriptionHi: 'एसी जेट सर्विसिंग, वाशिंग मशीन, फ्रिज एवं आरओ फिल्टर रिपेयर।',
      baseInspectionFee: 249,
      emergencyAvailable: true,
      items: [
        { id: 'ap-1', name: 'Split AC Foam Jet Deep Cleaning', nameHi: 'स्प्लिट एसी फोम जेट सर्विस', baseRate: 499, unit: 'per unit', durationMinutes: 60 },
        { id: 'ap-2', name: 'Refrigerator Cooling & Gas Top-up', nameHi: 'फ्रिज कूलिंग व गैस रीफिल', baseRate: 850, unit: 'per appliance', durationMinutes: 75 },
      ]
    },
    {
      id: 'cleaning',
      title: 'Deep House & Office Cleaning',
      titleHi: 'घर व ऑफिस गहरी सफाई',
      icon: 'Sparkles',
      color: 'bg-teal-500',
      description: 'Kitchen degreasing, bathroom deep sanitation, sofa shampooing & post-construction cleanups.',
      descriptionHi: 'रसोई, बाथरूम की गहरी स्वच्छता, सोफा शैम्पू व कीटाणुशोधन।',
      baseInspectionFee: 299,
      emergencyAvailable: false,
      items: [
        { id: 'cl-1', name: 'Intense Bathroom Deep Cleansing (Acid-Free)', nameHi: 'बाथरूम डीप क्लीनिंग व स्केलिंग', baseRate: 399, unit: 'per bathroom', durationMinutes: 60 },
        { id: 'cl-2', name: 'Full Modular Kitchen Chimney & Degreasing', nameHi: 'किचन व चिमनी गहरी सफाई', baseRate: 899, unit: 'per kitchen', durationMinutes: 120 },
      ]
    },
    {
      id: 'gardener',
      title: 'Gardener & Landscape Maintenance',
      titleHi: 'माली व बागवानी सेवा',
      icon: 'Sprout',
      color: 'bg-green-600',
      description: 'Lawn mowing, seasonal potting, organic pest spray, plant pruning & rooftop garden setup.',
      descriptionHi: 'पौधों की छंटाई, खाद डालना, कीट नियंत्रण व रूफटॉप गार्डन निर्माण।',
      baseInspectionFee: 199,
      emergencyAvailable: false,
      items: [
        { id: 'gd-1', name: 'Garden Pruning, Weeding & Lawn Mowing', nameHi: 'घास कटाई, खरपतवार व छंटाई', baseRate: 450, unit: 'up to 500 sq ft', durationMinutes: 90 },
      ]
    }
  ];

  for (const cat of categoriesData) {
    const { items, ...catFields } = cat;
    await prisma.serviceCategory.create({
      data: {
        ...catFields,
        standardItems: {
          create: items.map(item => ({
            id: item.id,
            name: item.name,
            nameHi: item.nameHi,
            baseRate: item.baseRate,
            unit: item.unit,
            durationMinutes: item.durationMinutes,
          }))
        }
      }
    });
  }
  console.log(`✅ Seeded ${categoriesData.length} service categories.`);

  // 3. Create Sample Citizen Users & Workers
  const user1 = await prisma.user.create({
    data: {
      phone: '+91 98711 00223',
      name: 'Citizen User',
      email: 'citizen@example.com',
      role: 'CUSTOMER'
    }
  });

  const workerUser1 = await prisma.user.create({
    data: {
      phone: '+91 98765 43210',
      name: 'Ramesh Sharma',
      email: 'ramesh.sharma@coop.in',
      role: 'WORKER'
    }
  });

  const worker1 = await prisma.workerProfile.create({
    data: {
      id: 'w-101',
      userId: workerUser1.id,
      trade: 'Master Electrician',
      tradeHi: 'वरिष्ठ इलेक्ट्रीशियन',
      secondaryTrades: JSON.stringify(['Appliance Repair', 'Solar Inverter']),
      experienceYears: 11,
      rating: 4.92,
      reviewCount: 342,
      societyName: 'Central District Labour Cooperative Federation #12',
      societyId: 'COOP-DL-2018-091',
      district: 'Central Delhi / Connaught Place',
      verificationStatus: 'VERIFIED',
      aadharMasked: 'XXXX-XXXX-8921',
      skillCertifications: JSON.stringify(['NSDC Level 4 Electrician', 'ITI Electrical (Govt of India)', 'Safety First Certified']),
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      hourlyRate: 350,
      distanceKm: 1.4,
      isAvailable: true,
      completedJobs: 418,
      badges: JSON.stringify(['Federation Gold Star', '100% On-Time', 'DigiLocker Verified', 'PMSBY Insured']),
      welfareBalance: 14250,
      pensionSavings: 38400,
      insurancePolicyNo: 'PMSBY-COOP-883921',
      lat: 28.6139,
      lng: 77.2090
    }
  });

  const workerUser2 = await prisma.user.create({
    data: {
      phone: '+91 98111 22334',
      name: 'Rajesh Kumar Verma',
      email: 'rajesh.verma@coop.in',
      role: 'WORKER'
    }
  });

  const worker2 = await prisma.workerProfile.create({
    data: {
      id: 'w-102',
      userId: workerUser2.id,
      trade: 'Sanitary & Pipe Master Plumber',
      tradeHi: 'वरिष्ठ प्लंबर',
      secondaryTrades: JSON.stringify(['Water Tank Specialist', 'Drainage']),
      experienceYears: 9,
      rating: 4.88,
      reviewCount: 289,
      societyName: 'Shahdara Shramik Sahakari Samiti',
      societyId: 'COOP-DL-2019-142',
      district: 'East Delhi / Mayur Vihar',
      verificationStatus: 'VERIFIED',
      aadharMasked: 'XXXX-XXXX-4512',
      skillCertifications: JSON.stringify(['Skill India Certified Plumber', 'Advanced High Pressure Hydraulics']),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      hourlyRate: 300,
      distanceKm: 2.1,
      isAvailable: true,
      completedJobs: 312,
      badges: JSON.stringify(['Leak Specialist', 'DigiLocker Verified', 'PMSBY Insured']),
      welfareBalance: 9800,
      pensionSavings: 27100,
      insurancePolicyNo: 'PMSBY-COOP-451290',
      lat: 28.6289,
      lng: 77.2290
    }
  });

  const workerUser3 = await prisma.user.create({
    data: {
      phone: '+91 97123 45678',
      name: 'Lakshmi Devi',
      email: 'lakshmi.devi@coop.in',
      role: 'WORKER'
    }
  });

  await prisma.workerProfile.create({
    data: {
      id: 'w-103',
      userId: workerUser3.id,
      trade: 'Senior Elder Care Assistant',
      tradeHi: 'वरिष्ठ केयरगिवर',
      secondaryTrades: JSON.stringify(['Physiotherapy Assistant', 'Patient Nutrition']),
      experienceYears: 7,
      rating: 4.96,
      reviewCount: 198,
      societyName: 'Mahila Shramik Swavalamban Society',
      societyId: 'COOP-MH-2020-044',
      district: 'South Delhi / Saket',
      verificationStatus: 'VERIFIED',
      aadharMasked: 'XXXX-XXXX-9901',
      skillCertifications: JSON.stringify(['Red Cross First Aid Certified', 'Geriatric Caregiving Diploma']),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      hourlyRate: 400,
      distanceKm: 3.0,
      isAvailable: true,
      completedJobs: 230,
      badges: JSON.stringify(['Top Rated Caregiver', 'Red Cross Certified', 'DigiLocker Verified']),
      welfareBalance: 16500,
      pensionSavings: 42000,
      insurancePolicyNo: 'PMSBY-COOP-990145',
      lat: 28.5244,
      lng: 77.2185
    }
  });

  const workerUser4 = await prisma.user.create({
    data: {
      phone: '+91 98888 77665',
      name: 'Gurpreet Singh',
      email: 'gurpreet.singh@coop.in',
      role: 'WORKER'
    }
  });

  await prisma.workerProfile.create({
    data: {
      id: 'w-104',
      userId: workerUser4.id,
      trade: 'Master Carpenter',
      tradeHi: 'वरिष्ठ बढ़ई',
      secondaryTrades: JSON.stringify(['Modular Kitchen', 'Lock Specialist']),
      experienceYears: 14,
      rating: 4.90,
      reviewCount: 410,
      societyName: 'Delhi Craftsmen Cooperative Federation',
      societyId: 'COOP-DL-2016-012',
      district: 'West Delhi / Rajouri Garden',
      verificationStatus: 'VERIFIED',
      aadharMasked: 'XXXX-XXXX-1123',
      skillCertifications: JSON.stringify(['Master Woodcrafter NSDC', 'Safety & Precision Assembly']),
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      hourlyRate: 400,
      distanceKm: 4.2,
      isAvailable: false,
      completedJobs: 560,
      badges: JSON.stringify(['Master Craftsman', 'DigiLocker Verified', '10+ Years Trust']),
      welfareBalance: 24100,
      pensionSavings: 68000,
      insurancePolicyNo: 'PMSBY-COOP-112378',
      lat: 28.6489,
      lng: 77.1290
    }
  });
  console.log('✅ Seeded 4 verified worker profiles.');

  // 4. Create Initial Bookings with 88/6/3/3 calculations
  await prisma.booking.create({
    data: {
      id: 'BK-9021',
      customerId: user1.id,
      customerName: 'Ananya Deshmukh',
      customerPhone: '+91 98201 11223',
      customerAddress: 'Flat 402, Greenview Heights, Sector 14, New Delhi',
      serviceCategoryId: 'electrician',
      serviceTitle: 'Electrician & Power Care',
      selectedItemsJson: JSON.stringify([
        { item: { id: 'el-1', name: 'Emergency Short Circuit Fix', baseRate: 350 }, quantity: 1 },
        { item: { id: 'el-3', name: 'Switchboard / MCB Replacement', baseRate: 180 }, quantity: 2 },
      ]),
      bookingType: 'INSTANT_SOS',
      scheduledTime: 'Today, 30 Mins (SOS Priority)',
      status: 'EN_ROUTE',
      workerId: worker1.id,
      startOtp: '7412',
      completionOtp: '8905',
      totalAmount: 710,
      workerWage: 624.80, // 88%
      welfareCut: 42.60,   // 6%
      societyCut: 21.30,   // 3%
      platformCut: 21.30,  // 3%
      paymentStatus: 'ESCROW',
      paymentMethod: 'UPI',
      problemDescription: 'Main MCB tripping repeatedly with burnt plastic smell near the living room switchboard.'
    }
  });

  await prisma.booking.create({
    data: {
      id: 'BK-8980',
      customerId: user1.id,
      customerName: 'Vikramaditya Rao',
      customerPhone: '+91 98450 67890',
      customerAddress: 'Villa 12, Palm Meadows, Saket, New Delhi',
      serviceCategoryId: 'plumber',
      serviceTitle: 'Plumber & Water Works',
      selectedItemsJson: JSON.stringify([
        { item: { id: 'pl-1', name: 'Emergency Burst Pipe Leak Repair', baseRate: 300 }, quantity: 1 }
      ]),
      bookingType: 'INSTANT_SOS',
      scheduledTime: 'Today, Immediate',
      status: 'COMPLETED',
      workerId: worker2.id,
      startOtp: '3319',
      completionOtp: '5520',
      totalAmount: 300,
      workerWage: 264.00,
      welfareCut: 18.00,
      societyCut: 9.00,
      platformCut: 9.00,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      rating: 5,
      reviewComment: 'Arrived in 20 minutes! Prompt, professional and transparent bill with zero overcharging.',
      workProofPhoto: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&auto=format&fit=crop&q=80',
      completedAt: new Date()
    }
  });
  console.log('✅ Seeded sample live & completed bookings.');

  // 5. Create Welfare Ledger Entries
  await prisma.welfareTransaction.create({
    data: {
      id: 'WL-101',
      workerId: worker1.id,
      date: '22 Aug 2026',
      type: 'INSURANCE_PMSBY',
      amount: 42.60,
      description: 'Direct 6% micro-contribution from Job #BK-9021',
      status: 'CREDITED'
    }
  });

  await prisma.welfareTransaction.create({
    data: {
      id: 'WL-102',
      workerId: worker1.id,
      date: '21 Aug 2026',
      type: 'PENSION_SAVINGS',
      amount: 35.00,
      description: 'Daily automatic micro-pension accumulation',
      status: 'CREDITED'
    }
  });
  console.log('✅ Seeded welfare transactions.');

  // 6. Create AI Demand Forecasts
  await prisma.demandForecast.createMany({
    data: [
      {
        id: 'df-1',
        district: 'Central Delhi',
        trade: 'Electrician & Inverter Technicians',
        currentAvailableWorkers: 24,
        predictedDemand: 58,
        surgeLevel: 'HIGH_ALERT',
        weatherTrigger: 'Heatwave Alert (>42°C) - High AC/Inverter Grid Loads',
        reason: 'Power grid load fluctuations predicted to cause 140% surge in switchboard & inverter repair requests.',
        recommendation: 'Mobilize 30 additional certified cooperative electricians from neighboring outer rings with temporary transport vouchers.',
        recommendedMobilization: 30
      },
      {
        id: 'df-2',
        district: 'East Delhi & Noida Border',
        trade: 'Plumber & Drainage Specialists',
        currentAvailableWorkers: 18,
        predictedDemand: 42,
        surgeLevel: 'ELEVATED',
        weatherTrigger: 'Monsoon Rain Warning in next 48 hrs',
        reason: 'Rainwater drain clogs and basement sump pump failures historically peak by 120% during torrential spells.',
        recommendation: 'Pre-allocate 15 cooperative drainage kits and alert primary societies in low-lying sectors.',
        recommendedMobilization: 15
      },
      {
        id: 'df-3',
        district: 'South Delhi Clusters',
        trade: 'Elderly Caregivers & Nurses',
        currentAvailableWorkers: 35,
        predictedDemand: 40,
        surgeLevel: 'NORMAL',
        reason: 'Steady seasonal demand with high repeat booking rates from senior citizen gated communities.',
        recommendation: 'Maintain standard roster; schedule bi-weekly skill refresher seminar on physio assists.',
        recommendedMobilization: 10
      }
    ]
  });
  console.log('✅ Seeded AI demand forecasts.');

  // 7. Create Disputes
  await prisma.dispute.create({
    data: {
      id: 'DSP-401',
      bookingId: 'BK-8750',
      customerName: 'Col. R. K. Singhal (Retd)',
      workerName: 'Manoj Kumar (Plumber)',
      issueCategory: 'Material Cost Disagreement',
      description: 'Customer claims copper fitting replacement charge of ₹450 was higher than local hardware retail estimate.',
      status: 'UNDER_REVIEW',
      filedDate: 'Yesterday, 4:30 PM',
      resolutionNote: 'Society manager verified GST invoice from authorized cooperative hardware depot. Difference of ₹30 to be settled from goodwill pool.'
    }
  });
  console.log('✅ Seeded disputes.');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
