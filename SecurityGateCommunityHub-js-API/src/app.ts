import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import residentRoutes from './routes/resident.routes';
import visitorRoutes from './routes/visitor.routes';
import deliveryRoutes from './routes/delivery.routes';
import announcementRoutes from './routes/announcement.routes';
import adminRoutes from './routes/admin.routes';
import complaintRoutes from './routes/complaint.routes';
import sosRoutes from './routes/sos.routes';
import paymentRoutes from './routes/payment.routes';
import amenityRoutes from './routes/amenity.routes';
import eventRoutes from './routes/event.routes';
import pollRoutes from './routes/poll.routes';
import notificationRoutes from './routes/notification.routes';
import staffRoutes from './routes/staff.routes';
import gateRoutes from './routes/gate.routes';
import communityFeedRoutes from './routes/communityFeed.routes';

const app = express();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Trust Render's reverse proxy so secure cookies work
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:5001',
      'https://localhost:5001',
      'https://gate-community-hub.vercel.app',
      FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: IS_PRODUCTION,
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/feed', communityFeedRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() }, message: 'Server is healthy' });
});

export default app;
