export type VisitorCategory = 'Resident' | 'Delivery' | 'Guest' | 'Service' | 'Vendor';
export type VisitorStatus = 'Pending' | 'OTP Sent' | 'Approved' | 'Active' | 'Checked Out' | 'Completed' | 'Denied';

export interface Visitor {
  _id?: string;
  name?: string;
  phone?: string;
  photoUrl?: string;
  category?: VisitorCategory;
  purpose?: string;
  invitedBy?: { name?: string; unit?: string } | string;
  unit?: string;
  status?: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  entryPoint?: string;
  qrCode?: string;
  otpVerified?: boolean;
  vehicleNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}
