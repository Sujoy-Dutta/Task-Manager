import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendError } from './utils/apiResponse';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

app.use(errorHandler);

export default app;
