'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ProductTable } from '@/components/ProductTable';
import { ProductFormModal } from '@/components/ProductFormModal';
import { productsApi } from '@/lib/api';
import { Product, CreateProductInput } from '@/lib/types';
import {
  Utensils,
  Plus,
  Search,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Filter,
  Flame,
  Check,
  AlertTriangle,
  Scale,
  Soup,
  TrendingUp,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Confirm delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.list(true);
      setProducts(data);
    } catch {
      showToast('Error al conectar con el catálogo en producción.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Manejo de guardado (Crear o Editar)
  const handleSaveProduct = async (data: CreateProductInput) => {
    if (productToEdit) {
      const updated = await productsApi.update(productToEdit.id, data);
      setProducts((prev) => prev.map((p) => (p.id === productToEdit.id ? updated : p)));
      showToast(`Platillo "${updated.name}" actualizado en producción.`);
    } else {
      const created = await productsApi.create(data);
      setProducts((prev) => [created, ...prev]);
      showToast(`Platillo "${created.name}" agregado con éxito al catálogo.`);
    }
  };

  // Conmutar disponibilidad en tiempo real
  const handleToggleAvailability = async (product: Product) => {
    const nextState = !product.isAvailable;

    // Actualización optimista
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isAvailable: nextState } : p))
    );

    try {
      await productsApi.toggleAvailability(product.id, nextState);
      showToast(
        nextState
          ? `"${product.name}" marcado como DISPONIBLE en el cazo.`
          : `"${product.name}" marcado como AGOTADO por desabasto.`
      );
    } catch {
      // Revertir si falló
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isAvailable: product.isAvailable } : p))
      );
      showToast('Error al conmutar disponibilidad en producción.');
    }
  };

  // Confirmar eliminación lógica
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await productsApi.delete(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(`Platillo "${productToDelete.name}" retirado del menú (soft delete).`);
      setProductToDelete(null);
    } catch {
      showToast('Error al eliminar el producto en producción.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && p.isAvailable) ||
        (stockFilter === 'OUT_OF_STOCK' && !p.isAvailable);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Contadores
  const totalInStock = products.filter((p) => p.isAvailable).length;
  const totalOutOfStock = products.filter((p) => !p.isAvailable).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1b1c1c] text-white px-4 py-3 rounded-xl shadow-xl border border-[#414752] flex items-center gap-2 text-xs font-semibold animate-slide-up">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER SECTION WITH CAZO LIVE STATUS BANNER */}
        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e5e2e1]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#414752] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#b7131a] font-bold text-[10px]">
                <Flame className="w-3 h-3 text-[#b7131a]" />
                Cazo Activo
              </span>
              <span>• Sucursal Matriz Centro</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Catálogo de Productos y Control de Cazo
            </h1>
            <p className="text-xs sm:text-sm text-[#414752] mt-0.5">
              Administra cortes por kilo, gramajes táctiles para la app de clientes, recetas y existencias en cazo caliente.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => showToast('Existencias sincronizadas con la báscula de cocina.')}
              className="px-4 py-2.5 bg-white hover:bg-[#f6f3f2] border border-[#e5e2e1] text-[#1b1c1c] rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              Ajustar Cazo
            </button>
            <button
              type="button"
              onClick={() => showToast('Modo de actualización masiva habilitado.')}
              className="px-4 py-2.5 bg-white hover:bg-[#f6f3f2] border border-[#e5e2e1] text-[#005dac] rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              Actualización Masiva
            </button>
            <button
              type="button"
              onClick={() => {
                setProductToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b7131a] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(183,19,26,0.25)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Nuevo Platillo / Corte</span>
            </button>
          </div>
        </section>

        {/* OPERATIONAL METRICS & QUICK INVENTORY GAUGE (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Cazo Activo Total */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Cazo Activo Total
              </span>
              <span className="text-2xl font-extrabold text-[#1b1c1c] mt-0.5">
                {products.length} <span className="text-xs font-medium text-[#717783]">cortes en menú</span>
              </span>
              <div className="w-32 bg-[#f0eded] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-[#005dac] h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#d4e3ff] flex items-center justify-center text-[#005dac]">
              <Soup className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Corte Más Demandado */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Corte Más Demandado
              </span>
              <span className="text-base font-extrabold text-[#1b1c1c] mt-0.5 truncate max-w-[150px]">
                Surtida Tradicional
              </span>
              <span className="text-xs text-[#b7131a] font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                46% del volumen hoy
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#b7131a]">
              <Utensils className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Alertas de Bajo Stock */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Alertas de Bajo Stock
              </span>
              <span className="text-2xl font-extrabold text-[#1b1c1c] mt-0.5">
                {totalOutOfStock} <span className="text-xs text-[#b7131a] font-bold">Cortes Agotados</span>
              </span>
              <span className="text-[11px] text-[#717783] mt-1">
                {totalOutOfStock > 0 ? 'Desabasto reportado en cocina' : 'Todo en stock óptimo'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffdf9e] flex items-center justify-center text-[#765800]">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Margen Bruto Promedio */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e5e2e1] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider">
                Margen Bruto Promedio
              </span>
              <span className="text-2xl font-extrabold text-[#1b1c1c] mt-0.5">58.4%</span>
              <span className="text-xs text-[#005dac] font-bold flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Rentabilidad de cazo: Alta
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#f6f3f2] flex items-center justify-center text-[#005dac]">
              <Scale className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* CATEGORY NAV PILLS */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#005dac] text-white'
                : 'bg-white hover:bg-[#f6f3f2] text-[#1b1c1c] border border-[#e5e2e1]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Todos los Platillos</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#f6f3f2] text-[#414752]'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('Carnitas')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap transition-all ${
              selectedCategory === 'Carnitas'
                ? 'bg-[#005dac] text-white'
                : 'bg-white hover:bg-[#f6f3f2] text-[#1b1c1c] border border-[#e5e2e1]'
            }`}
          >
            <Soup className="w-4 h-4" />
            <span>Carnitas por Kilo & Gramos</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Tacos')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap transition-all ${
              selectedCategory === 'Tacos'
                ? 'bg-[#005dac] text-white'
                : 'bg-white hover:bg-[#f6f3f2] text-[#1b1c1c] border border-[#e5e2e1]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Tacos y Gorditas</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Complementos')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap transition-all ${
              selectedCategory === 'Complementos'
                ? 'bg-[#005dac] text-white'
                : 'bg-white hover:bg-[#f6f3f2] text-[#1b1c1c] border border-[#e5e2e1]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Complementos & Salsas</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Bebidas')}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap transition-all ${
              selectedCategory === 'Bebidas'
                ? 'bg-[#005dac] text-white'
                : 'bg-white hover:bg-[#f6f3f2] text-[#1b1c1c] border border-[#e5e2e1]'
            }`}
          >
            <span>Bebidas de Vidrio</span>
          </button>
        </section>

        {/* SEARCH & LIVE FILTERS TOOLBAR */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5e2e1] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-auto flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#717783] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por corte, gramaje, código (ej. 'Maciza', 'Carnitas')..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-xs text-[#1b1c1c] placeholder-[#717783] outline-none focus:bg-white focus:border-[#005dac]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-start md:justify-end">
            <span className="text-[11px] font-bold text-[#717783] uppercase tracking-wider hidden lg:inline-block mr-1">
              Filtrar Estado:
            </span>
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'ALL'
                  ? 'bg-[#005dac] text-white'
                  : 'bg-[#f6f3f2] hover:bg-[#e5e2e1] text-[#414752]'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('IN_STOCK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'IN_STOCK'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#f6f3f2] hover:bg-[#e5e2e1] text-[#414752]'
              }`}
            >
              En Cazo Caliente ({totalInStock})
            </button>
            <button
              onClick={() => setStockFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'OUT_OF_STOCK'
                  ? 'bg-[#b7131a] text-white'
                  : 'bg-[#f6f3f2] hover:bg-[#e5e2e1] text-[#414752]'
              }`}
            >
              Agotados / Desabasto ({totalOutOfStock})
            </button>
          </div>
        </section>

        {/* PRODUCTS TABLE */}
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={(prod) => {
            setProductToEdit(prod);
            setIsModalOpen(true);
          }}
          onToggleAvailability={handleToggleAvailability}
          onDelete={(prod) => setProductToDelete(prod)}
        />

        {/* CREATE / EDIT MODAL */}
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProductToEdit(null);
          }}
          onSubmit={handleSaveProduct}
          productToEdit={productToEdit}
        />

        {/* CONFIRM DELETE MODAL */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#e5e2e1] p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#b7131a] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1b1c1c]">¿Retirar platillo del menú?</h3>
              <p className="text-xs text-[#717783] mt-1 leading-relaxed">
                El platillo <strong className="text-[#1b1c1c]">"{productToDelete.name}"</strong> será
                marcado como eliminado de forma lógica y dejará de mostrarse en la app de clientes.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl border border-[#e5e2e1] text-xs font-bold text-[#414752] hover:bg-[#f6f3f2]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-[#b7131a] hover:bg-[#93000a] text-white text-xs font-bold shadow-md shadow-[#b7131a]/20"
                >
                  {deleteLoading ? 'Retirando...' : 'Sí, Retirar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
