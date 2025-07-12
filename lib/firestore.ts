import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Types for our data structure
export interface Log {
  id?: string;
  text: string;
  createdAt: any; // Firestore timestamp
  photos: string[]; // Array of photo URLs
  summary?: string;
}

export interface Site {
  id?: string;
  name: string;
  description?: string;
  createdAt: any;
  userId: string;
}

// Logs collection reference helper
const getLogsCollection = (siteId: string) => {
  return collection(db, 'sites', siteId, 'logs');
};

// Sites collection reference
const sitesCollection = collection(db, 'sites');

// Log operations
export const addLog = async (siteId: string, logData: Omit<Log, 'id' | 'createdAt'>) => {
  try {
    const logsRef = getLogsCollection(siteId);
    const logWithTimestamp = {
      ...logData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(logsRef, logWithTimestamp);
    return { id: docRef.id, ...logWithTimestamp };
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

export const getLogs = async (siteId: string): Promise<Log[]> => {
  try {
    const logsRef = getLogsCollection(siteId);
    const q = query(logsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Log[];
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
};

// Site operations
export const addSite = async (siteData: Omit<Site, 'id' | 'createdAt'>) => {
  try {
    const siteWithTimestamp = {
      ...siteData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(sitesCollection, siteWithTimestamp);
    return { id: docRef.id, ...siteWithTimestamp };
  } catch (error) {
    console.error('Error adding site:', error);
    throw error;
  }
};

export const getSites = async (userId: string): Promise<Site[]> => {
  try {
    const q = query(sitesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Site[];
  } catch (error) {
    console.error('Error getting sites:', error);
    throw error;
  }
}; 