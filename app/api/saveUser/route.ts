import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore>;

export async function POST(req: Request) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase initialized successfully');
      db = getFirestore(admin.app());
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return NextResponse.json({ error: 'Failed to initialize Firebase', details: (error as Error)?.message }, { status: 500 });
    }
  }

  if (!db) {
    db = getFirestore(admin.app());
  }

  const { address } = await req.json();
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    await db.collection('users').doc(address).set({
      address,
      name: "User",
      admin: false,
    });
    console.log(`User saved for address: ${address}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Firestore write failed:', error);
    const errorMessage = (error as Error)?.message || 'Unknown error';
    return NextResponse.json({ error: 'Failed to save user', details: errorMessage }, { status: 500 });
  }
}