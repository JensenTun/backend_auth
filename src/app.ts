import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();

// 1. Helmet Security Headers
app.use(helmet());

// 2. Rate Limiting (Spam & Brute-Force Protection)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 မိနစ်
    max: 100, // IP တစ်ခုလျှင် ၁၅ မိနစ်အတွင်း Request အခါ ၁၀၀ သာ ခွင့်ပြုမည်
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        statusCode: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});

app.use('/api/', apiLimiter);

// 3. CORS Policy Setup
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS Policy'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Payload Size Limit လုပ်ခြင်း

// 4. Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Health Check Endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;