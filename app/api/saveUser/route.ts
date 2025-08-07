import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

export async function POST(req: Request) {
  // Load environment variables
  const result = dotenv.config({ path: '.env.local' });
  console.log('dotenv config result:', result);
  if (result.error) {
    console.error('Failed to load .env.local:', result.error.message);
    return NextResponse.json({ error: 'Environment load failed', details: result.error.message }, { status: 500 });
  }
  console.log('Loaded environment variables:', process.env);

  // Safe way to log existing apps
  console.log('Existing apps:', 
    admin.apps
      .filter(app => app !== null)  // Filter out null entries
      .map(app => app.name)         // Now safe to access .name
  );
  // Initialize Firebase if not already initialized
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    console.log('Processed private key:', privateKey);
    if (!privateKey || !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return NextResponse.json({ error: 'Invalid private key format' }, { status: 500 });
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
    } catch (error) {
      console.error('Firebase initialization error:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });
      return NextResponse.json({ error: 'Failed to initialize Firebase', details: (error as Error)?.message }, { status: 500 });
    }
  }

  const db = getFirestore();
  console.log(db);
  let address, loginType, email, name, picture;
  try {
    const body = await req.json();
    address = body.address;
    loginType = body.loginType || 'wallet';
    email = body.email;
    name = body.name;
    picture = body.picture;
    console.log('Parsed request body:', body);
  } catch (error) {
    console.error('Failed to parse request body:', (error as Error).message);
    return NextResponse.json({ error: 'Invalid request body', details: (error as Error).message }, { status: 400 });
  }

  console.log('Received data:', { address, loginType, email, name });
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    const docRef = db.collection('users').doc(address);
    const userData: any = {
      address,
      name: name || "User",
      admin: false,
      nft_points: 0,
      loginType,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    // Add additional fields for zkLogin users
    if (loginType === 'zklogin') {
      userData.email = email;
      userData.picture = picture;
    }

    await docRef.set(userData);
    console.log(`User saved for address: ${address} at docRef: ${docRef.path} with loginType: ${loginType}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Firestore write failed:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      address,
    });
    const errorMessage = (error as Error)?.message || 'Unknown error';
    return NextResponse.json({ error: 'Failed to save user', details: errorMessage }, { status: 500 });
  }
}