'use client';

import React from 'react';
import { Product, PricingType } from '@/lib/types';
import { Edit2, Trash2, CheckCircle, XCircle, Utensils, Scale, Flame, AlertCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onToggleAvailability,
  onDelete,
}: ProductTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPricingBadge = (type: PricingType) => {
    switch (type) {
      case 'BY_WEIGHT_KG':
        return { label: 'Por Kilo (Fraccionable)', bg: 'bg-[#d4e3ff] text-[#005dac]' };
      case 'BY_WEIGHT_G':
        return { label: 'Por Gramo (Báscula)', bg: 'bg-[#ffdf9e] text-[#765800]' };
      case 'BY_PIECE':
        return { label: 'Por Pieza Individual', bg: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: type, bg: 'bg-[#e5e2e1] text-[#414752]' };
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-[#e5e2e1]">
        <div className="inline-block w-8 h-8 border-3 border-[#005dac]/30 border-t-[#005dac] rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-[#717783] uppercase tracking-wider">
          Sincronizando catálogo con el backend de producción...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-[#e5e2e1]">
        <div className="w-12 h-12 rounded-2xl bg-[#f6f3f2] flex items-center justify-center text-[#717783] mx-auto mb-3">
          <Utensils className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#1b1c1c]">No se encontraron platillos</h4>
        <p className="text-xs text-[#717783] mt-1 max-w-sm mx-auto">
          No hay productos que coincidan con los filtros seleccionados o el catálogo está vacío.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e2e1] shadow-sm overflow-hidden">
      {/* Table Subheader */}
      <div className="px-6 py-3.5 bg-[#f6f3f2] border-b border-[#e5e2e1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#1b1c1c]">Lista Maestra de Carnitas y Alimentos</span>
          <span className="px-2 py-0.5 bg-white rounded text-[#1b1c1c] text-[10px] font-bold border border-[#e5e2e1]">
            Modo Báscula Activa
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#717783] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#db322f] animate-pulse"></span>
          <span>Actualización en tiempo real con App Cliente</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f6f3f2]/60 border-b border-[#e5e2e1] text-[11px] font-bold text-[#717783] uppercase tracking-wider">
              <th className="py-3 px-6">Corte / Ítem</th>
              <th className="py-3 px-4">Pesaje</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4 text-right">Precio Público</th>
              <th className="py-3 px-6 text-center">Disponibilidad en Cazo</th>
              <th className="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0eded] text-xs">
            {products.map((product, idx) => {
              const pricing = getPricingBadge(product.pricingType);
              const isTop = idx < 2;

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-[#fcf9f8] transition-colors ${
                    !product.isAvailable ? 'bg-zinc-50/60 opacity-80' : ''
                  }`}
                >
                  {/* Corte / Ítem */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#f6f3f2] relative border border-[#e5e2e1] flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Utensils className="w-6 h-6 text-[#717783]" />
                        )}
                        {isTop && (
                          <span className="absolute bottom-0 inset-x-0 bg-[#b7131a] text-white text-[9px] font-extrabold text-center uppercase tracking-tighter py-0.5">
                            Top {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#1b1c1c] text-sm truncate">{product.name}</span>
                        <span className="text-[11px] text-[#717783] line-clamp-1 max-w-xs mt-0.5">
                          {product.description || 'Corte tradicional de Carnitas Bautista.'}
                        </span>
                        <span className="text-[10px] text-[#005dac] font-mono mt-0.5">
                          ID: {product.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Pesaje */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${pricing.bg}`}>
                      {pricing.label}
                    </span>
                  </td>

                  {/* Categoría */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f6f3f2] text-[#414752] text-xs font-semibold border border-[#e5e2e1]">
                      {product.category || 'Carnitas'}
                    </span>
                  </td>

                  {/* Precio Público */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-extrabold text-sm text-[#1b1c1c]">
                      {formatCurrency(product.price)}
                    </div>
                    <span className="text-[10px] text-[#717783]">
                      {product.pricingType === 'BY_WEIGHT_KG'
                        ? 'por kilogramo'
                        : product.pricingType === 'BY_WEIGHT_G'
                        ? 'por gramo'
                        : 'por pieza'}
                    </span>
                  </td>

                  {/* Disponibilidad en Cazo (Toggle) */}
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(product)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                        product.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                          : 'bg-[#ffdad6] text-[#b7131a] hover:bg-[#ffdad6]/80 border border-[#ffdad6]'
                      }`}
                      title="Conmutar disponibilidad en tiempo real"
                    >
                      {product.isAvailable ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>En Cazo (Disponible)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-[#b7131a]" />
                          <span>Desabasto (Agotado)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-lg text-[#005dac] hover:bg-[#d4e3ff]/60 transition-colors"
                        title="Editar precio y datos del producto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-2 rounded-lg text-[#b7131a] hover:bg-[#ffdad6]/60 transition-colors"
                        title="Baja lógica del catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
