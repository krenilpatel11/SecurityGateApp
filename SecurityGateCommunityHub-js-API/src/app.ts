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

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:5001', 'https://localhost:5001'],
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
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'none',
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

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() }, message: 'Server is healthy' });
});

export default app;
