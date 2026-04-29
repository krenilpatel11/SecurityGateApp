import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const authorizeRoles = (...roles: (UserRole | string)[]) => {
  const allowedRoles: UserRole[] = roles
    .flatMap(role => (typeof role === 'string' ? role.split(',') : [role]))
    .map(role => role.trim() as UserRole);

  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: string; activeRole?: string };

    if (!user || !user.role) {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden: No role found' });
    }

    // SUPERUSER always has access to everything
    if (user.role === UserRole.SUPERUSER) return next();

    // Use activeRole (impersonation) if set, otherwise use real role
    const effectiveRole = user.activeRole ?? user.role;
    const userRoles = effectiveRole.split(',').map(r => r.trim());
    const hasAccess = userRoles.some(role => allowedRoles.includes(role as UserRole));

    if (!hasAccess) {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};
