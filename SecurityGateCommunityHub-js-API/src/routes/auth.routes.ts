import { Router, Request, Response } from 'express';
import passport from 'passport';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import User, { IUser } from '../models/user.model';
import bcrypt from 'bcryptjs';

const router = Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  (req: Request, res: Response, next: Parameters<typeof passport.authenticate>[2]) => {
    passport.authenticate('google', { session: false }, (err: Error | null, user: IUser | false) => {
      if (err) {
        console.error('Google OAuth error:', err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }
      if (!user) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }
      try {
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/oauth-success?token=${token}&refreshToken=${refreshToken}`);
      } catch (tokenErr) {
        console.error('Token generation error:', tokenErr);
        return res.status(500).json({ error: 'Token generation failed' });
      }
    })(req, res, next);
  }
);

// Email/password login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid credentials' });
    }
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, unit: user.unit },
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      return res.status(400).json({ success: false, data: null, message: 'Refresh token required' });
    }
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, data: null, message: 'User not found' });
    }
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      message: 'Token refreshed',
    });
  } catch {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired refresh token' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ success: true, data: null, message: 'Logged out successfully' });
  });
});

router.get('/test', (_req: Request, res: Response) => res.send('Hello World'));

export default router;
