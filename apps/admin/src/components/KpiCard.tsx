import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  currency?: string;
  colorScheme?: 'primary' | 'secondary' | 'tertiary' | 'emerald';
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  currency,
  colorScheme = 'primary',
}: KpiCardProps) {
  const colorStyles = {
    primary: {
      bg: 'bg-[#d4e3ff]',
      text: 'text-[#005dac]',
      border: 'hover:border-[#005dac]/40',
    },
    secondary: {
      bg: 'bg-[#ffdad6]',
      text: 'text-[#b7131a]',
      border: 'hover:border-[#b7131a]/40',
    },
    tertiary: {
      bg: 'bg-[#ffdf9e]',
      text: 'text-[#765800]',
      border: 'hover:border-[#765800]/40',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'hover:border-emerald-500/40',
    },
  }[colorScheme];

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-[#e5e2e1] shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${colorStyles.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#717783] uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${colorStyles.bg} ${colorStyles.text} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1b1c1c]">
            {value}
          </span>
          {currency && (
            <span className="text-xs font-bold text-[#717783] uppercase">{currency}</span>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0eded] text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-[#b7131a]'
                }`}
              >
                {trendPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[#717783] font-medium">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
