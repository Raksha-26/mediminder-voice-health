import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { demoData } from '@/data/demoData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  language: 'en' | 'hi' | 'kn' | 'ml' | 'ur' | 'tcy' | 'ta' | 'mr' | 'te';
  setLanguage: (lang: 'en' | 'hi' | 'kn' | 'ml' | 'ur' | 'tcy' | 'ta' | 'mr' | 'te') => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'kn' | 'ml' | 'ur' | 'tcy' | 'ta' | 'mr' | 'te'>('en');

  const loginAsRole = (role: UserRole) => {
    const user = demoData.users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      language,
      setLanguage,
      loginAsRole,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};