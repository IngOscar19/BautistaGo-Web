'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Flame, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isInitialized, initialize, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user?.role === 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Ingresa un correo electrónico con formato válido.');
      return;
    }
    if (!password) {
      setFormError('Por favor ingresa tu contraseña.');
      return;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch {
      // El error ya queda almacenado en useAuthStore.error
    }
  };

  const currentError = formError || error;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcf9f8] px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#005dac] to-[#1976d2] text-white shadow-xl shadow-[#005dac]/25 mb-4">
            <Flame className="w-9 h-9 text-[#ffc107]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1b1c1c]">
            Bautista<span className="text-[#005dac]">Go</span>
          </h1>
          <p className="text-sm font-semibold text-[#b7131a] mt-1 uppercase tracking-wider">
            Carnitas Bautista • Panel Administrador
          </p>
          <p className="text-xs text-[#717783] mt-1">
            Gestión de catálogo, precios, personal y analítica de comandas
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#e5e2e1] p-8">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#f0eded]">
            <div>
              <h2 className="text-xl font-bold text-[#1b1c1c]">Iniciar Sesión</h2>
              <p className="text-xs text-[#717783] mt-0.5">Acceso exclusivo con rol ADMIN</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#d4e3ff] flex items-center justify-center text-[#005dac]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {currentError && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 flex items-start gap-3 text-xs text-[#93000a] animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#ba1a1a]" />
              <div className="flex-1 font-medium leading-relaxed">{currentError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#717783] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bautistago.mx"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm text-[#1b1c1c] placeholder-[#717783] focus:bg-white focus:border-[#005dac] focus:ring-2 focus:ring-[#005dac]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#717783] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm text-[#1b1c1c] placeholder-[#717783] focus:bg-white focus:border-[#005dac] focus:ring-2 focus:ring-[#005dac]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-[#005dac] hover:bg-[#1976d2] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#005dac]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-[#f0eded] text-center">
            <p className="text-[11px] text-[#717783] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
