import api from '@/utils/api';

export interface GateDashboardData {
  today: {
    visitorsToday: number;
    activeVisitors: number;
    pendingVisitors: number;
    pendingDeliveries: number;
    approvedDeliveries: number;
  };
  recentLogs: GateLogEntry[];
  actionBreakdown: Record<string, number>;
  peakHours: { hour: number; count: number }[];
}

export interface GateLogEntry {
  _id: string;
  action: string;
  performedBy: { name: string; role: string };
  visitorName?: string;
  unit?: string;
  description: string;
  createdAt: string;
}

export const getGateDashboard = async (): Promise<GateDashboardData> => {
  const res = await api.get('/gate/dashboard');
  return res.data.data;
};

export const getGateLogs = async (params?: {
  page?: number; limit?: number; action?: string; from?: string; to?: string;
}): Promise<{ logs: GateLogEntry[]; total: number; page: number; pages: number }> => {
  const res = await api.get('/gate/logs', { params });
  return res.data.data;
};
