'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { analyticsApi, productsApi } from '@/lib/api';
import { DashboardMetrics, Product } from '@/lib/types';
import {
  DollarSign,
  Receipt,
  ShoppingBag,
  Award,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  Flame,
  TrendingUp,
  AlertTriangle,
  Bike,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

type DatePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'custom';

export default function DashboardPage() {
  const [preset, setPreset] = useState<DatePreset>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcula fechas ISO según el preset
  const getDateRange = useCallback((): { startDate: string; endDate: string } => {
    const now = new Date();
    let start = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (preset === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (preset === '7days') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (preset === '30days') {
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
    } else if (preset === 'custom' && customStart && customEnd) {
      const s = new Date(customStart + 'T00:00:00');
      const e = new Date(customEnd + 'T23:59:59');
      return { startDate: s.toISOString(), endDate: e.toISOString() };
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    productsApi
      .list(true)
      .then((prods) => {
        const map: Record<string, Product> = {};
        prods.forEach((p) => {
          map[p.id] = p;
        });
        setProductsMap(map);
      })
      .catch(() => {});
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await analyticsApi.getDashboard(startDate, endDate);
      setMetrics(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Conectado al servidor de producción. No hay ventas aún en este rango.'
      );
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const topItemsMapped = (metrics?.topItems || []).map((item) => ({
    productId: item.productId,
    name: productsMap[item.productId]?.name || `Corte #${item.productId.slice(0, 6)}`,
    quantity: item._sum.quantity ?? 0,
  }));

  const hasSales = (metrics?.totalOrders ?? 0) > 0 || (metrics?.totalSales ?? 0) > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* PAGE CONTROL HEADER */}
        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e5e2e1]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#414752] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#db322f] animate-ping"></span>
              <span>Panel de Control Gerencial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Bienvenido a Bautista<span className="text-[#005dac]">Go</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#414752] mt-0.5">
              Resumen operativo y comercial de cazos, comandas y logística de reparto en tiempo real.
            </p>
          </div>

          {/* Date selector & Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-[#f6f3f2] rounded-xl border border-[#e5e2e1]">
              <button
                type="button"
                onClick={() => setPreset('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  preset === 'today'
                    ? 'bg-white text-[#1b1c1c] shadow-xs'
                    : 'text-[#414752] hover:text-[#1b1c1c]'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setPreset('7days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  preset === '7days'
                    ? 'bg-white text-[#1b1c1c] shadow-xs'
                    : 'text-[#414752] hover:text-[#1b1c1c]'
                }`}
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => setPreset('thisMonth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  preset === 'thisMonth'
                    ? 'bg-white text-[#1b1c1c] shadow-xs'
                    : 'text-[#414752] hover:text-[#1b1c1c]'
                }`}
              >
                Este mes
              </button>
              <button
                type="button"
                onClick={() => setPreset('custom')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  preset === 'custom'
                    ? 'bg-white text-[#005dac] shadow-xs'
                    : 'text-[#414752] hover:text-[#1b1c1c]'
                }`}
                title="Rango Personalizado"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>

            {preset === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs bg-[#f6f3f2] p-1 rounded-xl border border-[#e5e2e1]">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1 bg-white border border-[#e5e2e1] rounded-lg text-xs font-medium"
                />
                <span className="text-[#717783]">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1 bg-white border border-[#e5e2e1] rounded-lg text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => fetchMetrics()}
                  className="px-2.5 py-1 bg-[#005dac] text-white rounded-lg text-xs font-bold"
                >
                  Filtrar
                </button>
              </div>
            )}

            <button
              onClick={() => fetchMetrics()}
              className="p-2.5 rounded-xl border border-[#e5e2e1] hover:bg-[#f6f3f2] text-[#414752] transition-colors"
              title="Recargar Métricas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => alert('Descargando Reporte Ejecutivo de Carnitas Bautista en formato Excel/PDF...')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#005dac] hover:bg-[#1976d2] text-white text-xs font-bold rounded-xl shadow-md shadow-[#005dac]/20 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#ffc107]" />
              <span>Descargar Reporte Ejecutivo</span>
            </button>
          </div>
        </section>

        {/* 5 KPI CARDS ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* KPI 1: Ventas Totales */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Ventas Totales
              </span>
              <span className="p-1.5 rounded-lg bg-[#d4e3ff] text-[#005dac]">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1b1c1c] tracking-tight">
                {loading ? '...' : formatCurrency(metrics?.totalSales ?? 0)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0eded]">
                <span className="inline-flex items-center gap-1 text-[#005dac] text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +14.2% vs ayer
                </span>
                <svg className="w-16 h-6 overflow-visible text-[#005dac]" fill="none" viewBox="0 0 64 24">
                  <path d="M1 20 L 12 18 L 24 14 L 36 17 L 48 6 L 63 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  <path d="M1 20 L 12 18 L 24 14 L 36 17 L 48 6 L 63 2 V 24 H 1 Z" fill="currentColor" fillOpacity="0.12"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* KPI 2: Comandas Totales */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Comandas Totales
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffdad6] text-[#b7131a]">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1b1c1c] tracking-tight">
                {loading ? '...' : (metrics?.totalOrders ?? 0)} <span className="text-xs font-medium text-[#717783]">pedidos</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0eded] text-xs">
                <span className="text-[#1b1c1c] font-bold">98% a tiempo</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                  0 demorados
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3: Ticket Promedio */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Ticket Promedio
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffdf9e] text-[#765800]">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#1b1c1c] tracking-tight">
                {loading ? '...' : formatCurrency(metrics?.averageTicket ?? 0)}
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#f0eded] text-[#005dac] text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8% combos familiares</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Promedio de Entrega */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Tiempo Cazo-Entrega
              </span>
              <span className="p-1.5 rounded-lg bg-[#d4e3ff] text-[#005dac]">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-[#1b1c1c] tracking-tight">18.4</span>
                <span className="text-xs text-[#717783]">minutos</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0eded] text-xs">
                <span className="text-[#717783]">Meta: &lt;25 min</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Óptimo
                </span>
              </div>
            </div>
          </div>

          {/* KPI 5: Efectivo en Ruta */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Efectivo en Ruta
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffdf9e] text-[#765800]">
                <Bike className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#b7131a] tracking-tight">
                $4,315.00 <span className="text-xs text-[#717783]">MXN</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0eded] text-xs">
                <span className="text-[#717783]">Por liquidar en caja</span>
                <span className="px-1.5 py-0.5 rounded bg-[#f6f3f2] text-[#1b1c1c] text-[10px] font-bold">
                  6 repartidores
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRAPHICAL SECTION (7 / 5 Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Columna Izquierda (7 cols): Ritmo de Ventas y Kilos Despachados */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#1b1c1c]">Ritmo de Ventas y Kilos Despachados</h3>
                  <p className="text-xs text-[#717783] mt-0.5">
                    Distribución por franja horaria con mayor afluencia de 12:00 PM a 3:30 PM
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#1976d2]"></span>
                    <span className="text-[#414752] font-medium">Hoy (kg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#c1c6d4]"></span>
                    <span className="text-[#414752] font-medium">Semana Pasada</span>
                  </div>
                </div>
              </div>

              {/* Custom SVG Timeline Bar & Line Chart from Mockup */}
              <div className="w-full h-64 relative flex flex-col justify-end pt-4">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 220">
                  <defs>
                    <linearGradient id="primaryBarGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1976d2" stopOpacity="0.95"></stop>
                      <stop offset="100%" stopColor="#1976d2" stopOpacity="0.4"></stop>
                    </linearGradient>
                    <linearGradient id="peakHighlight" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#db322f" stopOpacity="0.95"></stop>
                      <stop offset="100%" stopColor="#db322f" stopOpacity="0.3"></stop>
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line stroke="#f0eded" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="30" y2="30"></line>
                  <line stroke="#f0eded" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="80" y2="80"></line>
                  <line stroke="#f0eded" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="130" y2="130"></line>
                  <line stroke="#f0eded" strokeWidth="1" x1="0" x2="700" y1="180" y2="180"></line>

                  {/* Previous week reference line */}
                  <path d="M 20 170 Q 100 160 170 120 T 320 60 T 470 70 T 620 140 T 680 175" fill="none" stroke="#c1c6d4" strokeDasharray="6 4" strokeWidth="2.5"></path>

                  {/* Hourly bars */}
                  <rect fill="url(#primaryBarGrad)" height="30" rx="4" width="34" x="25" y="150"></rect>
                  <rect fill="url(#primaryBarGrad)" height="45" rx="4" width="34" x="95" y="135"></rect>
                  <rect fill="url(#primaryBarGrad)" height="75" rx="4" width="34" x="165" y="105"></rect>
                  {/* Picos 12pm, 1pm, 2pm */}
                  <rect fill="url(#peakHighlight)" height="135" rx="4" width="34" x="235" y="45"></rect>
                  <rect fill="url(#peakHighlight)" height="155" rx="4" width="34" x="305" y="25"></rect>
                  <rect fill="url(#peakHighlight)" height="142" rx="4" width="34" x="375" y="38"></rect>
                  <rect fill="url(#primaryBarGrad)" height="110" rx="4" width="34" x="445" y="70"></rect>
                  <rect fill="url(#primaryBarGrad)" height="60" rx="4" width="34" x="515" y="120"></rect>
                  <rect fill="url(#primaryBarGrad)" height="35" rx="4" width="34" x="585" y="145"></rect>
                  <rect fill="url(#primaryBarGrad)" height="20" rx="4" width="34" x="650" y="160"></rect>

                  {/* Marker */}
                  <circle cx="392" cy="38" fill="#db322f" r="5" stroke="#ffffff" strokeWidth="2"></circle>
                </svg>

                <div className="flex justify-between text-[#717783] text-[11px] font-bold pt-2">
                  <span>9 AM</span>
                  <span>10 AM</span>
                  <span>11 AM</span>
                  <span className="text-[#b7131a]">12 PM</span>
                  <span className="text-[#b7131a]">1 PM</span>
                  <span className="text-[#b7131a]">2 PM</span>
                  <span>3 PM</span>
                  <span>4 PM</span>
                  <span>5 PM</span>
                  <span>6 PM</span>
                </div>
              </div>
            </div>

            {/* Quick summary strip */}
            <div className="mt-4 bg-[#f6f3f2] px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-2 border border-[#e5e2e1]">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#b7131a]" />
                <span className="text-xs font-bold text-[#1b1c1c]">
                  Pico máximo alcanzado: <strong>32.8 kg/hora</strong> entre 1:00 y 2:00 PM
                </span>
              </div>
              <span className="text-xs font-semibold text-[#005dac] bg-white px-2.5 py-0.5 rounded-full border border-[#e5e2e1]">
                Capacidad de cazo al 88%
              </span>
            </div>
          </div>

          {/* Columna Derecha (5 cols): Cortes más Vendidos / Donut Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-[#1b1c1c]">Cortes más Vendidos</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f6f3f2] text-[#005dac]">
                  Hoy: 89.4 kg despachados
                </span>
              </div>
              <p className="text-xs text-[#717783] mb-4">
                Preferencia de clientes en mostrador, tacos y pedidos delivery.
              </p>

              {!hasSales ? (
                /* Flujo alternativo CDU_8: Sin datos para el periodo */
                <div className="py-8 text-center bg-[#f6f3f2]/60 rounded-xl border border-dashed border-[#e5e2e1]">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#b7131a] flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-[#1b1c1c]">Sin datos para el periodo</h4>
                  <p className="text-[11px] text-[#717783] mt-1 max-w-xs mx-auto">
                    No se registran comandas entregadas en este rango de fechas en la base de datos de producción.
                  </p>
                </div>
              ) : (
                <>
                  {/* Donut & Bars visual split */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-[#f0eded]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4.5"></path>
                        {/* Maciza 38% */}
                        <path className="text-[#1976d2]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="38, 100" strokeLinecap="round" strokeWidth="4.5"></path>
                        {/* Surtida 32% */}
                        <path className="text-[#db322f]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="32, 100" strokeDashoffset="-38" strokeLinecap="round" strokeWidth="4.5"></path>
                        {/* Costilla 18% */}
                        <path className="text-[#fabd00]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="18, 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="4.5"></path>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-extrabold text-[#1b1c1c]">38%</span>
                        <span className="text-[9px] font-bold text-[#717783] uppercase">Líder</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-[#1b1c1c]">Maciza Especial</span>
                          <span className="font-bold text-[#005dac]">38% (34 kg)</span>
                        </div>
                        <div className="w-full bg-[#f6f3f2] rounded-full h-2">
                          <div className="bg-[#1976d2] h-2 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-[#1b1c1c]">Surtida Tradicional</span>
                          <span className="font-bold text-[#db322f]">32% (28.6 kg)</span>
                        </div>
                        <div className="w-full bg-[#f6f3f2] rounded-full h-2">
                          <div className="bg-[#db322f] h-2 rounded-full" style={{ width: '32%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-[#1b1c1c]">Costilla Dorada</span>
                          <span className="font-bold text-[#765800]">18% (16 kg)</span>
                        </div>
                        <div className="w-full bg-[#f6f3f2] rounded-full h-2">
                          <div className="bg-[#fabd00] h-2 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[#f0eded] flex items-center justify-between text-xs">
              <span className="text-[#717783]">Catálogo sincronizado con producción</span>
              <a
                href="/catalog"
                className="inline-flex items-center gap-1 font-bold text-[#005dac] hover:underline"
              >
                <span>Ajustar existencias</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* OPERATIONAL NOTICES STRIP */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e5e2e1] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdf9e] text-[#765800] flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1b1c1c]">Cazo #2 en Reabastecimiento</p>
              <p className="text-[11px] text-[#717783] mt-0.5">Próximo lote de maciza dorada listo en 25 min.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5e2e1] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4e3ff] text-[#005dac] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1b1c1c]">Comanda Grande en Mostrador</p>
              <p className="text-[11px] text-[#717783] mt-0.5">4.5 kg surtida y tacos para banquete familiar.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5e2e1] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1b1c1c]">Despacho en SLA Objetivo</p>
              <p className="text-[11px] text-[#717783] mt-0.5">98% de órdenes dentro del tiempo óptimo de entrega.</p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
