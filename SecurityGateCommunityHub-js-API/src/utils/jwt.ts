import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  activeRole?: string; // SUPERUSER impersonated role
  name: string;
  avatar?: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
    activeRole: user.activeRole,
    name: user.name,
    avatar: user.avatar,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: JwtPayload = {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
    activeRole: user.activeRole,
    name: user.name,
    avatar: user.avatar,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
};
