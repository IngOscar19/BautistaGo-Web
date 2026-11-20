'use client';

import React from 'react';
import { User, UserRole } from '@/lib/types';
import {
  Shield,
  ChefHat,
  Bike,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Truck,
  Power,
  Star,
  MapPin,
} from 'lucide-react';

interface StaffTableProps {
  staff: User[];
  loading: boolean;
  onToggleStatus: (user: User) => void;
}

export function StaffTable({ staff, loading, onToggleStatus }: StaffTableProps) {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Administrador General',
          icon: Shield,
          color: 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]',
        };
      case 'KITCHEN_OPERATOR':
        return {
          label: 'Cocina & Cazo Caliente',
          icon: ChefHat,
          color: 'bg-[#d4e3ff] text-[#005dac] border-[#d4e3ff]',
        };
      case 'DELIVERY_DRIVER':
        return {
          label: 'Repartidor Oficial Estrella',
          icon: Bike,
          color: 'bg-[#ffdf9e] text-[#765800] border-[#ffdf9e]',
        };
      default:
        return {
          label: role,
          icon: Shield,
          color: 'bg-[#e5e2e1] text-[#414752] border-[#e5e2e1]',
        };
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-[#e5e2e1]">
        <div className="inline-block w-8 h-8 border-3 border-[#005dac]/30 border-t-[#005dac] rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-[#717783] uppercase tracking-wider">
          Cargando nómina y permisos RBAC del backend de producción...
        </p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-2xl border border-[#e5e2e1]">
        <div className="w-12 h-12 rounded-2xl bg-[#f6f3f2] flex items-center justify-center text-[#717783] mx-auto mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#1b1c1c]">No se encontraron colaboradores</h4>
        <p className="text-xs text-[#717783] mt-1 max-w-sm mx-auto">
          No hay empleados registrados con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e2e1] shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 bg-[#f6f3f2] border-b border-[#e5e2e1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#1b1c1c]">Directorio Colaborativo y Turnos Activos</span>
          <span className="px-2 py-0.5 bg-white rounded text-[#1b1c1c] text-[10px] font-bold border border-[#e5e2e1]">
            RBAC Estricto
          </span>
        </div>
        <span className="text-xs text-[#717783] font-medium">
          {staff.length} colaboradores registrados
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f6f3f2]/60 border-b border-[#e5e2e1] text-[11px] font-bold text-[#717783] uppercase tracking-wider">
              <th className="py-3 px-6">Colaborador</th>
              <th className="py-3 px-4">Rol Operativo</th>
              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4">Logística / Vehículo</th>
              <th className="py-3 px-6 text-center">Estado de Turno</th>
              <th className="py-3 px-6 text-right">Acciones RBAC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0eded] text-xs">
            {staff.map((employee) => {
              const roleInfo = getRoleBadge(employee.role);
              const RoleIcon = roleInfo.icon;
              const isActive = employee.isActive !== false && !employee.deletedAt;

              return (
                <tr
                  key={employee.id}
                  className={`hover:bg-[#fcf9f8] transition-colors ${
                    !isActive ? 'bg-zinc-50/60 opacity-75' : ''
                  }`}
                >
                  {/* Colaborador */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005dac] to-[#1976d2] text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1b1c1c] text-sm truncate">{employee.name}</p>
                        <p className="text-[11px] text-[#717783] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#717783]" />
                          <span>{employee.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleInfo.color}`}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{roleInfo.label}</span>
                    </span>
                  </td>

                  {/* Contacto */}
                  <td className="py-4 px-4 font-medium text-[#414752]">
                    {employee.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1b1c1c]">
                        <Phone className="w-3.5 h-3.5 text-[#005dac]" />
                        <span>{employee.phone}</span>
                      </span>
                    ) : (
                      <span className="text-[#717783] italic">Sin teléfono</span>
                    )}
                  </td>

                  {/* Vehículo */}
                  <td className="py-4 px-4 text-[#414752]">
                    {employee.role === 'DELIVERY_DRIVER' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f6f3f2] border border-[#e5e2e1] text-xs font-semibold text-[#1b1c1c]">
                        <Truck className="w-3.5 h-3.5 text-[#765800]" />
                        <span>{employee.vehiclePlate || 'Vespa BTO-44'}</span>
                      </span>
                    ) : (
                      <span className="text-[#717783] text-xs">Planta Matriz</span>
                    )}
                  </td>

                  {/* Estado de Turno */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-[#ffdad6] text-[#b7131a] border border-[#ffdad6]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>Activo / En Turno</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5 text-[#b7131a]" />
                          <span>Desactivado</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Acciones RBAC */}
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(employee)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'text-[#b7131a] hover:bg-[#ffdad6]/60 border border-[#ffdad6]'
                          : 'text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={isActive ? 'Desactivar acceso (baja lógica)' : 'Reactivar acceso al sistema'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Desactivar' : 'Reactivar'}</span>
                    </button>
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
