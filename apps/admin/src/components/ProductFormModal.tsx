'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, CreateProductInput, PricingType } from '@/lib/types';
import { optimizeImage, formatFileSize, OptimizedImageResult } from '@/lib/image-optimizer';
import {
  X,
  AlertCircle,
  Utensils,
  DollarSign,
  Image as ImageIcon,
  Check,
  UploadCloud,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  productToEdit?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [pricingType, setPricingType] = useState<PricingType>('BY_WEIGHT_KG');
  const [category, setCategory] = useState('Carnitas');
  const [imageUrl, setImageUrl] = useState('');
  
  // Image Upload States
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<OptimizedImageResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      setPricingType(productToEdit.pricingType);
      setCategory(productToEdit.category || 'Carnitas');
      setImageUrl(productToEdit.imageUrl || '');
      setOptimizedResult(null);
      setUploadMode(productToEdit.imageUrl?.startsWith('http') && !productToEdit.imageUrl.includes('/uploads/') ? 'url' : 'device');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setPricingType('BY_WEIGHT_KG');
      setCategory('Carnitas');
      setImageUrl('');
      setOptimizedResult(null);
      setUploadMode('device');
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Manejo de archivo seleccionado (desde input o drag & drop)
  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Selecciona un archivo de imagen válido (JPG, PNG, WebP).' }));
      return;
    }

    setIsOptimizing(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.imageUrl;
      return next;
    });

    try {
      // 1. Optimización inteligente en el cliente (WebP, max 900px, 82% quality)
      const result = await optimizeImage(file, 900, 900, 0.82);
      setOptimizedResult(result);

      // 2. Subir archivo al endpoint de almacenamiento estático
      try {
        const formData = new FormData();
        formData.append('file', result.file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setImageUrl(data.url);
            return;
          }
        }
      } catch {
        // Si el upload fallara por red o entorno aislado, usamos como fallback
        // el dataUrl WebP ultraligero que pesa menos de 40KB
      }

      // Fallback seguro: WebP optimizado de alta compresión
      setImageUrl(result.dataUrl);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: err.message || 'No fue posible optimizar la imagen seleccionada.',
      }));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setOptimizedResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!description.trim() || description.trim().length < 5) {
      newErrors.description = 'La descripción debe tener al menos 5 caracteres.';
    }
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'El precio debe ser un número positivo mayor a 0.';
    }
    if (imageUrl.trim() && !/^https?:\/\/.+/.test(imageUrl.trim()) && !imageUrl.startsWith('data:image/')) {
      newErrors.imageUrl = 'La URL o archivo de imagen no tiene un formato válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        pricingType,
        category: category.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar el producto.';
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e5e2e1] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#f0eded]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4e3ff] text-[#005dac] flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1b1c1c]">
                {productToEdit ? 'Editar Platillo / Precio' : 'Nuevo Platillo para el Catálogo'}
              </h3>
              <p className="text-xs text-[#717783]">
                Control de cazo sincronizado en tiempo real con la App Cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717783] hover:bg-[#f6f3f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 flex items-center gap-2 text-xs text-[#93000a]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#ba1a1a]" />
              <span>{errors.form}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
              Nombre del Platillo / Corte *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Carnitas Surtidas, Chamorro al Cazo"
              className={`w-full px-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all ${
                errors.name ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
              Descripción y Detalle *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Carnitas tradicionales estilo Michoacán doradas en manteca propia."
              className={`w-full px-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all resize-none ${
                errors.description ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
              }`}
            />
            {errors.description && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                Precio ($MXN) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="280.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all font-bold ${
                    errors.price ? 'border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
                  }`}
                />
              </div>
              {errors.price && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                Tipo de Pesaje / Unidad *
              </label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as PricingType)}
                className="w-full px-3.5 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm outline-none focus:bg-white focus:border-[#005dac]"
              >
                <option value="BY_WEIGHT_KG">Por Kilo (Kg)</option>
                <option value="BY_WEIGHT_G">Por Gramos (g)</option>
                <option value="BY_PIECE">Por Pieza (Pza)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm outline-none focus:bg-white focus:border-[#005dac]"
            >
              <option value="Carnitas">Carnitas</option>
              <option value="Tacos">Tacos</option>
              <option value="Cortes Especiales">Cortes Especiales</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Complementos">Complementos</option>
              <option value="Postres">Postres</option>
            </select>
          </div>

          {/* SECCIÓN DE FOTOGRAFÍA / SUBIDA DE IMAGEN */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider">
                Fotografía del Platillo (Opcional)
              </label>
              <div className="flex items-center gap-1 bg-[#f6f3f2] p-0.5 rounded-lg border border-[#e5e2e1]">
                <button
                  type="button"
                  onClick={() => setUploadMode('device')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    uploadMode === 'device'
                      ? 'bg-white text-[#005dac] shadow-xs'
                      : 'text-[#717783] hover:text-[#1b1c1c]'
                  }`}
                >
                  Subir desde Dispositivo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    uploadMode === 'url'
                      ? 'bg-white text-[#005dac] shadow-xs'
                      : 'text-[#717783] hover:text-[#1b1c1c]'
                  }`}
                >
                  Enlace URL
                </button>
              </div>
            </div>

            {uploadMode === 'device' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  className="hidden"
                />

                {!imageUrl ? (
                  /* DROPZONE */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-[#005dac] bg-[#d4e3ff]/20 scale-[0.99]'
                        : 'border-[#e5e2e1] hover:border-[#005dac]/50 bg-[#fcf9f8]'
                    }`}
                  >
                    {isOptimizing ? (
                      <div className="flex flex-col items-center py-2">
                        <div className="w-8 h-8 border-3 border-[#005dac]/30 border-t-[#005dac] rounded-full animate-spin mb-2"></div>
                        <p className="text-xs font-bold text-[#1b1c1c]">Optimizando imagen...</p>
                        <p className="text-[11px] text-[#717783]">Reduciendo peso a WebP de alta definición</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-[#d4e3ff] text-[#005dac] flex items-center justify-center mb-2 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-[#1b1c1c]">
                          Haz clic para explorar o arrastra la foto de tu platillo
                        </p>
                        <p className="text-[11px] text-[#717783] mt-1">
                          PNG, JPG o WebP • Se optimizará automáticamente a WebP Retina sin perder calidad
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* PREVIEW Y METRICAS DE COMPRESIÓN */
                  <div className="p-3.5 rounded-2xl bg-[#f6f3f2] border border-[#e5e2e1] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#e5e2e1] flex-shrink-0 relative">
                        <img
                          src={imageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1b1c1c] truncate">Foto cargada</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                            WebP HD
                          </span>
                        </div>
                        {optimizedResult ? (
                          <div className="text-[11px] text-[#414752] mt-0.5 space-y-0.5">
                            <p className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span className="text-[#717783]">
                                {formatFileSize(optimizedResult.originalSize)}
                              </span>
                              <span>➔</span>
                              <strong className="text-emerald-700">
                                {formatFileSize(optimizedResult.optimizedSize)}
                              </strong>
                              <span className="font-bold text-emerald-700">
                                (-{optimizedResult.savingsPercent}%)
                              </span>
                            </p>
                            <p className="text-[10px] text-[#717783]">
                              Resolución: {optimizedResult.width}×{optimizedResult.height} px
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#717783] mt-0.5 truncate max-w-xs">
                            {imageUrl.startsWith('data:') ? 'Imagen optimizada en memoria' : imageUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-[#005dac] hover:bg-white rounded-lg transition-colors"
                        title="Cambiar fotografía"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-[#b7131a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"
                        title="Eliminar fotografía"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MODO URL EXTERNA */
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/carnitas-michoacanas.jpg"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all ${
                      errors.imageUrl ? 'border-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
                    }`}
                  />
                </div>
                {imageUrl && (
                  <div className="flex items-center gap-2 p-2 bg-[#f6f3f2] rounded-xl border border-[#e5e2e1]">
                    <img
                      src={imageUrl}
                      alt="Vista previa URL"
                      className="w-8 h-8 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] text-[#717783] truncate">{imageUrl}</span>
                  </div>
                )}
              </div>
            )}

            {errors.imageUrl && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.imageUrl}</p>}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0eded]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#e5e2e1] text-xs font-bold text-[#414752] hover:bg-[#f6f3f2] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isOptimizing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005dac] hover:bg-[#1976d2] text-white text-xs font-bold shadow-md shadow-[#005dac]/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'Actualizar Platillo' : 'Crear Platillo'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
