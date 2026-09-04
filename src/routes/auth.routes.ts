import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', AuthController.googleSignIn);

export { router as authRoutes };