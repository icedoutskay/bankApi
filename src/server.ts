import 'dotenv/config';

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { connectRedis } from './config/redis';
import config from './config/config';

import authRoutes from './routes/auth.route';
import accountRoutes from './routes/account.route';
import transferRoutes from './routes/transfer.route';
import adminRoutes from './routes/admin.route';

const app: Application = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api', transferRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log(' Connected to MongoDB');
    
    await connectRedis();
    console.log(' Connected to Redis');
    
    app.listen(config.PORT, () => {
      console.log(` Server running on port ${config.PORT}`);
      console.log(` bankApi available at http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();