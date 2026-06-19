import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail };

// Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const CHUNK_SIZE = 800 * 1024; // 800KB chunks for Firestore 1MB limit

/**
 * Uploads a base64 file string to Firestore, chunking it if it exceeds CHUNK_SIZE.
 */
export async function uploadLargeFile(
  collectionName: string, 
  metadata: Record<string, any>, 
  fileData: string
) {
  if (fileData.length <= CHUNK_SIZE) {
    return await addDoc(collection(db, collectionName), {
      ...metadata,
      fileData,
      hasChunks: false,
      createdAt: serverTimestamp()
    });
  }

  // Create main document
  const docRef = await addDoc(collection(db, collectionName), {
    ...metadata,
    fileData: '', // Chunks follow
    hasChunks: true,
    totalChunks: Math.ceil(fileData.length / CHUNK_SIZE),
    createdAt: serverTimestamp()
  });

  // Upload chunks sequentially
  for (let i = 0; i < fileData.length; i += CHUNK_SIZE) {
    await addDoc(collection(docRef, 'chunks'), {
      index: Math.floor(i / CHUNK_SIZE),
      data: fileData.substring(i, i + CHUNK_SIZE)
    });
  }

  return docRef;
}

/**
 * Downloads a chunked file from Firestore and reconstitutes it.
 */
export async function downloadLargeFile(document: any): Promise<string> {
  if (!document.hasChunks) {
    return document.fileData;
  }

  // Determine path based on collectionName metadata or fallback logic
  let collectionName = document.collectionName || 'documents';
  if (!document.collectionName) {
    if (document.type === 'update') collectionName = 'projectUpdates';
    else if (document.type === 'log') collectionName = 'internalLogs';
    else if (document.type === 'report') collectionName = 'technicalReports';
  }

  const path = `${collectionName}/${document.id}/chunks`;
  const q = query(collection(db, path), orderBy('index', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().data).join('');
}

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
