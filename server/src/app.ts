import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import reflectionRoutes from './routes/reflectionRoutes';
import achievementRoutes from './routes/achievementRoutes';
import contentRoutes from './routes/contentRoutes';
import wellnessRoutes from './routes/wellnessRoutes';
import config from './config/config';
import { logger } from './config/logger';

// Initialize Express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Body parser, reading data from body into req.body
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Development logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  // Log to Winston in production
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
}

// Rate limiting for API
app.use('/api', apiLimiter);

// API routes
const API_PREFIX = '/api/v1';

// Health check endpoint (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// API routes with versioning
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/reflections`, reflectionRoutes);
app.use(`${API_PREFIX}/achievements`, achievementRoutes);
app.use(`${API_PREFIX}/content`, contentRoutes);
app.use(`${API_PREFIX}/wellness`, wellnessRoutes);

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorHandler);

export default app;
