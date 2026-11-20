'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Flame } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (isAuthenticated && user?.role === 'ADMIN') {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#005dac] flex items-center justify-center text-white shadow-lg animate-pulse">
          <Flame className="w-7 h-7 text-[#ffc107]" />
        </div>
        <p className="text-xs font-bold text-[#717783] uppercase tracking-wider">
          Cargando BautistaGo Admin...
        </p>
      </div>
    </div>
  );
}
