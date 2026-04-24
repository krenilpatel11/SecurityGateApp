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

const PORT = process.env.PORT || 5001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ MongoDB connected');

    if (IS_PRODUCTION) {
      // Render.com provides HTTP — TLS is handled by their reverse proxy
      http.createServer(app).listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
      });
    } else {
      // Local dev: use HTTPS with self-signed certs if available
      try {
        const httpsOptions = {
          key: fs.readFileSync('./localhost-key.pem'),
          cert: fs.readFileSync('./localhost.pem'),
        };
        https.createServer(httpsOptions, app).listen(PORT, () => {
          console.log(`🔒 HTTPS Server running on port ${PORT}`);
        });
      } catch {
        // Fallback to HTTP if certs not found
        http.createServer(app).listen(PORT, () => {
          console.log(`⚠️  HTTP Server (no certs found) running on port ${PORT}`);
        });
      }
    }
  })
  .catch((err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
