import { useOutletContext } from 'react-router-dom';
import type { StatusBateria } from '@shared/types';
import { StatusBar } from '../components/StatusBar';
import { STATUS_MAP } from '../lib/statusMap';
import type { AppOutletContext } from '../types/outlet';

function VoltageGauge({ voltage, percentual, status }: { voltage: number; percentual: number; status: StatusBateria }) {
  const style = STATUS_MAP[status];

  return (
    <div className={`relative rounded-2xl p-8 ${style.bg} ring-1 ${style.ring} shadow-lg ${style.glow}`}>
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Voltagem</p>
        <div className="flex items-end justify-center gap-4">
          <p className={`text-6xl font-bold tabular-nums ${style.color}`}>
            {voltage.toFixed(2)}
            <span className="text-2xl ml-1 font-normal text-gray-500">V</span>
          </p>
          <p className={`text-3xl font-semibold tabular-nums ${style.color} opacity-80 pb-1`}>
            {percentual}%
          </p>
        </div>
        <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status === 'normal' ? 'bg-emerald-500' : status === 'alerta' ? 'bg-amber-500' : status === 'critico' ? 'bg-red-500' : 'bg-gray-600'}`}
            style={{ width: `${percentual}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
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

export default function Dashboard() {
  const { data, connected } = useOutletContext<AppOutletContext>();
  const style = STATUS_MAP[data.status];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <StatusBar data={data} connected={connected} title="Painel Mesclado" />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <VoltageGauge voltage={data.voltagem} percentual={data.percentual} status={data.status} />

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
