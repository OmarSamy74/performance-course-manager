import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let app;
let db;

try {
  if (getApps().length === 0) {
    // Initialize with service account or use default credentials
    // For Netlify, we'll use environment variables
    const firebaseConfig = process.env.FIREBASE_CONFIG 
      ? JSON.parse(process.env.FIREBASE_CONFIG)
      : {};

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Use service account key from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Use project ID and let Firebase use default credentials
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback: try to initialize with default credentials
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { db };

/**
 * Generic function to get a collection
 */
export async function getCollection<T extends { id: string }>(
  collectionName: string
): Promise<T[]> {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error reading ${collectionName}:`, error);
    return [];
  }
}

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  try {
    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as T;
  } catch (error) {
    console.error(`Error reading ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Generic function to create a document
 */
export async function createDocument<T extends { id?: string }>(
  collectionName: string,
  data: T
): Promise<T & { id: string }> {
  try {
    const { id, ...docData } = data;
    const docRef = id 
      ? db.collection(collectionName).doc(id)
      : db.collection(collectionName).doc();
    
    await docRef.set(docData);
    return { id: docRef.id, ...docData } as T & { id: string };
  } catch (error) {
    console.error(`Error creating ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  try {
    const docRef = db.collection(collectionName).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    await docRef.update(updates);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as T;
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<boolean> {
  try {
    const docRef = db.collection(collectionName).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Query documents with filters
 */
export async function queryCollection<T>(
  collectionName: string,
  filters?: Array<{ field: string; operator: any; value: any }>
): Promise<T[]> {
  try {
    let query: any = db.collection(collectionName);
    
    if (filters) {
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
}
