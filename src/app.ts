import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { globalErrorHandler, notFoundHandler } from './shared/middlewares';

const app: Application = express();

// Security middleware
const allowedOrigins = [config.cors.frontendUrl, 'http://localhost:3000', 'http://localhost:3001'];

// Add Vercel preview URLs pattern
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed or is a Vercel preview URL
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.vercel.sh')
    ) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// API routes
app.use(config.apiPrefix, routes);

// Root route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to MPMS API',
    version: '1.0.0',
    documentation: `${config.apiPrefix}/health`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

export default app;
