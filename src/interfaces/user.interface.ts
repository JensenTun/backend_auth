export interface IUserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface IAuthRequest {
    idToken: string;
}