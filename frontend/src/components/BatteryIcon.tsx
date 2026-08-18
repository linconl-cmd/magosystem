import type { StatusBateria } from '@shared/types';

const FILL_COLOR: Record<StatusBateria, string> = {
  normal: '#34d399',
  alerta: '#fbbf24',
  critico: '#f87171',
  desligado: '#6b7280',
};

interface BatteryIconProps {
  percentual: number;
  status: StatusBateria;
  charging: boolean;
  className?: string;
}

export function BatteryIcon({ percentual, status, charging, className }: BatteryIconProps) {
  const clamped = Math.max(0, Math.min(100, percentual));
  const fillWidth = (clamped / 100) * 25;
  const fillColor = FILL_COLOR[status];

  return (
    <svg
      viewBox="0 0 36 18"
      className={`${className ?? ''} ${status === 'critico' ? 'animate-pulse' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Bateria em ${clamped}%`}
    >
      <rect x="1" y="1" width="30" height="16" rx="4" stroke="#6b7280" strokeWidth="1.5" fill="none" />
      <rect x="32" y="6.5" width="3" height="5" rx="1.2" fill="#6b7280" />
      <rect
        x="3.5"
        y="3.5"
        width={fillWidth}
        height="11"
        rx="2"
        fill={fillColor}
        style={{ transition: 'width 0.6s ease, fill 0.3s ease' }}
      />
      {charging && (
        <path
          d="M18.5 3 L12 10.2 h3.6 l-1.6 4.8 6.5-7.6h-3.6z"
          fill="#1f2937"
          stroke="#1f2937"
          strokeWidth="0.4"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
