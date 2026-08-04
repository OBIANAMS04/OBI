import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import mfaRoutes from './routes/mfa';
import dataRoutes from './routes/data';
import exemptionsRoutes from './routes/exemptions';
import casesRoutes from './routes/cases';
import complianceRoutes from './routes/compliance';
import latencyRoutes from './routes/latency';
import auditRoutes from './routes/audit';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/mfa', mfaRoutes);
app.use('/data', dataRoutes);
app.use('/exemptions', exemptionsRoutes);
app.use('/cases', casesRoutes);
app.use('/compliance', complianceRoutes);
app.use('/latency', latencyRoutes);
app.use('/audit', auditRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'checking...',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
