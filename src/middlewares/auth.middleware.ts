import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config.js';
import { AuthService } from '../services/auth.service.js';
import { IUserProfile, UserRole } from '../interfaces/user.interface.js';
import { AppError } from '../utils/appError.js';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
    user?: IUserProfile;
    firebaseUser?: DecodedIdToken;
}

/**
 * 1. Base Authentication Middleware
 * Validates Firebase ID Token and checks for revoked tokens.
 */
export const authenticateToken = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Access Denied: No Token Provided', 401));
        }

        const token = authHeader.split(' ')[1];

        // checkRevoked = true: Account ကို Firebase console မှ disable/delete လုပ်ထားပါက တားဆီးရန်
        const decodedToken = await auth.verifyIdToken(token, true);
        req.firebaseUser = decodedToken;

        next();
    } catch (error: any) {
        if (error.code === 'auth/id-token-revoked') {
            return next(new AppError('Token has been revoked. Please log in again.', 401));
        }
        if (error.code === 'auth/user-disabled') {
            return next(new AppError('This user account has been disabled', 403));
        }
        return next(new AppError('Invalid or Expired Token', 401));
    }
};

/**
 * 2. Email Verification Enforcer Middleware
 * Protects endpoints that require verified emails.
 */
export const requireVerifiedEmail = (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): void => {
    if (!req.firebaseUser) {
        return next(new AppError('User authentication state missing', 401));
    }

    if (!req.firebaseUser.email_verified) {
        return next(
            new AppError('EMAIL_NOT_VERIFIED: Please verify your email before accessing this resource.', 403)
        );
    }

    next();
};

/**
 * 3. User Profile Injector Middleware
 * Fetches Firestore profile data for routes that need DB attributes.
 */
export const attachUserProfile = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.firebaseUser) {
            return next(new AppError('User authentication state missing', 401));
        }

        const userProfile = await AuthService.getUserById(req.firebaseUser.uid);
        req.user = userProfile;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * 4. Role-Based Access Control Middleware (RBAC)
 */
export const requireRole = (allowedRoles: UserRole[]) => {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('User profile context missing', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('Forbidden: Insufficient permissions', 403));
        }

        next();
    };
};