import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const servicesRouter = Router();

// GET /api/services - Retrieve all service categories with standard rate cards
servicesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        standardItems: true,
      },
      orderBy: {
        id: 'asc',
      }
    });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch service categories', error: error.message });
  }
});

// GET /api/services/:id - Get single category details
servicesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { id: req.params.id },
      include: { standardItems: true }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving service details', error: error.message });
  }
});
