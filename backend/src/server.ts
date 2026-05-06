import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket';

const PORT = Number(process.env.PORT ?? 5000);

async function bootstrap(): Promise<void> {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`\n🚀  TaskMind API running on http://localhost:${PORT}`);
    console.log(`📄  Health check → http://localhost:${PORT}/health`);
    console.log(`🌍  Environment  → ${process.env.NODE_ENV ?? 'development'}\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    httpServer.close(() => {
      console.log('🔴  HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
