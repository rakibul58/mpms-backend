import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { globalErrorHandler, notFoundHandler } from './shared/middlewares';
import router from './routes';

const app: Application = express();

// Security middleware
app.use(
  cors({
    origin: config.cors.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// API routes
app.use(config.apiPrefix, router);

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
