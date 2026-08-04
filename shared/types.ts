export interface Telemetria {
  voltagem: number;
  status: 'normal' | 'alerta' | 'critico' | 'desligado';
  fonteConectada: boolean;
  modo: 'development' | 'production';
  soundcraftUrl: string;
  online: boolean;
  timestamp: number;
}

export type StatusBateria = Telemetria['status'];
