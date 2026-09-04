import { auth, db } from '../config/firebase.config.js';
import { IUserProfile } from '../interfaces/user.interface.js';
import { AppError } from '../utils/appError.js';

export class AuthService {
    private static usersCollection = db.collection('users');

    static async authenticateWithGoogle(idToken: string): Promise<IUserProfile> {
        try {
            // 1. Verify Google ID Token
            const decodedToken = await auth.verifyIdToken(idToken);
            const { uid, email, name, picture } = decodedToken;

            if (!email) {
                throw new AppError('Email not found in authentication provider', 400);
            }

            const userRef = this.usersCollection.doc(uid);
            const userDoc = await userRef.get();
            const now = new Date().toISOString();

            if (!userDoc.exists) {
                // Create new user profile
                const newUser: IUserProfile = {
                    uid,
                    email,
                    displayName: name || '',
                    photoURL: picture || '',
                    role: 'user',
                    createdAt: now,
                    updatedAt: now,
                };

                await userRef.set(newUser);
                return newUser;
            } else {
                // Update existing user timestamp
                await userRef.update({ updatedAt: now });
                return { ...userDoc.data(), updatedAt: now } as IUserProfile;
            }
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Authentication failed: ${error.message}`, 401);
        }
    }
}