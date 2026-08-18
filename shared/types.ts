export interface Telemetria {
  voltagem: number;
  percentual: number;
  horasRestantes: number | null;
  status: 'normal' | 'alerta' | 'critico' | 'desligado';
  fonteConectada: boolean;
  modo: 'development' | 'production';
  soundcraftUrl: string;
  online: boolean;
  timestamp: number;
}

export type StatusBateria = Telemetria['status'];
