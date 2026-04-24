import type { Visitor } from "@/types/visitor";
import api from "@/utils/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Invite a visitor (POST /api/visitor/invite)
export async function inviteVisitor(data: Partial<Visitor>): Promise<Visitor> {
  const res = await api.post<ApiResponse<Visitor>>("/visitor/invite", data);
  return res.data.data ?? (res.data as unknown as Visitor);
}

// Get upcoming (pre-approved) visitors (GET /api/visitor/upcoming)
export async function getUpcomingVisitors(): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor/upcoming");
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

// Get visitor history (GET /api/visitor/history)
export async function getVisitorHistory(): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor/history");
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

// Get all visitors (for Security/Admin) (GET /api/visitor?category=...&status=...)
export async function getAllVisitors(params?: {
  category?: string;
  status?: string;
  date?: string;
}): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor", { params });
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

// Update visitor status (PATCH /api/visitor/:id/status)
export async function updateVisitorStatus(id: string, status: string): Promise<Visitor> {
  const res = await api.patch<ApiResponse<Visitor>>(`/visitor/${id}/status`, { status });
  return res.data.data;
}

// Log walk-in visitor (POST /api/visitor/walkin)
export async function logWalkIn(data: {
  name: string;
  phone?: string;
  purpose: string;
  unit?: string;
  category?: string;
}): Promise<Visitor> {
  const res = await api.post<ApiResponse<Visitor>>("/visitor/walkin", data);
  return res.data.data;
}

