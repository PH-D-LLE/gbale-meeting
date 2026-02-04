import { AttendanceRecord, AppSettings, AdminUser } from '../types';
import { db } from './firebase';
import { ref, set, get, remove, child } from 'firebase/database';

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

const lsSaveRecord = async (record: AttendanceRecord) => {
    await wait();
    const records = JSON.parse(localStorage.getItem(LS_KEYS.RECORDS) || '[]');
    const index = records.findIndex((r: AttendanceRecord) => r.id === record.id);
    if (index >= 0) {
        records[index] = record;
    } else {
        records.push(record);
    }
    localStorage.setItem(LS_KEYS.RECORDS, JSON.stringify(records));
};

const lsGetRecords = async (): Promise<AttendanceRecord[]> => {
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

export const saveRecord = async (record: AttendanceRecord): Promise<void> => {
  if (db) {
      try {
          const recordRef = ref(db, `${PATH_RECORDS}/${record.id}`);
          await set(recordRef, record);
          return;
      } catch (e) {
          console.warn("RTDB saveRecord failed (using LocalStorage fallback):", e);
      }
  }
  return lsSaveRecord(record);
};

export const getRecords = async (): Promise<AttendanceRecord[]> => {
  if (db) {
      try {
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, PATH_RECORDS));
          if (snapshot.exists()) {
              const data = snapshot.val();
              // Convert object map to array
              return Object.values(data) as AttendanceRecord[];
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
            const settingsRef = ref(db, PATH_SETTINGS);
            await set(settingsRef, settings);
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
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, PATH_SETTINGS));
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
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, PATH_ADMINS));
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
            const adminRef = ref(db, `${PATH_ADMINS}/${docId}`);
            await set(adminRef, data);
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
            const adminRef = ref(db, `${PATH_ADMINS}/${docId}`);
            await remove(adminRef);
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