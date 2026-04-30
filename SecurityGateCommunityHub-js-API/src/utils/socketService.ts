import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

// In-memory lockdown state (persists as long as server is running)
let lockdownActive = false;
let lockdownActivatedBy: string | null = null;
let lockdownActivatedAt: Date | null = null;

export function initSocketIO(server: HttpServer | HttpsServer, frontendUrl: string): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://localhost:5173',
        'https://gate-community-hub.vercel.app',
        frontendUrl,
      ],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Send current lockdown state on connect
    socket.emit('lockdown:status', {
      active: lockdownActive,
      activatedBy: lockdownActivatedBy,
      activatedAt: lockdownActivatedAt,
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// ── Event emitters ────────────────────────────────────────────────────────────

export function emitGateEvent(event: {
  action: string;
  visitorName?: string;
  unit?: string;
  message: string;
  timestamp?: Date;
}): void {
  if (!io) return;
  io.emit('gate:event', { ...event, timestamp: event.timestamp ?? new Date() });
}

export function emitNotification(userId: string, notification: {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', { ...notification, timestamp: new Date() });
}

export function broadcastNotification(notification: {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  if (!io) return;
  io.emit('notification:broadcast', { ...notification, timestamp: new Date() });
}

// ── Lockdown ──────────────────────────────────────────────────────────────────

export function activateLockdown(activatedBy: string): void {
  lockdownActive = true;
  lockdownActivatedBy = activatedBy;
  lockdownActivatedAt = new Date();
  if (!io) return;
  io.emit('lockdown:activated', {
    active: true,
    activatedBy,
    activatedAt: lockdownActivatedAt,
    message: '🚨 EMERGENCY LOCKDOWN ACTIVATED — All gate access suspended',
  });
}

export function deactivateLockdown(deactivatedBy: string): void {
  lockdownActive = false;
  lockdownActivatedBy = null;
  lockdownActivatedAt = null;
  if (!io) return;
  io.emit('lockdown:deactivated', {
    active: false,
    deactivatedBy,
    message: '✅ Lockdown lifted — Normal gate operations resumed',
  });
}

export function getLockdownState(): { active: boolean; activatedBy: string | null; activatedAt: Date | null } {
  return { active: lockdownActive, activatedBy: lockdownActivatedBy, activatedAt: lockdownActivatedAt };
}
