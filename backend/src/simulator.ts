import type { BatteryService } from './battery-service.js';

export class BatterySimulator {
  private voltage = 12.6;
  private direction: 1 | -1 = -1;
  private fonteConectada = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  start(service: BatteryService, onUpdate: (t: ReturnType<typeof service.buildTelemetria>) => void) {
    this.interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 0.1;
      this.voltage += this.direction * 0.05 + fluctuation;

      if (this.voltage <= 10.5) {
        this.direction = 1;
        this.fonteConectada = true;
      } else if (this.voltage >= 13.2) {
        this.direction = -1;
        this.fonteConectada = false;
      }

      this.voltage = Math.max(10.2, Math.min(14.5, this.voltage));
      const telemetria = service.setSimulated(this.voltage, this.fonteConectada);
      onUpdate(telemetria);
    }, 2000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
