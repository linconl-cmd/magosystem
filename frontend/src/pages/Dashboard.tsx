import type { ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { StatusBateria } from '@shared/types';
import { StatusBar } from '../components/StatusBar';
import { BatteryIcon } from '../components/BatteryIcon';
import { STATUS_MAP } from '../lib/statusMap';
import type { AppOutletContext } from '../types/outlet';

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  style,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  style: (typeof STATUS_MAP)[StatusBateria];
}) {
  return (
    <div className={`rounded-2xl p-6 ${style.bg} ring-1 ${style.ring} shadow-lg ${style.glow}`}>
      {icon}
      <p className="text-xs uppercase tracking-widest text-gray-400 mt-3">{label}</p>
      <p className={`text-4xl font-bold tabular-nums ${style.color} mt-1`}>
        {value}
        <span className="text-lg ml-1 font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

function VoltageGauge({
  voltage,
  percentual,
  status,
  charging,
}: {
  voltage: number;
  percentual: number;
  status: StatusBateria;
  charging: boolean;
}) {
  const style = STATUS_MAP[status];

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<BoltIcon className={`w-5 h-5 ${style.color}`} />}
        label="Voltagem"
        value={voltage.toFixed(2)}
        unit="V"
        style={style}
      />
      <StatCard
        icon={<BatteryIcon percentual={percentual} status={status} charging={charging} className="w-9 h-[18px]" />}
        label="Carga"
        value={String(percentual)}
        unit="%"
        style={style}
      />
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-gray-900/60 ring-1 ring-gray-800 p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data, connected } = useOutletContext<AppOutletContext>();
  const style = STATUS_MAP[data.status];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <StatusBar data={data} connected={connected} title="Painel Mesclado" />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <VoltageGauge
          voltage={data.voltagem}
          percentual={data.percentual}
          status={data.status}
          charging={data.fonteConectada}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <InfoCard label="Status" value={style.label} />
          <InfoCard
            label="Autonomia"
            value={data.horasRestantes !== null ? `${data.horasRestantes}h` : data.fonteConectada ? 'Carregando' : 'Calculando...'}
            sub={data.horasRestantes !== null ? 'No ritmo atual de descarga' : undefined}
          />
          <InfoCard
            label="Fonte AC"
            value={data.fonteConectada ? 'Conectada' : 'Desconectada'}
            sub={data.fonteConectada ? 'Carregando' : 'Na bateria'}
          />
          <InfoCard
            label="ESP32"
            value={data.online ? 'Online' : 'Offline'}
            sub={data.online ? 'Heartbeat OK' : 'Sem resposta'}
          />
          <InfoCard
            label="Atualizado"
            value={data.timestamp ? new Date(data.timestamp).toLocaleTimeString('pt-BR') : '--:--:--'}
          />
        </div>

        {data.soundcraftUrl && (
          <div className="rounded-xl overflow-hidden ring-1 ring-gray-800">
            <div className="bg-gray-900 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between">
              <span>Soundcraft Ui</span>
              {data.modo === 'development' && (
                <span className="text-[10px] text-amber-500/70 font-medium">SIMULADO</span>
              )}
            </div>
            <iframe
              src={data.soundcraftUrl}
              className="w-full border-0"
              style={{ height: '85vh' }}
              title="Soundcraft Ui"
            />
          </div>
        )}
      </main>
    </div>
  );
}
