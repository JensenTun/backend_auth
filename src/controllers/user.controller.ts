import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';
import { AppError } from '../utils/appError.js';

export class UserController {
    static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const firebaseUser = req.firebaseUser;

            if (!firebaseUser) {
                throw new AppError('User authentication missing', 401);
            }

            // 📌 Email Verified မဖြစ်သေးပါက 403 Throw မလုပ်ဘဲ Limited Info ပြန်ပေးခြင်း
            if (!firebaseUser.email_verified) {
                res.status(200).json({
                    status: 'success',
                    data: {
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.name || '',
                            emailVerified: false,
                            role: 'user',
                        },
                    },
                });
                return;
            }

            // Email Verified ဖြစ်ပြီးသားဆိုပါက Firestore တွင်းမှ Full Profile ထုတ်ပေးခြင်း
            const userProfile = await AuthService.getUserById(firebaseUser.uid);

            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        ...userProfile,
                        emailVerified: true,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }
}