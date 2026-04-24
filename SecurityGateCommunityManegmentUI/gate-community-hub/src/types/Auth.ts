export interface JwtPayload {
  id: string;
  email: string;
  role: "resident" | "staff" | "admin" | "security";
  exp: number;
  iat: number;
  name?: string;
  avatar?: string; 
 residentId?: string | number;
}

export interface AuthUser {
  token: string;
  user: JwtPayload;
}

export interface User{
 name: string;
  email: string;
  password?: string;
  googleId?: string;
  createdAt: Date;
  avatar?: string; 
  role: UserRole;
  unit?: string; // Flat/Unit info
  phone?: string;
  residentSince?: Date;
  updatedAt: Date;
  id: string;
}

export const UserRole = {
  RESIDENT: 'resident',
  SECURITY: 'security',
  ADMIN: 'admin',
  STAFF: 'staff'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];