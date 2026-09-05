import express, { Application } from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Application = express();

// Middlewares
// Allowed origins စာရင်းတွင် Localhost အပြင် Environment Variable မှ ရလာသော Production Frontend URL ကို ပါ ထည့်သွင်းထားပါမည်
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Render Environment Variable မှ လာမည်
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Mobile apps/Postman သို့မဟုတ် Allowed list ထဲပါသော Domain များကို ခွင့်ပြုမည်
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS Policy'));
        }
    },
    credentials: true,
}));
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