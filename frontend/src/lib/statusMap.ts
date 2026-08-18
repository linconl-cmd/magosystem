import type { StatusBateria } from '@shared/types';

export const STATUS_MAP: Record<StatusBateria, { label: string; color: string; bg: string; ring: string; glow: string; dot: string }> = {
  normal:    { label: 'Normal',     color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30', glow: 'shadow-emerald-500/20', dot: 'bg-emerald-400' },
  alerta:    { label: 'Alerta',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/30',   glow: 'shadow-amber-500/20',   dot: 'bg-amber-400' },
  critico:   { label: 'Crítico',   color: 'text-red-400',     bg: 'bg-red-500/10',     ring: 'ring-red-500/30',     glow: 'shadow-red-500/20',     dot: 'bg-red-400' },
  desligado: { label: 'Desligado',  color: 'text-gray-500',    bg: 'bg-gray-500/10',    ring: 'ring-gray-500/30',    glow: 'shadow-gray-500/20',    dot: 'bg-gray-500' },
};
