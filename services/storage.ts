import { Record, AppSettings, AdminUser } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';

// Collection References
const COLLECTION_RECORDS = 'records';
const COLLECTION_SETTINGS = 'settings';
const COLLECTION_ADMINS = 'admins';
const DOC_CONFIG = 'config';

// LocalStorage Keys for Fallback
const LS_KEYS = {
    RECORDS: 'ls_records',
    SETTINGS: 'ls_settings',
    ADMINS: 'ls_admins'
};

// Helper to simulate async delay for LocalStorage
const wait = () => new Promise(resolve => setTimeout(resolve, 300));

// ------------------------------------------------------------------
// LocalStorage Helpers
// ------------------------------------------------------------------

const lsSaveRecord = async (record: Record) => {
    await wait();
    const records = JSON.parse(localStorage.getItem(LS_KEYS.RECORDS) || '[]');
    const index = records.findIndex((r: Record) => r.id === record.id);
    if (index >= 0) {
        records[index] = record;
    } else {
        records.push(record);
    }
    localStorage.setItem(LS_KEYS.RECORDS, JSON.stringify(records));
};

const lsGetRecords = async (): Promise<Record[]> => {
    await wait();
    return JSON.parse(localStorage.getItem(LS_KEYS.RECORDS) || '[]');
};

const lsSaveSettings = async (settings: AppSettings) => {
    await wait();
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
};

const lsGetSettings = async (): Promise<AppSettings | null> => {
    await wait();
    const stored = localStorage.getItem(LS_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : null;
};

const lsGetAdmins = async (): Promise<AdminUser[]> => {
    await wait();
    return JSON.parse(localStorage.getItem(LS_KEYS.ADMINS) || '[]');
};

const lsSaveAdmin = async (admin: AdminUser) => {
    await wait();
    const admins = JSON.parse(localStorage.getItem(LS_KEYS.ADMINS) || '[]');
    if (admin.docId) { 
         const idx = admins.findIndex((a: AdminUser) => a.docId === admin.docId);
         if (idx >= 0) admins[idx] = admin;
    } else {
        admin.docId = crypto.randomUUID();
        admins.push(admin);
    }
    localStorage.setItem(LS_KEYS.ADMINS, JSON.stringify(admins));
};

const lsDeleteAdmin = async (docId: string) => {
    await wait();
    const admins = JSON.parse(localStorage.getItem(LS_KEYS.ADMINS) || '[]');
    const newAdmins = admins.filter((a: AdminUser) => a.docId !== docId);
    localStorage.setItem(LS_KEYS.ADMINS, JSON.stringify(newAdmins));
};

// ------------------------------------------------------------------
// Records (Attendance/Proxy)
// ------------------------------------------------------------------

export const saveRecord = async (record: Record): Promise<void> => {
  if (db) {
      try {
          const recordRef = doc(db, COLLECTION_RECORDS, record.id);
          await setDoc(recordRef, record);
          return;
      } catch (e) {
          console.warn("Firestore saveRecord failed (using LocalStorage fallback):", e);
      }
  }
  return lsSaveRecord(record);
};

export const getRecords = async (): Promise<Record[]> => {
  if (db) {
      try {
          const q = query(collection(db, COLLECTION_RECORDS), orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const records: Record[] = [];
          querySnapshot.forEach((doc) => {
            records.push(doc.data() as Record);
          });
          return records;
      } catch (e) {
          console.warn("Firestore getRecords failed (using LocalStorage fallback):", e);
      }
  }
  return lsGetRecords();
};

// ------------------------------------------------------------------
// Settings (CMS)
// ------------------------------------------------------------------

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    if (db) {
        try {
            await setDoc(doc(db, COLLECTION_SETTINGS, DOC_CONFIG), settings);
            return;
        } catch (e) {
             console.warn("Firestore saveSettings failed (using LocalStorage fallback):", e);
             alert("서버 연결 실패. 로컬 저장소를 사용합니다.");
        }
    }
    return lsSaveSettings(settings);
};

export const getSettings = async (): Promise<AppSettings | null> => {
    if (db) {
        try {
            const docRef = doc(db, COLLECTION_SETTINGS, DOC_CONFIG);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data() as AppSettings;
            } else {
                return null;
            }
        } catch (e) {
            console.warn("Firestore getSettings failed (using LocalStorage fallback):", e);
        }
    }
    return lsGetSettings();
};

// ------------------------------------------------------------------
// Admins
// ------------------------------------------------------------------

export const getAdmins = async (): Promise<AdminUser[]> => {
    if (db) {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_ADMINS));
            const admins: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as AdminUser;
                admins.push({ ...data, docId: doc.id });
            });
            return admins;
        } catch (e) {
            console.warn("Firestore getAdmins failed (using LocalStorage fallback):", e);
        }
    }
    return lsGetAdmins();
};

export const saveAdmin = async (admin: AdminUser): Promise<void> => {
    if (db) {
        try {
            if (admin.docId) {
                const adminRef = doc(db, COLLECTION_ADMINS, admin.docId);
                const { docId, ...data } = admin;
                await setDoc(adminRef, data);
            } else {
                const { docId, ...data } = admin;
                await addDoc(collection(db, COLLECTION_ADMINS), data);
            }
            return;
        } catch (e) {
             console.warn("Firestore saveAdmin failed (using LocalStorage fallback):", e);
        }
    }
    return lsSaveAdmin(admin);
};

export const deleteAdmin = async (docId: string): Promise<void> => {
    if (db) {
        try {
            await deleteDoc(doc(db, COLLECTION_ADMINS, docId));
            return;
        } catch (e) {
             console.warn("Firestore deleteAdmin failed (using LocalStorage fallback):", e);
        }
    }
    return lsDeleteAdmin(docId);
};

export const clearAllData = (): void => {
    console.warn("Clear All Data is not implemented for Firestore for safety.");
};