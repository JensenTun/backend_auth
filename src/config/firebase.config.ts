import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing required Firebase environment variables in .env');
}

const formattedPrivateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Prevent duplicate initialization in serverless environments or hot-reloading
const app: App = getApps().length === 0
    ? initializeApp({
        credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: formattedPrivateKey,
        }),
    })
    : getApps()[0];

// Export Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);