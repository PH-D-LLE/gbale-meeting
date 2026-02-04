import { Record, AppSettings, AdminUser } from '../types';
import { db } from './firebase';
import { 
  ref, 
  set, 
  get, 
  child, 
  remove,
  update
} from 'firebase/database';

// Paths
const PATH_RECORDS = 'records';
const PATH_SETTINGS = 'settings/config';
const PATH_ADMINS = 'admins';

// LocalStorage Keys for Fallback
const LS_KEYS = {
    RECORDS: 'ls_records',
    SETTINGS: 'ls_settings',
    ADMINS: 'ls_admins'
};

// Helper to simulate async delay for LocalStorage
const wait = () => new Promise(resolve => setTimeout(resolve, 300));

// ------------------------------------------------------------------
// LocalStorage Helpers (Fallback)
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
// Records (Attendance/Proxy) - RTDB Implementation
// ------------------------------------------------------------------

export const saveRecord = async (record: Record): Promise<void> => {
  if (db) {
      try {
          // RTDB: set at records/{id}
          await set(ref(db, `${PATH_RECORDS}/${record.id}`), record);
          return;
      } catch (e) {
          console.warn("RTDB saveRecord failed (using LocalStorage fallback):", e);
      }
  }
  return lsSaveRecord(record);
};

export const getRecords = async (): Promise<Record[]> => {
  if (db) {
      try {
          const snapshot = await get(child(ref(db), PATH_RECORDS));
          if (snapshot.exists()) {
              const data = snapshot.val();
              // Convert object map to array
              return Object.values(data) as Record[];
          }
          return [];
      } catch (e) {
          console.warn("RTDB getRecords failed (using LocalStorage fallback):", e);
      }
  }
  return lsGetRecords();
};

// ------------------------------------------------------------------
// Settings (CMS) - RTDB Implementation
// ------------------------------------------------------------------

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    if (db) {
        try {
            await set(ref(db, PATH_SETTINGS), settings);
            return;
        } catch (e) {
             console.warn("RTDB saveSettings failed (using LocalStorage fallback):", e);
        }
    }
    return lsSaveSettings(settings);
};

export const getSettings = async (): Promise<AppSettings | null> => {
    if (db) {
        try {
            const snapshot = await get(child(ref(db), PATH_SETTINGS));
            if (snapshot.exists()) {
                return snapshot.val() as AppSettings;
            } else {
                return null;
            }
        } catch (e) {
            console.warn("RTDB getSettings failed (using LocalStorage fallback):", e);
        }
    }
    return lsGetSettings();
};

// ------------------------------------------------------------------
// Admins - RTDB Implementation
// ------------------------------------------------------------------

export const getAdmins = async (): Promise<AdminUser[]> => {
    if (db) {
        try {
            const snapshot = await get(child(ref(db), PATH_ADMINS));
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.keys(data).map(key => ({
                    ...data[key],
                    docId: key
                }));
            }
            return [];
        } catch (e) {
            console.warn("RTDB getAdmins failed (using LocalStorage fallback):", e);
        }
    }
    return lsGetAdmins();
};

export const saveAdmin = async (admin: AdminUser): Promise<void> => {
    if (db) {
        try {
            const docId = admin.docId || crypto.randomUUID();
            const { docId: _, ...data } = admin;
            // RTDB doesn't need to store docId inside the data if key is docId, 
            // but we keep consistent structure
            await set(ref(db, `${PATH_ADMINS}/${docId}`), data);
            return;
        } catch (e) {
             console.warn("RTDB saveAdmin failed (using LocalStorage fallback):", e);
        }
    }
    return lsSaveAdmin(admin);
};

export const deleteAdmin = async (docId: string): Promise<void> => {
    if (db) {
        try {
            await remove(ref(db, `${PATH_ADMINS}/${docId}`));
            return;
        } catch (e) {
             console.warn("RTDB deleteAdmin failed (using LocalStorage fallback):", e);
        }
    }
    return lsDeleteAdmin(docId);
};

export const clearAllData = (): void => {
    console.warn("Clear All Data is not implemented.");
};