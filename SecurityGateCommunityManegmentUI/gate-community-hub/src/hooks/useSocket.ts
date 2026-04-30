import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5001';

export interface GateEvent {
  action: string;
  visitorName?: string;
  unit?: string;
  message: string;
  timestamp: string;
}

export interface LockdownState {
  active: boolean;
  activatedBy: string | null;
  activatedAt: string | null;
}

export interface BroadcastNotification {
  type: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

type SocketEventHandlers = {
  onGateEvent?: (event: GateEvent) => void;
  onLockdownActivated?: (state: LockdownState & { message: string }) => void;
  onLockdownDeactivated?: (state: LockdownState & { message: string }) => void;
  onLockdownStatus?: (state: LockdownState) => void;
  onNotification?: (n: BroadcastNotification) => void;
};

export function useSocket(handlers: SocketEventHandlers) {
  const socketRef = useRef<Socket | null>(null);

  const stableHandlers = useRef(handlers);
  stableHandlers.current = handlers;

  useEffect(() => {
    const socket = io(API_BASE, { withCredentials: true, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('gate:event', (e: GateEvent) => stableHandlers.current.onGateEvent?.(e));
    socket.on('lockdown:activated', (s: LockdownState & { message: string }) => stableHandlers.current.onLockdownActivated?.(s));
    socket.on('lockdown:deactivated', (s: LockdownState & { message: string }) => stableHandlers.current.onLockdownDeactivated?.(s));
    socket.on('lockdown:status', (s: LockdownState) => stableHandlers.current.onLockdownStatus?.(s));
    socket.on('notification:broadcast', (n: BroadcastNotification) => stableHandlers.current.onNotification?.(n));

    return () => { socket.disconnect(); };
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit };
}
