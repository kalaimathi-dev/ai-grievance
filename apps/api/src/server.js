import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDb();

  const app = createApp();
  const portCandidates = Array.from({ length: 6 }, (_, index) => env.PORT + index);

  for (const port of portCandidates) {
    try {
      const server = http.createServer(app);
      const io = new SocketIOServer(server, {
        cors: {
          origin: env.CORS_ORIGIN,
          credentials: true
        }
      });

      app.locals.io = io;

      io.on('connection', (socket) => {
        socket.emit('connected', { message: 'Connected to grievance triage socket server' });

        socket.on('disconnect', () => {
          // No-op for now.
        });
      });

      await new Promise((resolve, reject) => {
        server.once('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            reject(error);
            return;
          }

          reject(error);
        });

        server.listen(port, () => {
          console.log(`API server running on port ${port}`);
          resolve();
        });
      });

      return;
    } catch (error) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }

      console.warn(`Port ${port} is busy, trying ${port + 1}`);
    }
  }

  throw new Error(`Unable to start API server on ports ${portCandidates.join(', ')}`);
};

startServer().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});