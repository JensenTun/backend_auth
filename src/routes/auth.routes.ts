import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', AuthController.googleSignIn);
router.post('/email/sync', AuthController.syncEmailUser);
router.post('/password-reset', AuthController.sendPasswordResetEmail);

export { router as authRoutes };