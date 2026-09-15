import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, attachUserProfile, requireRole, requireVerifiedEmail } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Get Logged In User Profile (Verification မဖြစ်သေးလည်း 403 မတက်ဘဲ status ကြည့်ရှုခွင့်ပေးမည်)
router.get('/me', authenticateToken, UserController.getProfile);

// 2. Verified Email အသုံးပြုသူများသာ ဝင်ရောက်နိုင်သော Endpoint (ဥပမာ- Orders / Posts)
router.get('/dashboard', authenticateToken, requireVerifiedEmail, (_req, res) => {
    res.status(200).json({ status: 'success', message: 'Welcome to protected dashboard' });
});

// 3. Admin Only Route (Requires Verified Email + Admin Role + DB Profile Injection)
router.get('/admin/dashboard', authenticateToken, requireVerifiedEmail, attachUserProfile, requireRole(['admin']), (_req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Admin Dashboard',
    });
});

export { router as userRoutes };