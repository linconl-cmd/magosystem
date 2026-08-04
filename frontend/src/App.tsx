import { useTelemetria } from './hooks/useTelemetria';
import type { StatusBateria } from '@shared/types';

const STATUS_MAP: Record<StatusBateria, { label: string; color: string; bg: string; ring: string; glow: string }> = {
  normal:    { label: 'Normal',     color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30', glow: 'shadow-emerald-500/20' },
  alerta:    { label: 'Alerta',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/30',   glow: 'shadow-amber-500/20' },
  critico:   { label: 'Crítico',   color: 'text-red-400',     bg: 'bg-red-500/10',     ring: 'ring-red-500/30',     glow: 'shadow-red-500/20' },
  desligado: { label: 'Desligado',  color: 'text-gray-500',    bg: 'bg-gray-500/10',    ring: 'ring-gray-500/30',    glow: 'shadow-gray-500/20' },
};

function VoltageGauge({ voltage, status }: { voltage: number; status: StatusBateria }) {
  const pct = Math.min(100, Math.max(0, ((voltage - 10) / 5) * 100));
  const style = STATUS_MAP[status];

  return (
    <div className={`relative rounded-2xl p-8 ${style.bg} ring-1 ${style.ring} shadow-lg ${style.glow}`}>
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Voltagem</p>
        <p className={`text-6xl font-bold tabular-nums ${style.color}`}>
          {voltage.toFixed(2)}
          <span className="text-2xl ml-1 font-normal text-gray-500">V</span>
        </p>
        <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status === 'normal' ? 'bg-emerald-500' : status === 'alerta' ? 'bg-amber-500' : status === 'critico' ? 'bg-red-500' : 'bg-gray-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>10V</span>
          <span>12V</span>
          <span>15V</span>
        </div>
      </div>
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

export default function App() {
  const { data, connected } = useTelemetria();
  const style = STATUS_MAP[data.status];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">M</div>
          <h1 className="text-lg font-semibold tracking-tight">MagoSystem</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'normal' ? 'bg-emerald-400' : data.status === 'alerta' ? 'bg-amber-400' : data.status === 'critico' ? 'bg-red-400' : 'bg-gray-500'}`} />
            {style.label}
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

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Gauge */}
        <VoltageGauge voltage={data.voltagem} status={data.status} />

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Status" value={style.label} />
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

        {/* Soundcraft Iframe */}
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
              style={{ height: '70vh' }}
              title="Soundcraft Ui"
            />
          </div>
        )}
      </main>
    </div>
  );
}
