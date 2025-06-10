
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, Student } from '@/types';

type UserRole = 'librarian' | 'admin' | 'student' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | Student | null;
  userRole: UserRole;
  login: (userData: User | Student, role: UserRole, redirectTo?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | Student | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as UserRole : null;
    
    if (storedUser && storedRole) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setUserRole(storedRole);
      } catch (error) {
        console.error("Failed to parse stored user data", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/'].includes(pathname) && !pathname.startsWith('/_next/')) {
       // Allow access to root and login page even if not authenticated
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const login = (userData: User | Student, role: UserRole, redirectTo: string = '/dashboard') => {
    setCurrentUser(userData);
    setUserRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('userRole', role);
    }
    router.push(redirectTo);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
