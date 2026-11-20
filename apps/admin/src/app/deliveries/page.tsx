'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ordersApi, staffApi } from '@/lib/api';
import { Order, OrderStatus, User } from '@/lib/types';
import {
  Bike,
  Package,
  Clock,
  MapPin,
  User as UserIcon,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Phone,
  ChefHat,
  Check,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');

  // Modal para asignar repartidor
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Modal para detalle de pedido
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        ordersApi.list({ limit: 100 }),
        staffApi.listEmployees('DELIVERY_DRIVER'),
      ]);
      setOrders(ordersRes.items || []);
      setDrivers(driversRes || []);
    } catch {
      showToast('Error al sincronizar pedidos y repartos con el backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Avanzar estado de pedido (Listo -> En Ruta -> Entregado)
  const handleAdvanceStatus = async (order: Order) => {
    try {
      const updated = await ordersApi.advanceStatus(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      if (selectedOrderDetails?.id === order.id) {
        setSelectedOrderDetails(updated);
      }
      showToast(`Pedido #${order.orderNumber} actualizado a ${updated.status}.`);
    } catch {
      showToast('No fue posible avanzar el estado de la comanda.');
    }
  };

  // Asignar repartidor
  const handleAssignDriver = async () => {
    if (!selectedOrderForDriver || !selectedDriverId) return;
    setAssigning(true);
    try {
      const updated = await ordersApi.assignDriver(selectedOrderForDriver.id, selectedDriverId);
      setOrders((prev) => prev.map((o) => (o.id === selectedOrderForDriver.id ? updated : o)));
      if (selectedOrderDetails?.id === selectedOrderForDriver.id) {
        setSelectedOrderDetails(updated);
      }
      const driverObj = drivers.find((d) => d.id === selectedDriverId);
      showToast(`Repartidor ${driverObj?.name || ''} asignado a comanda #${selectedOrderForDriver.orderNumber}.`);
      setSelectedOrderForDriver(null);
      setSelectedDriverId('');
    } catch {
      showToast('Error al asignar el repartidor en el backend.');
    } finally {
      setAssigning(false);
    }
  };

  // Filtrado reactivo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        (order.customer?.name || '').toLowerCase().includes(term) ||
        (order.deliveryAddress || '').toLowerCase().includes(term) ||
        (order.driver?.name || '').toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Contadores y KPIs operativos reales
  const inRouteOrders = useMemo(() => orders.filter((o) => o.status === 'OUT_FOR_DELIVERY'), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'READY_FOR_PICKUP'), [orders]);
  const inKitchenOrders = useMemo(
    () => orders.filter((o) => o.status === 'PENDING_KITCHEN' || o.status === 'IN_PREPARATION'),
    [orders]
  );
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === 'DELIVERED'), [orders]);

  const totalTransitCash = inRouteOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeDriversCount = new Set(inRouteOrders.map((o) => o.driverId).filter(Boolean)).size;
  const totalDriversCount = drivers.filter((d) => d.isActive !== false).length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_KITCHEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            En Cazo / Espera
          </span>
        );
      case 'IN_PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
            <ChefHat className="w-3.5 h-3.5 text-amber-700" />
            Pesaje y Picado
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Listo para Entrega
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En Ruta Activa
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Entregado
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getElapsedTime = (createdAt: string) => {
    try {
      const diffMs = Date.now() - new Date(createdAt).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      if (mins < 60) return `${mins} min`;
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    } catch {
      return '1 min';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1c] text-white px-4 py-3 rounded-xl shadow-xl border border-[#414752] flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER / TITULO & ACCIONES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#005dac]/10 text-[#005dac] font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#005dac] animate-ping"></span>
                Telemetría Logística en Vivo
              </span>
              <span className="text-xs text-[#717783]">• San Miguel de Allende</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Repartos Activos & Pedidos
            </h1>
            <p className="text-xs sm:text-sm text-[#717783] mt-0.5">
              Supervisión de comandas en tránsito, despacho de motocicletas y entregas a domicilio
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#e5e2e1] text-[#414752] hover:text-[#005dac] hover:border-[#005dac]/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#005dac]' : ''}`} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* 4 CARDS DE OPERACIÓN EN VIVO (CONECTADAS AL BACKEND) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: En Ruta Activa */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                En Ruta Activa
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffdf9e] text-[#765800]">
                <Bike className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1b1c1c]">{inRouteOrders.length}</span>
                <span className="text-xs text-[#717783]">
                  {activeDriversCount} de {totalDriversCount || drivers.length} repartidores
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#f0eded] text-xs text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{inRouteOrders.length > 0 ? 'Telemetría en tiempo real' : 'Sin pedidos en calle'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Efectivo en Calle */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Efectivo en Calle
              </span>
              <span className="p-1.5 rounded-lg bg-[#d4e3ff] text-[#005dac]">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#1b1c1c]">
                ${totalTransitCash.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-medium text-[#717783] ml-1">MXN</span>
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#f0eded] text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{totalTransitCash > 0 ? 'Monto circulante en ruta' : 'Sin cortes pendientes en calle'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Listos para Despacho */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Listos en Cazo
              </span>
              <span className="p-1.5 rounded-lg bg-[#d4e3ff] text-[#005dac]">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#1b1c1c]">{readyOrders.length}</div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f0eded] text-xs">
                <span className="font-bold text-[#005dac]">{readyOrders.length} por entregar</span>
                <span className="text-[#717783]">•</span>
                <span className="font-bold text-[#765800]">{inKitchenOrders.length} en preparación</span>
              </div>
            </div>
          </div>

          {/* Card 4: Entregados Hoy */}
          <div className="bg-[#005dac] text-white p-5 rounded-2xl shadow-md shadow-[#005dac]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                Entregas Completadas
              </span>
              <CheckCircle2 className="w-5 h-5 text-[#ffc107]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold tracking-tight">{deliveredOrders.length}</div>
              <p className="text-xs text-white/80 mt-0.5">Comandas finalizadas con éxito</p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#ffc107] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${orders.length > 0 ? Math.min(100, Math.round((deliveredOrders.length / orders.length) * 100)) : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </section>

        {/* FILTROS POR ESTADO & BUSCADOR */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-[#f6f3f2] p-1 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#005dac] shadow-xs'
                  : 'text-[#414752] hover:text-[#1b1c1c]'
              }`}
            >
              <span>Todos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#e5e2e1] text-[10px] text-[#414752]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('OUT_FOR_DELIVERY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'OUT_FOR_DELIVERY'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-[#414752] hover:text-[#1b1c1c]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>En Ruta</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[10px] text-emerald-800">
                {inRouteOrders.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('READY_FOR_PICKUP')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'READY_FOR_PICKUP'
                  ? 'bg-white text-[#005dac] shadow-xs'
                  : 'text-[#414752] hover:text-[#1b1c1c]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#005dac]" />
              <span>Listos para Salir</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[10px] text-blue-800">
                {readyOrders.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('IN_PREPARATION')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'IN_PREPARATION'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-[#414752] hover:text-[#1b1c1c]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>En Cazo</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-[10px] text-amber-800">
                {inKitchenOrders.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('DELIVERED')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'DELIVERED'
                  ? 'bg-white text-gray-800 shadow-xs'
                  : 'text-[#414752] hover:text-[#1b1c1c]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Entregados</span>
              <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-[10px] text-gray-700">
                {deliveredOrders.length}
              </span>
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar folio, cliente, dirección..."
              className="w-full pl-9 pr-4 py-2 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-xs text-[#1b1c1c] placeholder-[#717783] focus:bg-white focus:border-[#005dac] outline-none transition-all"
            />
          </div>
        </section>

        {/* LISTADO DE COMANDAS & REPARTOS */}
        <section className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#e5e2e1] p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#005dac] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#717783] uppercase tracking-wider">
                Sincronizando comandas de entrega con el servidor...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e5e2e1] p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f6f3f2] flex items-center justify-center text-[#717783] mx-auto mb-3">
                <Bike className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#1b1c1c]">No hay pedidos en este estado</h3>
              <p className="text-xs text-[#717783] mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'No se encontraron resultados para el término ingresado.'
                  : 'Actualmente no hay comandas registradas en esta etapa logística.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const assignedDriver = drivers.find((d) => d.id === order.driverId) || order.driver;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    order.status === 'OUT_FOR_DELIVERY'
                      ? 'border-l-4 border-l-emerald-600 border-[#e5e2e1]'
                      : order.status === 'READY_FOR_PICKUP'
                      ? 'border-l-4 border-l-[#005dac] border-[#e5e2e1]'
                      : 'border-[#e5e2e1]'
                  }`}
                >
                  {/* COLUMNA 1: Folio, icono de vehículo y tiempo */}
                  <div className="flex items-start gap-3 min-w-[200px]">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                        order.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'READY_FOR_PICKUP'
                          ? 'bg-blue-100 text-[#005dac]'
                          : 'bg-[#f6f3f2] text-[#414752]'
                      }`}
                    >
                      <Bike className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#005dac] tracking-tight">
                          #{order.orderNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f6f3f2] text-[#414752] text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-[#717783]" />
                          {getElapsedTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>
                  </div>

                  {/* COLUMNA 2: Cliente, dirección y productos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1b1c1c]">
                      <UserIcon className="w-3.5 h-3.5 text-[#717783]" />
                      <span className="truncate">{order.customer?.name || 'Cliente Mostrador / Teléfono'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#717783] mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress || 'Dirección de entrega en San Miguel de Allende'}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded bg-[#f6f3f2] text-[10px] font-medium text-[#414752]"
                          >
                            {item.quantity}x {item.product?.name || 'Carnitas'}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[10px] text-[#717783] font-semibold">
                            +{order.items.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* COLUMNA 3: Importe Total */}
                  <div className="flex flex-col lg:text-right min-w-[120px]">
                    <span className="text-base font-extrabold text-[#1b1c1c]">
                      ${Number(order.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 self-start lg:self-end">
                      Efectivo en Entrega
                    </span>
                  </div>

                  {/* COLUMNA 4: Repartidor Asignado & Acciones */}
                  <div className="flex items-center gap-2.5 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#f0eded]">
                    {assignedDriver ? (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#f6f3f2] text-xs">
                        <div className="w-7 h-7 rounded-full bg-[#d4e3ff] text-[#001c3a] font-bold text-xs flex items-center justify-center">
                          {assignedDriver.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-[11px] text-[#1b1c1c] leading-tight truncate max-w-[100px]">
                            {assignedDriver.name}
                          </p>
                          <p className="text-[9px] text-[#717783] font-mono leading-none">
                            {assignedDriver.vehiclePlate || 'Placas S/D'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrderForDriver(order);
                          setSelectedDriverId('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#005dac]/10 text-[#005dac] hover:bg-[#005dac] hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        + Asignar Repartidor
                      </button>
                    )}

                    {/* Botones de acción rápida */}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Despachar pedido a calle"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Despachar</span>
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#005dac] hover:bg-[#1976d2] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Marcar como entregado al cliente"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Entregado</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="p-2 rounded-xl text-[#717783] hover:text-[#005dac] hover:bg-[#f6f3f2] transition-colors cursor-pointer"
                      title="Ver Detalle Completo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* MODAL DE ASIGNACIÓN DE REPARTIDOR */}
        {selectedOrderForDriver && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#e5e2e1] animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0eded]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#d4e3ff] text-[#005dac] flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1b1c1c]">Asignar Repartidor</h3>
                    <p className="text-[11px] text-[#717783]">
                      Comanda #{selectedOrderForDriver.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderForDriver(null)}
                  className="p-1.5 rounded-lg text-[#717783] hover:bg-[#f6f3f2] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-[#414752]">
                  Selecciona el repartidor en turno disponible para entregar en{' '}
                  <strong className="text-[#1b1c1c]">
                    {selectedOrderForDriver.deliveryAddress || 'San Miguel de Allende'}
                  </strong>
                  :
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {drivers.length === 0 ? (
                    <p className="text-xs text-[#717783] text-center py-4">
                      No hay repartidores registrados en nómina con rol DELIVERY_DRIVER.
                    </p>
                  ) : (
                    drivers.map((driver) => {
                      const isSelected = selectedDriverId === driver.id;
                      return (
                        <div
                          key={driver.id}
                          onClick={() => setSelectedDriverId(driver.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#005dac] bg-[#d4e3ff]/30 font-bold'
                              : 'border-[#e5e2e1] hover:bg-[#f6f3f2]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#005dac] text-white flex items-center justify-center text-xs font-bold">
                              {driver.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs text-[#1b1c1c]">{driver.name}</p>
                              <p className="text-[10px] text-[#717783] font-mono">
                                Placas: {driver.vehiclePlate || 'S/D'} • Tel: {driver.phone || 'S/D'}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#005dac]" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0eded] flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedOrderForDriver(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#414752] hover:bg-[#f6f3f2] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || assigning}
                  className="px-4 py-2 rounded-xl bg-[#005dac] text-white text-xs font-bold shadow-md hover:bg-[#1976d2] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {assigning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Asignando...</span>
                    </>
                  ) : (
                    <span>Confirmar Asignación</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE DETALLE DE PEDIDO */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#e5e2e1] animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0eded]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-[#005dac]">
                      Comanda #{selectedOrderDetails.orderNumber}
                    </span>
                    {getStatusBadge(selectedOrderDetails.status)}
                  </div>
                  <p className="text-[11px] text-[#717783] mt-0.5">
                    Registrado hace {getElapsedTime(selectedOrderDetails.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1.5 rounded-lg text-[#717783] hover:bg-[#f6f3f2] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1.5">
                    Cliente & Destino
                  </h4>
                  <div className="p-3 bg-[#f6f3f2] rounded-xl text-xs space-y-1">
                    <p className="font-bold text-[#1b1c1c]">
                      {selectedOrderDetails.customer?.name || 'Cliente Mostrador'}
                    </p>
                    <p className="text-[#414752] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      {selectedOrderDetails.deliveryAddress || 'Entrega en local'}
                    </p>
                    {selectedOrderDetails.customer?.phone && (
                      <p className="text-[#717783] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {selectedOrderDetails.customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#717783] uppercase tracking-wider mb-1.5">
                    Desglose del Cazo
                  </h4>
                  <div className="border border-[#e5e2e1] rounded-xl divide-y divide-[#f0eded]">
                    {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                      selectedOrderDetails.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#1b1c1c]">
                              {item.quantity}x {item.product?.name || 'Carnitas'}
                            </span>
                            {item.notes && (
                              <p className="text-[10px] text-[#717783] italic">"{item.notes}"</p>
                            )}
                          </div>
                          <span className="font-bold text-[#1b1c1c]">
                            ${Number(item.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-xs text-[#717783]">Sin partidas registradas</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0eded]">
                  <span className="text-xs font-bold text-[#717783]">Total a Cobrar:</span>
                  <span className="text-lg font-extrabold text-[#005dac]">
                    ${Number(selectedOrderDetails.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0eded] flex justify-end">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 bg-[#f6f3f2] hover:bg-[#e5e2e1] text-[#1b1c1c] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
