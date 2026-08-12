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
      console.warn('[AUTH WARN] Login attempt with missing credentials');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email and password are required.',
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      console.warn(`[AUTH WARN] Login failed: User email '${email}' not found.`);
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[AUTH WARN] Login failed: Incorrect password for '${email}'.`);
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

    console.log(`[AUTH SUCCESS] User '${user.email}' (${user.role}) logged in successfully.`);

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
  } catch (err: any) {
    console.error('[AUTH ERROR] Unexpected error during login:', err);
    return res.status(500).json({
      error: 'ServerError',
      message: err?.message || 'An unexpected error occurred during login. Please try again.',
    });
  }
});

// POST /api/auth/register (ADMIN only)
router.post('/register', authenticateJWT, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
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
  } catch (err: any) {
    console.error('[AUTH ERROR] Registration failed:', err);
    return res.status(500).json({
      error: 'ServerError',
      message: err?.message || 'Failed to register new staff account.',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

// PUT /api/auth/me - Update own profile (Name, Email, Password)
router.put('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token missing or invalid.',
      });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'UserNotFound',
        message: 'User account not found.',
      });
    }

    const { name, email, currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Current password verification is mandatory for profile updates
    if (!currentPassword) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Current password is required to save changes.',
      });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Current password is incorrect.',
      });
    }

    // 2. Validate email if updated
    const trimmedEmail = email ? email.trim() : '';
    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) {
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Please enter a valid email address.',
        });
      }

      const existingUser = db.findUserByEmail(trimmedEmail);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          error: 'UserExists',
          message: `The email address '${trimmedEmail}' is already registered to another account.`,
        });
      }
    }

    // 3. Validate new password if provided
    let newPasswordHash: string | undefined = undefined;
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'New password must be at least 8 characters long.',
        });
      }

      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'New password and confirm password do not match.',
        });
      }

      newPasswordHash = bcrypt.hashSync(newPassword, 8);
    }

    // 4. Update user details
    const updates: Partial<{ name: string; email: string; passwordHash: string }> = {};
    if (name && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) {
      updates.email = trimmedEmail;
    }
    if (newPasswordHash) {
      updates.passwordHash = newPasswordHash;
    }

    const updatedUser = db.updateUser(user.id, updates);
    if (!updatedUser) {
      return res.status(500).json({
        error: 'UpdateFailed',
        message: 'Failed to update user profile in memory store.',
      });
    }

    // 5. Generate fresh JWT token with updated name & email
    const tokenPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    const emailChanged = trimmedEmail && trimmedEmail.toLowerCase() !== req.user.email.toLowerCase();

    res.json({
      message: 'Profile updated successfully.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      emailChanged,
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] Profile update failed:', err);
    return res.status(500).json({
      error: 'ServerError',
      message: err?.message || 'Failed to update profile.',
    });
  }
});

export default router;
