import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

const result = dotenv.config({ path: '.env.local' });
console.log('dotenv config result:', result);
if (result.error) {
  console.error('Failed to load .env.local:', result.error.message);
  process.exit(1);
}
console.log('Loaded environment variables:', process.env);

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
console.log('Processed private key:', privateKey);
if (!privateKey || !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  console.error('Invalid private key format:', privateKey);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  console.log('Firebase initialized successfully with app:', admin.app().name);
  const db = admin.firestore();
  console.log('Firestore instance created');
} catch (error) {
  console.error('Initialization failed:', {
    message: (error as Error)?.message,
    stack: (error as Error)?.stack,
    envVars: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    },
  });
  process.exit(1);
}