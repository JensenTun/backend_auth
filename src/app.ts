import express, { Application } from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health Check Endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;