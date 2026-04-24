import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const authorizeRoles = (...roles: (UserRole | string)[]) => {
  // Flatten and sanitize allowed roles
  const allowedRoles: UserRole[] = roles
    .flatMap(role => (typeof role === 'string' ? role.split(',') : [role]))
    .map(role => role.trim() as UserRole);

  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: string };

    if (!user || !user.role) {
      return res.status(403).json({ message: 'Forbidden: No role found' });
    }

    // Split user.role if it contains multiple roles
    const userRoles = user.role.split(',').map(r => r.trim());

    const hasAccess = userRoles.some(role => allowedRoles.includes(role as UserRole));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};
