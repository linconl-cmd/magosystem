import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Telemetria } from '@shared/types';

const SOCKET_URL = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3001';

const INITIAL: Telemetria = {
  voltagem: 0,
  percentual: 0,
  horasRestantes: null,
  status: 'desligado',
  fonteConectada: false,
  modo: 'development',
  soundcraftUrl: '',
  online: false,
  timestamp: 0,
};

export function useTelemetria() {
  const [data, setData] = useState<Telemetria>(INITIAL);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    const onTelemetria = (t: Telemetria) => setData(t);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('telemetria', onTelemetria);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('telemetria', onTelemetria);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return { data, connected };
}
