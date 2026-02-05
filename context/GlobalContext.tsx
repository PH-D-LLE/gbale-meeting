import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DEFAULT_SETTINGS, AttendanceRecord } from '../types';
import * as Storage from '../services/storage';

interface GlobalContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  records: AttendanceRecord[];
  addRecord: (record: AttendanceRecord) => Promise<void>;
  removeRecords: (ids: string[]) => Promise<void>;
  clearAllRecords: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  tempUser: { name: string; phone: string } | null;
  setTempUser: (user: { name: string; phone: string } | null) => void;
  isLoading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUser, setTempUser] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const initData = async () => {
        setIsLoading(true);
        try {
            // Load Settings
            const savedSettings = await Storage.getSettings();
            if (savedSettings) {
                setSettings(savedSettings);
            }
            // Load Records
            const savedRecords = await Storage.getRecords();
            setRecords(savedRecords);
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setIsLoading(false);
        }
    };
    initData();
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    // Optimistic update
    setSettings(newSettings);
    await Storage.saveSettings(newSettings);
  };

  const addRecord = async (record: AttendanceRecord) => {
    // 1. Optimistic Update
    setRecords(prevRecords => {
      const index = prevRecords.findIndex(r => r.id === record.id);
      if (index >= 0) {
        // Update existing
        const newRecords = [...prevRecords];
        newRecords[index] = record;
        return newRecords;
      } else {
        // Add new
        return [...prevRecords, record];
      }
    });

    // 2. Perform Async DB Save
    try {
        await Storage.saveRecord(record);
    } catch (e) {
        console.error("Failed to save record to DB", e);
    }
  };

  const removeRecords = async (ids: string[]) => {
      // 1. Optimistic Update
      setRecords(prev => prev.filter(r => !ids.includes(r.id)));

      // 2. Async Delete
      try {
          // Delete one by one for now (RTDB simple implementation)
          await Promise.all(ids.map(id => Storage.deleteRecord(id)));
      } catch (e) {
          console.error("Failed to delete records", e);
          refreshRecords(); // Revert on error
      }
  };

  const clearAllRecords = async () => {
      // 1. Optimistic Update
      setRecords([]);

      // 2. Async Delete
      try {
          await Storage.clearRecords();
      } catch (e) {
          console.error("Failed to clear records", e);
          refreshRecords();
      }
  };

  const refreshRecords = async () => {
    setIsLoading(true);
    const updatedRecords = await Storage.getRecords();
    setRecords(updatedRecords);
    setIsLoading(false);
  };

  return (
    <GlobalContext.Provider value={{ 
      settings, 
      updateSettings, 
      records, 
      addRecord, 
      removeRecords,
      clearAllRecords,
      refreshRecords,
      tempUser,
      setTempUser,
      isLoading
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};