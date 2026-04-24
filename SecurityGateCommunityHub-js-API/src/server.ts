import dotenv from 'dotenv';
dotenv.config();
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
      // Render.com provides HTTP — TLS is handled by their proxy
      http.createServer(app).listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
      });
    } else {
      // Local dev: use HTTPS with self-signed certs
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
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
