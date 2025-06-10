'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Skeleton Header */}
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 h-16">
          <div className="container mx-auto flex items-center justify-between px-4 h-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-6 w-24 hidden sm:block" />
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24" />
              ))}
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="md:hidden">
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
     // Effectively a blank page while redirecting, or just return null
     return null;
  }


  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
