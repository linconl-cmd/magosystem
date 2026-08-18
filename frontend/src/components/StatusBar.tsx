import { NavLink } from 'react-router-dom';
import type { Telemetria } from '@shared/types';
import { STATUS_MAP } from '../lib/statusMap';
import { BatteryIcon } from './BatteryIcon';

interface StatusBarProps {
  data: Telemetria;
  connected: boolean;
  title?: string;
}

const NAV_ITEMS = [
  { to: '/', label: 'Menu', shortcut: 'Alt+1', end: true },
  { to: '/dashboard', label: 'Painel', shortcut: 'Alt+2', end: false },
  { to: '/soundcraft', label: 'Mesa', shortcut: 'Alt+3', end: false },
];

export function StatusBar({ data, connected, title = 'MagoSystem' }: StatusBarProps) {
  const style = STATUS_MAP[data.status];

  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">M</div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <nav className="flex items-center gap-1 bg-gray-900/60 ring-1 ring-gray-800 rounded-lg p-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.shortcut}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4 text-sm">
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.color}`}>
          <BatteryIcon percentual={data.percentual} status={data.status} charging={data.fonteConectada} className="w-5 h-2.5" />
          {data.percentual}% &middot; {data.voltagem.toFixed(2)}V &middot; {style.label}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
          {data.modo === 'development' ? 'DEV' : 'PROD'}
        </span>
      </div>
    </header>
  );
}
