'use client';

import React, { useState, useEffect } from 'react';
import { CreateEmployeeInput, UserRole } from '@/lib/types';
import { X, AlertCircle, UserPlus, Lock, Mail, User, Phone, Truck, Check } from 'lucide-react';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
}

export function StaffFormModal({ isOpen, onClose, onSubmit }: StaffFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'KITCHEN_OPERATOR' | 'DELIVERY_DRIVER' | 'ADMIN'>('KITCHEN_OPERATOR');
  const [phone, setPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('KITCHEN_OPERATOR');
      setPhone('');
      setVehiclePlate('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'El nombre completo debe tener al menos 2 caracteres.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico corporativo válido.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'La contraseña temporal debe tener al menos 6 caracteres.';
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
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        vehiclePlate: role === 'DELIVERY_DRIVER' ? vehiclePlate.trim() || undefined : undefined,
      });
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error al registrar al empleado.';
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e5e2e1] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#f0eded]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4e3ff] text-[#005dac] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1b1c1c]">Registrar Nuevo Empleado</h3>
              <p className="text-xs text-[#717783]">
                Asigna credenciales y rol de acceso operativo (RBAC)
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
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Carlos Ramírez Gómez"
                className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all ${
                  errors.name ? 'border-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos.cocina@bautistago.mx"
                className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all ${
                  errors.email ? 'border-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                Contraseña Temporal *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 carácteres"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border rounded-xl text-sm outline-none transition-all ${
                    errors.password ? 'border-[#ba1a1a]' : 'border-[#e5e2e1] focus:bg-white focus:border-[#005dac]'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                Rol Operativo (RBAC) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm outline-none focus:bg-white focus:border-[#005dac]"
              >
                <option value="KITCHEN_OPERATOR">Cocina (KITCHEN_OPERATOR)</option>
                <option value="DELIVERY_DRIVER">Repartidor (DELIVERY_DRIVER)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                Teléfono de Contacto (Opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="415 123 4567"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm outline-none focus:bg-white focus:border-[#005dac]"
                />
              </div>
            </div>

            {role === 'DELIVERY_DRIVER' && (
              <div>
                <label className="block text-xs font-bold text-[#414752] uppercase tracking-wider mb-1">
                  Placa de Vehículo / Scooter
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-[#717783] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="GTO-123-A"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl text-sm outline-none focus:bg-white focus:border-[#005dac]"
                  />
                </div>
              </div>
            )}
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005dac] hover:bg-[#1976d2] text-white text-xs font-bold shadow-md shadow-[#005dac]/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crear Empleado</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
