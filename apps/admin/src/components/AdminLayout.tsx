'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Bike,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Flame,
  Bell,
  Volume2,
  Store,
  ChevronDown,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isLoading, initialize, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isInitialized || (!isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8] transition-opacity duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#005dac] flex items-center justify-center text-white shadow-md animate-pulse">
            <Flame className="w-6 h-6 text-[#ffc107]" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-[#1b1c1c]">BautistaGo</h2>
            <p className="text-[11px] text-[#717783] mt-0.5">Cargando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const navItems = [
    {
      name: 'Tablero Analítico',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'KPIs en Vivo',
    },
    {
      name: 'Repartos Activos',
      href: '/deliveries',
      icon: Bike,
      badge: 'En Ruta',
    },
    {
      name: 'Catálogo & Precios',
      href: '/catalog',
      icon: UtensilsCrossed,
      badge: 'Cazo Activo',
    },
    {
      name: 'Personal & Reparto',
      href: '/staff',
      icon: Users,
      badge: 'RBAC',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#fcf9f8] text-[#1b1c1c] font-sans antialiased">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#f6f3f2] border-r border-[#e5e2e1] fixed inset-y-0 z-50 justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header Profile / Brand */}
          <div className="px-6 pt-6 pb-5 border-b border-[#e5e2e1]/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#005dac] flex items-center justify-center text-white shadow-md shadow-[#005dac]/25 flex-shrink-0">
                <Flame className="w-6 h-6 text-[#ffc107]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-[#1b1c1c]">
                    Bautista<span className="text-[#005dac]">Go</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-[#414752] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Matriz Centro • San Miguel de Allende</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-[#717783] uppercase">
              Operación y Reportes
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-[#005dac] text-white shadow-md shadow-[#005dac]/25 font-bold'
                      : 'text-[#414752] hover:bg-white hover:text-[#1b1c1c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#717783]'}`} />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#e5e2e1] text-[#414752]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout bottom */}
        <div className="p-4 border-t border-[#e5e2e1] bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f6f3f2] mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#d4e3ff] text-[#001c3a] font-bold flex items-center justify-center text-xs flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1b1c1c] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#717783] truncate">{user?.email}</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#005dac] flex-shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#b7131a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* TOP DESKTOP HEADER BAR */}
      <header className="hidden lg:flex fixed top-0 right-0 left-72 h-16 bg-white border-b border-[#e5e2e1] z-40 px-8 items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#717783]">
          <span className="font-bold text-[#1b1c1c]">Panel de Control</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
            Sesión Activa • Administrador
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-[#717783] hover:text-[#005dac] hover:bg-[#f6f3f2] rounded-lg transition-colors cursor-pointer"
            title="Sonido de Comandas Activado"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              className="p-2 text-[#717783] hover:text-[#005dac] hover:bg-[#f6f3f2] rounded-lg transition-colors cursor-pointer relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b7131a] ring-2 ring-white"></span>
            </button>
          </div>

          <div className="h-6 w-px bg-[#e5e2e1]"></div>

          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-lg bg-[#005dac] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Flame className="w-4 h-4 text-[#ffc107]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-[#1b1c1c] leading-tight">
                Bautista<span className="text-[#005dac]">Go</span>
              </span>
              <span className="text-[10px] text-[#717783]">{user?.name || 'Administrador'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER & DRAWER */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-[#e5e2e1] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#005dac] flex items-center justify-center text-white">
            <Flame className="w-5 h-5 text-[#ffc107]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#1b1c1c]">Bautista<span className="text-[#005dac]">Go</span></span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#414752] hover:bg-[#f6f3f2]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full flex flex-col shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e2e1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#005dac] flex items-center justify-center text-white">
                  <Flame className="w-5 h-5 text-[#ffc107]" />
                </div>
                <span className="font-extrabold text-base text-[#1b1c1c]">BautistaGo</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#717783] hover:bg-[#f6f3f2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs ${
                      isActive ? 'bg-[#005dac] text-white font-bold' : 'text-[#414752] hover:bg-[#f6f3f2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#e5e2e1]">
              <div className="text-xs text-[#717783] mb-3">
                Conectado como <strong className="text-[#1b1c1c]">{user?.name}</strong>
              </div>
              <button
                onClick={handleLogout}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-[#b7131a] bg-[#ffdad6]/40 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen pt-14 lg:pt-16">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="animate-fade-in w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
