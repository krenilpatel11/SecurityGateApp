import type { Visitor } from "@/types/visitor";
import api from "@/utils/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getMyVisitors(): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor/my");
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

export async function inviteVisitor(data: {
  name: string; purpose: string; category?: Visitor["category"];
  visitDate?: string; visitTime?: string; unit?: string;
  entryPoint?: string; phone?: string; vehicleNumber?: string;
}): Promise<Visitor & { otpForDev?: string }> {
  const res = await api.post<ApiResponse<Visitor & { otpForDev?: string }>>("/visitor/invite", data);
  return res.data.data ?? (res.data as unknown as Visitor);
}

export async function verifyVisitorOTP(id: string, otp: string): Promise<Visitor> {
  const res = await api.post<ApiResponse<Visitor>>(`/visitor/${id}/verify-otp`, { otp });
  return res.data.data;
}

export async function getGatePass(id: string): Promise<Visitor> {
  const res = await api.get<ApiResponse<Visitor>>(`/visitor/gate-pass/${id}`);
  return res.data.data;
}

export async function getUpcomingVisitors(): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor/upcoming");
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

export async function getVisitorHistory(): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor/history");
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

export async function getAllVisitors(params?: { category?: string; status?: string; date?: string }): Promise<Visitor[]> {
  const res = await api.get<ApiResponse<Visitor[]>>("/visitor", { params });
  return res.data.data ?? (res.data as unknown as Visitor[]);
}

export async function updateVisitorStatus(id: string, status: string, photoUrl?: string): Promise<Visitor> {
  const res = await api.patch<ApiResponse<Visitor>>(`/visitor/${id}/status`, { status, photoUrl });
  return res.data.data;
}

export async function captureVisitorPhoto(id: string, photoUrl: string): Promise<Visitor> {
  const res = await api.patch<ApiResponse<Visitor>>(`/visitor/${id}/photo`, { photoUrl });
  return res.data.data;
}

export async function logWalkIn(data: {
  name: string; phone?: string; purpose: string; unit?: string;
  category?: string; vehicleNumber?: string; photoUrl?: string;
}): Promise<Visitor> {
  const res = await api.post<ApiResponse<Visitor>>("/visitor/walkin", data);
  return res.data.data;
}
