"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Move these to a separate config file if you want to use them elsewhere
export const publicRoutes = ['/', '/plans', '/pricing', '/login', '/register', '/model-glossary', '/privacy-policy', '/terms-of-service'];
export const privateRoutes = ['/chat', '/image', '/video', '/audio', '/text', '/changelog'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(true);

  return (
    <AuthContext.Provider value={{ 
      isSubscribed, 
      setIsSubscribed,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}