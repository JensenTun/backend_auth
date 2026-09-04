import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
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
            next(error); // Pass to global error middleware
        }
    }
}