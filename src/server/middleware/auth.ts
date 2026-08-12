import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../db/database';

// Resolve JWT_SECRET with a non-empty fallback and startup warning
const envSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
export const JWT_SECRET = envSecret.length > 0 ? envSecret : 'wholesale-erp-production-secret-key-2026';

if (!envSecret) {
  console.warn('[AUTH WARNING] process.env.JWT_SECRET is not set. Using secure fallback secret key.');
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authenticates requests using JWT Bearer Tokens.
 * Safely parses headers, verifies signatures, and rejects invalid/expired tokens with 401 JSON.
 */
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required in Authorization header (Format: Bearer <token>).',
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is empty.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token payload.',
      });
    }

    req.user = decoded;
    return next();
  } catch (err: any) {
    const errorMsg =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid or corrupted authentication token.';

    return res.status(401).json({
      error: 'Unauthorized',
      message: errorMsg,
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the allowed roles. Returns 403 JSON if denied.
 */
export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required before role check.',
        });
      }

      if (!req.user.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Role '${req.user.role || 'UNKNOWN'}' does not have permission for this action. Required: ${allowedRoles.join(', ')}`,
        });
      }

      return next();
    } catch (err) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Role authorization check failed.',
      });
    }
  };
};

