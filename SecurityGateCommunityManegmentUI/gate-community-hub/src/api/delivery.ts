import api from "@/utils/api";

export interface Delivery {
  _id: string;
  resident: { _id: string; name: string; unit: string; email: string } | string;
  deliveryPerson: string;
  deliveryCompany?: string;
  purpose: string;
  items?: string;
  photoUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed" | "Left at Gate";
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Guard: get all deliveries
export async function getAllDeliveries(): Promise<Delivery[]> {
  const res = await api.get<ApiResponse<Delivery[]>>("/delivery");
  return res.data.data;
}

// Guard: log new delivery
export async function logDelivery(data: {
  recipientUnit: string;
  deliveryPerson: string;
  deliveryCompany?: string;
  purpose: string;
  items?: string;
}): Promise<Delivery> {
  const res = await api.post<ApiResponse<Delivery>>("/delivery", data);
  return res.data.data;
}

// Resident: pending deliveries
export async function getPendingDeliveries(): Promise<Delivery[]> {
  const res = await api.get<ApiResponse<Delivery[]>>("/delivery/pending");
  return res.data.data;
}

// Resident: delivery history
export async function getDeliveryHistory(): Promise<Delivery[]> {
  const res = await api.get<ApiResponse<Delivery[]>>("/delivery/history");
  return res.data.data;
}

// Resident: mark as received
export async function markDeliveryReceived(id: string): Promise<Delivery> {
  const res = await api.patch<ApiResponse<Delivery>>(`/delivery/${id}/received`);
  return res.data.data;
}
