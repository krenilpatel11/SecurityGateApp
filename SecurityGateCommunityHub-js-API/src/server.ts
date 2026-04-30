import dotenv from 'dotenv';
dotenv.config();

// Validate required env vars before anything else
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set them in the Render dashboard under Environment → Environment Variables.');
  process.exit(1);
}

import mongoose from 'mongoose';
import app from './app';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { initSocketIO } from './utils/socketService';

const PORT = process.env.PORT || 5001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ MongoDB connected');

    if (IS_PRODUCTION) {
      // Render.com provides HTTP — TLS is handled by their reverse proxy
      const server = http.createServer(app);
      initSocketIO(server, FRONTEND_URL);
      server.listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`🔌 Socket.IO ready`);
      });
    } else {
      // Local dev: use HTTPS with self-signed certs if available
      try {
        const httpsOptions = {
          key: fs.readFileSync('./localhost-key.pem'),
          cert: fs.readFileSync('./localhost.pem'),
        };
        const server = https.createServer(httpsOptions, app);
        initSocketIO(server, FRONTEND_URL);
        server.listen(PORT, () => {
          console.log(`🔒 HTTPS Server running on port ${PORT}`);
          console.log(`🔌 Socket.IO ready`);
        });
      } catch {
        // Fallback to HTTP if certs not found
        const server = http.createServer(app);
        initSocketIO(server, FRONTEND_URL);
        server.listen(PORT, () => {
          console.log(`⚠️  HTTP Server (no certs found) running on port ${PORT}`);
          console.log(`🔌 Socket.IO ready`);
        });
      }
    }
  })
  .catch((err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
