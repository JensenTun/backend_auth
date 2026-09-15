import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
    // Google OAuth Authentication
    static async googleSignIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { idToken } = req.body;
            const user = await AuthService.authenticateWithGoogle(idToken);

            res.status(200).json({
                status: 'success',
                message: 'User authenticated successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    // Email/Password Sync & Profile Initialization
    static async syncEmailUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { idToken, displayName } = req.body;
            const user = await AuthService.syncEmailUser(idToken, displayName);

            res.status(201).json({
                status: 'success',
                message: 'User registered/authenticated successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    // Generate Password Reset Link
    static async sendPasswordResetEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            const link = await AuthService.generatePasswordResetLink(email);

            // Real-world: ဤ link ကို Nodemailer သို့မဟုတ် SendGrid ဖြင့် User Email သို့ ပို့နိုင်ပါသည်။
            res.status(200).json({
                status: 'success',
                message: 'Password reset email generated successfully',
                data: { resetLink: link },
            });
        } catch (error) {
            next(error);
        }
    }
}