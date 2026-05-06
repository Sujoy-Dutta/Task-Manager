import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyToken } from './utils/jwt';

export let io: Server;

export function initSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie ?? '';
    const token = cookieHeader.match(/taskmind_token=([^;]+)/)?.[1];
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.data.userId as string);
  });
}
