import type { DashboardData, UserProfile } from "@/types/resident";
import api from "@/utils/api";

// Get profile
export async function fetchProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/resident/profile");
  return res.data;
}

// Update profile
export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await api.put<UserProfile>("/resident/profile", data);
  return res.data;
}

// Get dashboard data
export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/resident/dashboard");
  return res.data;
}
