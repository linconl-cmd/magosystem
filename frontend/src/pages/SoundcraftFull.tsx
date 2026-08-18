import { useOutletContext } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar';
import type { AppOutletContext } from '../types/outlet';

export default function SoundcraftFull() {
  const { data, connected } = useOutletContext<AppOutletContext>();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <StatusBar data={data} connected={connected} title="Mesa Soundcraft" />
      <div className="flex-1 flex min-h-0">
        {data.soundcraftUrl ? (
          <iframe src={data.soundcraftUrl} className="w-full flex-1 border-0" title="Soundcraft Ui" />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            URL da mesa não configurada.
          </div>
        )}
      </div>
    </div>
  );
}
