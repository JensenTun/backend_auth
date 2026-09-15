export type UserRole = 'user' | 'admin' | 'manager';
export type AuthProviderType = 'google' | 'email';

export interface IUserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider?: AuthProviderType;
    role: UserRole;
    isActive: boolean;
    emailVerified?: boolean;
    createdAt: string;
    updatedAt: string;
}