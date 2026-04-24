export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  residentSince: string;
  role: string;
  // ...other fields
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  title: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  rsvpRequired: boolean;
  description: string;
  createdAt: string;
}

export interface PollOption {
  option: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endsAt: string;
}

export interface DashboardData {
  quickActions: {
    visitorPasses: number;
    paymentStatus: string;
    upcomingEvents: number;
  };
  notifications: Notification[];
  events: Event[];
  polls: Poll[];
}
