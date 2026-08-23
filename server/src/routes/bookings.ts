import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { formatWorker } from './workers';

export const bookingsRouter = Router();

// Helper to format booking objects
const formatBooking = (b: any) => ({
  ...b,
  selectedItems: typeof b.selectedItemsJson === 'string' ? JSON.parse(b.selectedItemsJson || '[]') : b.selectedItemsJson,
  worker: b.worker ? formatWorker(b.worker) : null
});

// GET /api/bookings - List all bookings
bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, workerId } = req.query;

    const where: any = {};
    if (status) {
      where.status = String(status);
    }
    if (workerId) {
      where.workerId = String(workerId);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        worker: true,
        serviceCategory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings.map(formatBooking)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
});

// POST /api/bookings - Create a new booking
bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      serviceCategoryId, 
      items, 
      bookingType, 
      customerAddress, 
      customerName, 
      customerPhone,
      problemDescription 
    } = req.body;

    if (!serviceCategoryId) {
      return res.status(400).json({ success: false, message: 'serviceCategoryId is required' });
    }

    // Fetch service category and standard items
    const category = await prisma.serviceCategory.findUnique({
      where: { id: serviceCategoryId },
      include: { standardItems: true }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }

    // Calculate total price
    let calculatedTotal = category.baseInspectionFee;
    const selectedItemObjs: { item: any; quantity: number }[] = [];

    if (Array.isArray(items)) {
      items.forEach((itemInput: { itemId: string; qty: number }) => {
        const found = category.standardItems.find(si => si.id === itemInput.itemId);
        if (found) {
          selectedItemObjs.push({ item: found, quantity: itemInput.qty });
          calculatedTotal += found.baseRate * (Number(itemInput.qty) || 1);
        }
      });
    }

    // 88/6/3/3 Fair Wage Split
    const workerWage = Number((calculatedTotal * 0.88).toFixed(2));
    const welfareCut = Number((calculatedTotal * 0.06).toFixed(2));
    const societyCut = Number((calculatedTotal * 0.03).toFixed(2));
    const platformCut = Number((calculatedTotal * 0.03).toFixed(2));

    // Find nearest available worker in that trade
    const availableWorker = await prisma.workerProfile.findFirst({
      where: {
        trade: { contains: serviceCategoryId },
        isAvailable: true,
        verificationStatus: 'VERIFIED'
      }
    }) || await prisma.workerProfile.findFirst({
      where: { isAvailable: true }
    });

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const completionOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await prisma.booking.create({
      data: {
        id: bookingId,
        customerName: customerName || 'Citizen User',
        customerPhone: customerPhone || '+91 98711 00223',
        customerAddress: customerAddress || 'Sector 22, Rohini, New Delhi - 110085',
        serviceCategoryId: category.id,
        serviceTitle: category.title,
        selectedItemsJson: JSON.stringify(selectedItemObjs),
        bookingType: bookingType || 'INSTANT_SOS',
        scheduledTime: bookingType === 'INSTANT_SOS' ? 'Instant SOS (Under 30 Mins)' : 'Tomorrow, 10:00 AM',
        status: availableWorker ? 'MATCHED' : 'SEARCHING',
        workerId: availableWorker ? availableWorker.id : null,
        startOtp,
        completionOtp,
        totalAmount: calculatedTotal,
        workerWage,
        welfareCut,
        societyCut,
        platformCut,
        paymentStatus: 'PENDING',
        problemDescription: problemDescription || 'Standard verified cooperative repair service request'
      },
      include: {
        worker: true,
        serviceCategory: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: formatBooking(newBooking)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
});

// PATCH /api/bookings/:id/accept - Worker accepts booking
bookingsRouter.patch('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { workerId } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'EN_ROUTE',
        workerId: workerId || booking.workerId || 'w-101'
      },
      include: { worker: true, serviceCategory: true }
    });

    res.json({
      success: true,
      message: 'Booking accepted. Worker is en-route.',
      data: formatBooking(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to accept booking', error: error.message });
  }
});

// POST /api/bookings/:id/start-otp - Dual OTP verification to start work
bookingsRouter.post('/:id/start-otp', async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Allow correct startOtp or standard demo bypass 1234
    if (otp !== booking.startOtp && otp !== '1234') {
      return res.status(400).json({ success: false, message: 'Invalid Start OTP. Ask the customer for their on-screen 4-digit code.' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS' },
      include: { worker: true, serviceCategory: true }
    });

    res.json({
      success: true,
      message: 'OTP verified. Work in progress.',
      data: formatBooking(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
});

// POST /api/bookings/:id/complete - Mark work finished & credit welfare fund
bookingsRouter.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { proofPhotoUrl } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        workProofPhoto: proofPhotoUrl || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&auto=format&fit=crop&q=80'
      },
      include: { worker: true, serviceCategory: true }
    });

    // Update worker stats & welfare balance in database
    if (booking.workerId) {
      await prisma.workerProfile.update({
        where: { id: booking.workerId },
        data: {
          completedJobs: { increment: 1 },
          welfareBalance: { increment: booking.welfareCut },
          pensionSavings: { increment: 25 }
        }
      });

      // Insert transaction in welfare ledger
      await prisma.welfareTransaction.create({
        data: {
          id: `WL-${Math.floor(100 + Math.random() * 900)}`,
          workerId: booking.workerId,
          date: 'Today',
          type: 'INSURANCE_PMSBY',
          amount: booking.welfareCut,
          description: `6% Welfare contribution from Job #${booking.id}`,
          status: 'CREDITED'
        }
      });
    }

    res.json({
      success: true,
      message: 'Job completed successfully. Welfare & earnings updated.',
      data: formatBooking(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to complete booking', error: error.message });
  }
});

// POST /api/bookings/:id/pay - Settle payment
bookingsRouter.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const { paymentMethod } = req.body;

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'UPI'
      },
      include: { worker: true, serviceCategory: true }
    });

    res.json({
      success: true,
      message: 'Payment settled successfully via split escrow.',
      data: formatBooking(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Payment settlement failed', error: error.message });
  }
});

// POST /api/bookings/:id/rate - Submit rating
bookingsRouter.post('/:id/rate', async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        rating: Number(rating) || 5,
        reviewComment: comment || 'Excellent cooperative service.'
      },
      include: { worker: true, serviceCategory: true }
    });

    res.json({
      success: true,
      message: 'Rating and review submitted.',
      data: formatBooking(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Rating submission failed', error: error.message });
  }
});
