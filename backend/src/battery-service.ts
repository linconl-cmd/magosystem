import type { Telemetria, StatusBateria } from '../../shared/types.js';

const VOLTAGE_MIN = 10.0;
const VOLTAGE_MAX = 15.0;
const NOISE_THRESHOLD = 0.3;
const STATUS_THRESHOLDS: { max: number; status: StatusBateria }[] = [
  { max: 11.0, status: 'critico' },
  { max: 11.8, status: 'alerta' },
  { max: Infinity, status: 'normal' },
];

export class BatteryService {
  private lastVoltage: number = 12.6;
  private lastUpdate: number = Date.now();
  private fonteConectada: boolean = false;
  private readonly modo: 'development' | 'production';
  private readonly soundcraftUrl: string;
  private readonly esp32Timeout: number;

  constructor(modo: 'development' | 'production', soundcraftUrl: string, esp32Timeout: number) {
    this.modo = modo;
    this.soundcraftUrl = soundcraftUrl;
    this.esp32Timeout = esp32Timeout;
  }

  private classifyStatus(voltage: number): StatusBateria {
    for (const { max, status } of STATUS_THRESHOLDS) {
      if (voltage < max) return status;
    }
    return 'normal';
  }

  private validateVoltage(raw: number): number | null {
    if (typeof raw !== 'number' || isNaN(raw)) return null;
    if (raw < VOLTAGE_MIN || raw > VOLTAGE_MAX) return null;

    const delta = Math.abs(raw - this.lastVoltage);
    if (delta > NOISE_THRESHOLD && this.lastVoltage !== 12.6) return null;

    return Math.round(raw * 100) / 100;
  }

  updateFromESP32(payload: { voltagem: number; fonteConectada?: boolean }): Telemetria | null {
    const voltage = this.validateVoltage(payload.voltagem);
    if (voltage === null) return null;

    this.lastVoltage = voltage;
    this.lastUpdate = Date.now();
    this.fonteConectada = payload.fonteConectada ?? false;

    return this.buildTelemetria();
  }

  isOnline(): boolean {
    return Date.now() - this.lastUpdate < this.esp32Timeout;
  }

  buildTelemetria(): Telemetria {
    const online = this.isOnline();
    return {
      voltagem: this.lastVoltage,
      status: online ? this.classifyStatus(this.lastVoltage) : 'desligado',
      fonteConectada: this.fonteConectada,
      modo: this.modo,
      soundcraftUrl: this.soundcraftUrl,
      online,
      timestamp: Date.now(),
    };
  }

  setSimulated(voltage: number, fonteConectada: boolean): Telemetria {
    this.lastVoltage = Math.round(voltage * 100) / 100;
    this.lastUpdate = Date.now();
    this.fonteConectada = fonteConectada;
    return this.buildTelemetria();
  }
}
