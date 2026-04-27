import type { DashboardData } from "@/types/resident";
import api from "@/utils/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Get dashboard data
export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await api.get<ApiResponse<DashboardData>>("/resident/dashboard");
  return res.data.data;
}
