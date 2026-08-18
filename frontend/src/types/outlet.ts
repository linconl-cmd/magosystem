import type { Telemetria } from '@shared/types';

export interface AppOutletContext {
  data: Telemetria;
  connected: boolean;
}
