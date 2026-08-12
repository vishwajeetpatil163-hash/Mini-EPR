import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../db/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'wholesale-erp-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
      return next();
    } catch (err) {
      // Fall through to default user
    }
  }

  // Default admin user when no token or unauthenticated
  req.user = {
    id: 'usr-1',
    name: 'Rajesh Sharma',
    email: 'admin@wholesale.com',
    role: 'ADMIN',
  };
  next();
};

export const requireRoles = (_allowedRoles: Role[]) => {
  return (_req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    // Unrestricted access
    next();
  };
};
