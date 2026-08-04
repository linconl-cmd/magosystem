import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { BatteryService } from './battery-service.js';
import { BatterySimulator } from './simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3001;
const MODE = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as const;
const SOUNDCRAFT_URL = process.env.SOUNDCRAFT_URL || '';
const ESP32_TIMEOUT = Number(process.env.ESP32_TIMEOUT_MS) || 10_000;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const effectiveSoundcraftUrl = SOUNDCRAFT_URL || (MODE === 'development'
  ? `http://localhost:${PORT}/soundcraft-mock`
  : '');

const batteryService = new BatteryService(MODE, effectiveSoundcraftUrl, ESP32_TIMEOUT);

function broadcast() {
  io.emit('telemetria', batteryService.buildTelemetria());
}

// --- ESP32 endpoint (production) ---
app.post('/api/bateria/telemetria', (req, res) => {
  const telemetria = batteryService.updateFromESP32(req.body);
  if (!telemetria) {
    res.status(400).json({ error: 'Dados inválidos ou ruído elétrico detectado' });
    return;
  }
  broadcast();
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: MODE, uptime: process.uptime() });
});

// --- Soundcraft mock (dev only) ---
if (MODE === 'development') {
  app.get('/soundcraft-mock', (_req, res) => {
    res.sendFile(join(__dirname, 'soundcraft-mock.html'));
  });
}

// --- Watchdog: detecta ESP32 offline ---
setInterval(() => {
  if (!batteryService.isOnline()) {
    broadcast();
  }
}, ESP32_TIMEOUT);

// --- Socket.io ---
io.on('connection', (socket) => {
  console.log(`[WS] Cliente conectado: ${socket.id}`);
  socket.emit('telemetria', batteryService.buildTelemetria());

  socket.on('disconnect', () => {
    console.log(`[WS] Cliente desconectado: ${socket.id}`);
  });
});

// --- Simulador (dev only) ---
if (MODE === 'development') {
  const simulator = new BatterySimulator();
  simulator.start(batteryService, () => broadcast());
  console.log('[SIM] Simulador de bateria ativado');
}

httpServer.listen(PORT, () => {
  console.log(`[SERVER] Rodando em http://localhost:${PORT} [${MODE}]`);
});
