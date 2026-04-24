export type VisitorCategory = "Resident" | "Delivery" | "Guest" | "Service";
export type VisitorStatus = "Active" | "Pending" | "Checked Out" | "Approved";

export interface Visitor {
  _id: string;
  name: string;
  photoUrl: string;
  category: VisitorCategory;
  purpose: string;
  invitedBy: string;
  unit: string;
  status: VisitorStatus;
  checkInTime: string;
  entryPoint: string;
}
