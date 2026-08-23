import express from 'express';
import cors from 'cors';
import { servicesRouter } from './routes/services';
import { workersRouter } from './routes/workers';
import { bookingsRouter } from './routes/bookings';
import { welfareRouter } from './routes/welfare';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SahakarSetu Cooperative Service Marketplace Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/workers', workersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/welfare', welfareRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SahakarSetu API Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check available at http://localhost:${PORT}/api/health`);
});
