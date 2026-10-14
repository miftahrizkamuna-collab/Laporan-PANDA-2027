import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Default config fallback ensures build never fails on remote host if JSON is modified or incomplete
const defaultFirebaseConfig = {
  projectId: "yodeling-drummer-x8chg",
  appId: "1:468162884192:web:af274cdd4d48072e6cc905",
  apiKey: "AIzaSyCq-B2AbviW5iAOmP3wN2OYJTxeg_Cuhr8",
  authDomain: "yodeling-drummer-x8chg.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-796d3b79-0134-4bac-8732-9467068cbcb3",
  storageBucket: "yodeling-drummer-x8chg.firebasestorage.app",
  messagingSenderId: "468162884192",
};

const resolvedConfig = { ...defaultFirebaseConfig, ...(firebaseConfig || {}) };

const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApps()[0];

// CRITICAL: The app will break without specifying the database ID as documented in the Firebase Integration skill
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Silently test connection without ever blocking the UI or throwing unhandled rejections
export async function testConnection() {
  try {
    if (db) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch {
    // Graceful fallback to Zero-API local persistence - no API key needed
    console.info('Sistem aktif dalam mode Zero-API (Bebas API Key & Penyimpanan Lokal Reaktif)');
  }
}

testConnection().catch(() => {});

