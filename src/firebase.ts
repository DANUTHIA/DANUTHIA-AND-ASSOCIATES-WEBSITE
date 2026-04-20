import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

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

  const chunksRef = collection(db, 'documents', document.id, 'chunks');
  // Handle different collection names if needed, but 'documents' is primary
  // More robust: use document reference to get subcollection
  const q = query(collection(db, 'documents', document.id, 'chunks'), orderBy('index', 'asc'));
  
  // If we don't know the exact path structure, we might need a more generic way
  // but for this app, 'documents' and potentially 'projectUpdates' are the ones
  // we'll try to handle specifically or use a path from the document if available.
  
  // Let's assume passed document has its full path info or we try common ones
  let path = `documents/${document.id}/chunks`;
  if (document.type === 'update') path = `projectUpdates/${document.id}/chunks`;
  if (document.type === 'log') path = `internalLogs/${document.id}/chunks`;

  const snapshot = await getDocs(query(collection(db, path), orderBy('index', 'asc')));
  return snapshot.docs.map(doc => doc.data().data).join('');
}

// Error Handling Spec for Firestore Permissions
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
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  if (errorMessage.toLowerCase().includes('permission')) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
}
