import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const welfareRouter = Router();

// GET /api/welfare/:workerId - Fetch worker social security & welfare ledger
welfareRouter.get('/:workerId', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { id: req.params.workerId },
      include: {
        welfareLedger: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({
      success: true,
      data: {
        workerId: worker.id,
        workerName: worker.trade,
        insurancePolicyNo: worker.insurancePolicyNo,
        pmsbyCoverAmount: 200000,
        pensionSavings: worker.pensionSavings,
        welfareBalance: worker.welfareBalance,
        ledger: worker.welfareLedger
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch welfare ledger', error: error.message });
  }
});

// POST /api/welfare/loan-request - Submit emergency tool / medical loan request
welfareRouter.post('/loan-request', async (req: Request, res: Response) => {
  try {
    const { workerId, amount, purpose } = req.body;

    const worker = await prisma.workerProfile.findUnique({ where: { id: workerId || 'w-101' } });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const loanAmount = Number(amount) || 5000;

    // Create a transaction record in welfare ledger
    const entry = await prisma.welfareTransaction.create({
      data: {
        id: `WL-${Math.floor(100 + Math.random() * 900)}`,
        workerId: worker.id,
        date: 'Today',
        type: 'DISTRESS_GRANT',
        amount: loanAmount,
        description: `Instant Micro-Credit: ${purpose || 'Tool Replacement'}`,
        status: 'CREDITED'
      }
    });

    res.status(201).json({
      success: true,
      message: `Emergency loan of ₹${loanAmount} approved via fast-track cooperative protocol.`,
      data: entry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Loan application failed', error: error.message });
  }
});
