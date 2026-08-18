import { useNavigate, useOutletContext } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar';
import type { AppOutletContext } from '../types/outlet';

function MenuCard({
  title,
  description,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-2xl p-6 ring-1 transition-all ${
        disabled
          ? 'bg-gray-900/30 ring-gray-800/50 cursor-not-allowed opacity-50'
          : 'bg-gray-900/60 ring-gray-800 hover:ring-indigo-500/50 hover:bg-gray-900 cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        {disabled && (
          <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
            Em breve
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}

export default function Home() {
  const { data, connected } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <StatusBar data={data} connected={connected} />

      <main className="max-w-4xl mx-auto p-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Central de Gestão</h2>
          <p className="text-gray-500">Selecione como deseja visualizar o sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MenuCard
            title="Mesa Soundcraft"
            description="Visualização e controle completo da mesa em tela cheia."
            onClick={() => navigate('/soundcraft')}
          />
          <MenuCard
            title="Painel Mesclado"
            description="Bateria e mesa juntas em um único painel de monitoramento."
            onClick={() => navigate('/dashboard')}
          />
          <MenuCard
            title="Relatórios"
            description="Histórico de tensão e relatórios exportáveis por evento."
            disabled
          />
          <MenuCard
            title="Configurações"
            description="Limiares de alerta, identidade visual e preferências do sistema."
            disabled
          />
        </div>
      </main>
    </div>
  );
}
