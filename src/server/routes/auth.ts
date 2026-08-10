import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, Role } from '../db/database';
import { authenticateJWT, requireRoles, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email and password are required.',
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email address or password.',
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (ADMIN only)
router.post('/register', authenticateJWT, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Name, email, password, and role are required.',
      });
    }

    const validRoles: Role[] = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
      });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({
        error: 'UserExists',
        message: `User with email '${email}' already exists.`,
      });
    }

    const passwordHash = bcrypt.hashSync(password, 8);
    const newUser = db.createUser({ name, email, passwordHash, role });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

export default router;
