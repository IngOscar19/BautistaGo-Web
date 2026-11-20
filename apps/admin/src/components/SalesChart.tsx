'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';

interface TopItemData {
  productId: string;
  name: string;
  quantity: number;
}

interface SalesChartProps {
  items: TopItemData[];
  totalOrders: number;
}

const COLORS = ['#005dac', '#1976d2', '#fabd00', '#db322f', '#765800'];

export function SalesChart({ items, totalOrders }: SalesChartProps) {
  const hasData = totalOrders > 0 && items.length > 0 && items.some((item) => item.quantity > 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e2e1] shadow-sm flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#f0eded]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#d4e3ff] text-[#005dac] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1b1c1c]">Productos Más Vendidos</h3>
          </div>
          <p className="text-xs text-[#717783] mt-0.5">
            Top 5 platillos y cortes con mayor volumen en el periodo seleccionado
          </p>
        </div>

        {hasData && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f6f3f2] text-xs font-semibold text-[#414752]">
            <TrendingUp className="w-3.5 h-3.5 text-[#005dac]" />
            <span>{items.reduce((acc, curr) => acc + curr.quantity, 0)} unidades vendidas</span>
          </span>
        )}
      </div>

      <div className="flex-1 min-h-[300px] flex items-center justify-center pt-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#f6f3f2] flex items-center justify-center text-[#717783] mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-[#1b1c1c]">Sin datos para el periodo</h4>
            <p className="text-xs text-[#717783] mt-1 leading-relaxed">
              No se registraron ventas ni comandas entregadas dentro de las fechas seleccionadas.
              Prueba cambiando el rango de fechas.
            </p>
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items}
                layout="vertical"
                margin={{ top: 10, right: 25, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eded" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e2e1' }}
                  tick={{ fill: '#717783', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e2e1' }}
                  tick={{ fill: '#1b1c1c', fontSize: 12, fontWeight: 500 }}
                  width={130}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 93, 172, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TopItemData;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-[#e5e2e1] text-xs">
                          <p className="font-bold text-[#1b1c1c]">{data.name}</p>
                          <p className="text-[#005dac] font-semibold mt-1">
                            Vendidos: <span className="font-extrabold">{data.quantity}</span> unidades
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={22}>
                  {items.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
