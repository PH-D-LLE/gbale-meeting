import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DEFAULT_SETTINGS, Record } from '../types';
import * as Storage from '../services/storage';

interface GlobalContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  records: Record[];
  addRecord: (record: Record) => Promise<void>;
  refreshRecords: () => Promise<void>;
  tempUser: { name: string; phone: string } | null;
  setTempUser: (user: { name: string; phone: string } | null) => void;
  isLoading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<Record[]>([]);
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

  const addRecord = async (record: Record) => {
    await Storage.saveRecord(record);
    // Reload records to ensure sync
    const updatedRecords = await Storage.getRecords();
    setRecords(updatedRecords);
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