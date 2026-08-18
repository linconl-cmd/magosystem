import type { Telemetria, StatusBateria } from '../../shared/types.js';

const VOLTAGE_MIN = 10.0;
const VOLTAGE_MAX = 15.0;
const NOISE_THRESHOLD = 0.3;
const STATUS_THRESHOLDS: { max: number; status: StatusBateria }[] = [
  { max: 11.0, status: 'critico' },
  { max: 11.8, status: 'alerta' },
  { max: Infinity, status: 'normal' },
];

// Curva de tensão em repouso x carga (bateria chumbo-ácida 12V, referência de mercado)
const SOC_CURVE: { voltage: number; percent: number }[] = [
  { voltage: 12.6, percent: 100 },
  { voltage: 12.5, percent: 90 },
  { voltage: 12.42, percent: 80 },
  { voltage: 12.32, percent: 70 },
  { voltage: 12.2, percent: 60 },
  { voltage: 12.06, percent: 50 },
  { voltage: 11.9, percent: 40 },
  { voltage: 11.75, percent: 30 },
  { voltage: 11.58, percent: 20 },
  { voltage: 11.31, percent: 10 },
  { voltage: 10.5, percent: 0 },
];

const HISTORY_WINDOW_MS = 10 * 60 * 1000;
const MIN_HISTORY_MS = 60 * 1000;
const MIN_DECLINE_PERCENT_PER_HOUR = 0.5;

interface HistoryPoint {
  voltage: number;
  timestamp: number;
}

export class BatteryService {
  private lastVoltage: number = 12.6;
  private lastUpdate: number = Date.now();
  private fonteConectada: boolean = false;
  private history: HistoryPoint[] = [];
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

  private static voltageToPercent(voltage: number): number {
    if (voltage >= SOC_CURVE[0].voltage) return 100;
    if (voltage <= SOC_CURVE[SOC_CURVE.length - 1].voltage) return 0;

    for (let i = 0; i < SOC_CURVE.length - 1; i++) {
      const hi = SOC_CURVE[i];
      const lo = SOC_CURVE[i + 1];
      if (voltage <= hi.voltage && voltage >= lo.voltage) {
        const ratio = (voltage - lo.voltage) / (hi.voltage - lo.voltage);
        return Math.round(lo.percent + ratio * (hi.percent - lo.percent));
      }
    }
    return 0;
  }

  private recordHistory(voltage: number, timestamp: number) {
    this.history.push({ voltage, timestamp });
    const cutoff = timestamp - HISTORY_WINDOW_MS;
    while (this.history.length > 0 && this.history[0].timestamp < cutoff) {
      this.history.shift();
    }
  }

  private estimateHoursRemaining(currentPercent: number): number | null {
    if (this.history.length < 4) return null;

    const span = this.history[this.history.length - 1].timestamp - this.history[0].timestamp;
    if (span < MIN_HISTORY_MS) return null;

    const sliceSize = Math.max(1, Math.floor(this.history.length / 4));
    const early = this.history.slice(0, sliceSize);
    const recent = this.history.slice(-sliceSize);

    const avgVoltage = (points: HistoryPoint[]) =>
      points.reduce((sum, p) => sum + p.voltage, 0) / points.length;
    const avgTime = (points: HistoryPoint[]) =>
      points.reduce((sum, p) => sum + p.timestamp, 0) / points.length;

    const earlyPercent = BatteryService.voltageToPercent(avgVoltage(early));
    const recentPercent = BatteryService.voltageToPercent(avgVoltage(recent));
    const elapsedHours = (avgTime(recent) - avgTime(early)) / 3_600_000;

    if (elapsedHours <= 0) return null;

    const declinePerHour = (earlyPercent - recentPercent) / elapsedHours;
    if (declinePerHour < MIN_DECLINE_PERCENT_PER_HOUR) return null;

    const hours = currentPercent / declinePerHour;
    return Math.round(hours * 10) / 10;
  }

  updateFromESP32(payload: { voltagem: number; fonteConectada?: boolean }): Telemetria | null {
    const voltage = this.validateVoltage(payload.voltagem);
    if (voltage === null) return null;

    this.lastVoltage = voltage;
    this.lastUpdate = Date.now();
    this.fonteConectada = payload.fonteConectada ?? false;
    this.recordHistory(voltage, this.lastUpdate);

    return this.buildTelemetria();
  }

  isOnline(): boolean {
    return Date.now() - this.lastUpdate < this.esp32Timeout;
  }

  buildTelemetria(): Telemetria {
    const online = this.isOnline();
    const percentual = BatteryService.voltageToPercent(this.lastVoltage);

    return {
      voltagem: this.lastVoltage,
      percentual,
      horasRestantes: online ? this.estimateHoursRemaining(percentual) : null,
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
    this.recordHistory(this.lastVoltage, this.lastUpdate);
    return this.buildTelemetria();
  }
}
