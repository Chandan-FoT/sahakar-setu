import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { formatWorker } from './workers';

export const authRouter = Router();

// POST /api/auth/login - Simple phone/role authentication
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, role } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await prisma.user.findUnique({
      where: { phone },
      include: { workerProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: role === 'WORKER' ? 'Shramik Member' : 'Citizen User',
          role: role || 'CUSTOMER'
        },
        include: { workerProfile: true }
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        },
        workerProfile: user.workerProfile ? formatWorker(user.workerProfile) : null
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Auth failed', error: error.message });
  }
});
