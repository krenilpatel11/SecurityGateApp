export type VisitorCategory = "Resident" | "Delivery" | "Guest" | "Service";
export type VisitorStatus = "Active" | "Pending" | "Checked Out" | "Approved" | "Completed";

export interface Visitor {
  _id: string;
  name: string;
  photoUrl?: string;
  category: VisitorCategory;
  purpose: string;
  invitedBy: string | { _id: string; name: string; unit?: string };
  unit?: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  entryPoint?: string;
  qrCode?: string;
  createdAt?: string;
}
