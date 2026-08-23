import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const workersRouter = Router();

// Helper to format worker profile JSON fields
export const formatWorker = (w: any) => ({
  ...w,
  name: w.user?.name || w.name || 'Cooperative Craftsman',
  phone: w.user?.phone || w.phone || '+91 98765 00000',
  secondaryTrades: typeof w.secondaryTrades === 'string' ? JSON.parse(w.secondaryTrades || '[]') : w.secondaryTrades,
  skillCertifications: typeof w.skillCertifications === 'string' ? JSON.parse(w.skillCertifications || '[]') : w.skillCertifications,
  badges: typeof w.badges === 'string' ? JSON.parse(w.badges || '[]') : w.badges,
});

// GET /api/workers - List workers
workersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { trade, isAvailable, verificationStatus } = req.query;

    const where: any = {};
    if (trade) {
      where.trade = { contains: String(trade) };
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    if (verificationStatus) {
      where.verificationStatus = String(verificationStatus);
    }

    const workers = await prisma.workerProfile.findMany({
      where,
      include: {
        user: { select: { phone: true, name: true, email: true } }
      },
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      count: workers.length,
      data: workers.map(formatWorker)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workers', error: error.message });
  }
});

// GET /api/workers/:id - Single worker profile
workersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        welfareLedger: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({ success: true, data: formatWorker(worker) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch worker profile', error: error.message });
  }
});

// PATCH /api/workers/:id/availability - Toggle status
workersRouter.patch('/:id/availability', async (req: Request, res: Response) => {
  try {
    const current = await prisma.workerProfile.findUnique({ where: { id: req.params.id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const updated = await prisma.workerProfile.update({
      where: { id: req.params.id },
      data: { isAvailable: !current.isAvailable },
      include: { user: true }
    });

    res.json({ success: true, data: formatWorker(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update availability', error: error.message });
  }
});

// POST /api/workers/register - Worker self-onboarding
workersRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, phone, trade, societyName, societyId, district, experienceYears, hourlyRate } = req.body;

    if (!name || !phone || !trade) {
      return res.status(400).json({ success: false, message: 'Name, phone, and primary trade are required' });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name,
          role: 'WORKER'
        }
      });
    }

    const workerId = `w-${Math.floor(100 + Math.random() * 900)}`;
    const newWorker = await prisma.workerProfile.create({
      data: {
        id: workerId,
        userId: user.id,
        trade,
        secondaryTrades: JSON.stringify([]),
        experienceYears: Number(experienceYears) || 3,
        societyName: societyName || 'Central District Labour Cooperative Federation',
        societyId: societyId || `COOP-DL-2026-${Math.floor(100 + Math.random() * 900)}`,
        district: district || 'New Delhi',
        verificationStatus: 'PENDING',
        aadharMasked: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        skillCertifications: JSON.stringify(['Skill India Registered', 'Trade Verified']),
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        hourlyRate: Number(hourlyRate) || 300,
        insurancePolicyNo: `PMSBY-COOP-${Math.floor(100000 + Math.random() * 900000)}`,
        badges: JSON.stringify(['New Registered Member'])
      },
      include: { user: true }
    });

    res.status(201).json({
      success: true,
      message: 'Worker registered successfully. Verification pending with Primary Society.',
      data: formatWorker(newWorker)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});
