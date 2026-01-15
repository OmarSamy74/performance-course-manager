// Firebase-based storage - replaces JSON file storage
import { 
  getCollection, 
  getDocument, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from './firebase';

/**
 * Read all documents from a Firestore collection
 */
export async function readData<T extends { id: string }>(collectionName: string): Promise<T[]> {
  try {
    return await getCollection<T>(collectionName);
  } catch (error) {
    console.error(`Error reading ${collectionName}:`, error);
    return [];
  }
}

/**
 * Write/Update documents in Firestore collection
 * Note: This replaces the entire collection approach - for individual updates, use updateById
 */
export async function writeData<T extends { id: string }>(collectionName: string, data: T[]): Promise<void> {
  try {
    // Get existing documents
    const existing = await getCollection<T>(collectionName);
    const existingIds = new Set(existing.map(doc => doc.id));
    const newIds = new Set(data.map(doc => doc.id));

    // Delete documents that are no longer in the new data
    const toDelete = existing.filter(doc => !newIds.has(doc.id));
    for (const doc of toDelete) {
      await deleteDocument(collectionName, doc.id);
    }

    // Create or update documents
    for (const doc of data) {
      const { id, ...docData } = doc;
      if (existingIds.has(id)) {
        await updateDocument(collectionName, id, docData);
      } else {
        await createDocument(collectionName, { id, ...docData });
      }
    }
  } catch (error) {
    console.error(`Error writing ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Find item by ID from Firestore
 */
export async function findById<T extends { id: string }>(
  collectionName: string, 
  id: string
): Promise<T | null> {
  try {
    return await getDocument<T>(collectionName, id);
  } catch (error) {
    console.error(`Error finding ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Update item by ID in Firestore
 */
export async function updateById<T extends { id: string }>(
  collectionName: string,
  id: string, 
  updates: Partial<T>
): Promise<T | null> {
  try {
    return await updateDocument<T>(collectionName, id, updates);
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Delete item by ID from Firestore
 */
export async function deleteById(
  collectionName: string,
  id: string
): Promise<boolean> {
  try {
    return await deleteDocument(collectionName, id);
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id}:`, error);
    return false;
  }
}

/**
 * Create a new document in Firestore
 */
export async function createById<T extends { id?: string }>(
  collectionName: string,
  data: T
): Promise<T & { id: string }> {
  try {
    return await createDocument<T>(collectionName, data);
  } catch (error) {
    console.error(`Error creating ${collectionName}:`, error);
    throw error;
  }
}
