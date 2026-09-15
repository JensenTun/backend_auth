import { auth, db } from '../config/firebase.config.js';
import { IUserProfile, AuthProviderType, UserRole } from '../interfaces/user.interface.js';
import { AppError } from '../utils/appError.js';

export class AuthService {
    private static usersCollection = db.collection('users');

    // 1. Google OAuth Auth & Sync
    static async authenticateWithGoogle(idToken: string): Promise<IUserProfile> {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            const { uid, email, name, picture } = decodedToken;

            if (!email) {
                throw new AppError('Email missing from OAuth provider', 400);
            }

            return await this.handleUserPersistence(uid, email, name || '', picture || '', 'google');
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            if (error instanceof Error) {
                throw new AppError(`Authentication failed: ${error.message}`, 401);
            }
            throw new AppError('Authentication failed', 401);
        }
    }

    // 2. Email / Password Sync
    static async syncEmailUser(idToken: string, customDisplayName?: string): Promise<IUserProfile> {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            const { uid, email, name } = decodedToken;

            if (!email) {
                throw new AppError('Email is required', 400);
            }

            const displayName = customDisplayName || name || email.split('@')[0];
            return await this.handleUserPersistence(uid, email, displayName, '', 'email');
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            if (error instanceof Error) {
                throw new AppError(`Email sync failed: ${error.message}`, 401);
            }
            throw new AppError('Authentication failed', 401);
        }
    }

    // 3. User Role ကို Custom Claims ထဲသို့ တိုက်ရိုက် ထည့်သွင်းပေးခြင်း (Production Best Practice)
    static async setUserRole(uid: string, role: UserRole): Promise<void> {
        await auth.setCustomUserClaims(uid, { role });
        await this.usersCollection.doc(uid).update({
            role,
            updatedAt: new Date().toISOString(),
        });
    }

    // 4. Shared User Persistence with Firestore Transaction
    private static async handleUserPersistence(
        uid: string,
        email: string,
        displayName: string,
        photoURL: string,
        provider: AuthProviderType = 'email'
    ): Promise<IUserProfile> {
        const userRef = this.usersCollection.doc(uid);
        const now = new Date().toISOString();

        return await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                const newUser: IUserProfile = {
                    uid,
                    email,
                    displayName,
                    photoURL,
                    provider,
                    role: 'user',
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                };

                transaction.set(userRef, newUser);
                // Default Role ကို Custom Claim တင်ခြင်း
                await auth.setCustomUserClaims(uid, { role: 'user' });
                return newUser;
            } else {
                const userData = userDoc.data() as IUserProfile;

                if (!userData.isActive) {
                    throw new AppError('Your account has been deactivated', 403);
                }

                transaction.update(userRef, { updatedAt: now });
                return { ...userData, updatedAt: now };
            }
        });
    }

    // 5. Get User By ID with Auth Fallback
    static async getUserById(uid: string): Promise<IUserProfile> {
        const userRef = this.usersCollection.doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            try {
                const firebaseUser = await auth.getUser(uid);
                const email = firebaseUser.email || '';
                const displayName = firebaseUser.displayName || email.split('@')[0] || 'User';
                const photoURL = firebaseUser.photoURL || '';
                const provider = (
                    firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 'email'
                ) as AuthProviderType;

                return await this.handleUserPersistence(uid, email, displayName, photoURL, provider);
            } catch (error) {
                throw new AppError('User profile not found in database', 404);
            }
        }

        const userData = userDoc.data() as IUserProfile;

        if (!userData.isActive) {
            throw new AppError('Your account has been deactivated', 403);
        }

        return userData;
    }
}