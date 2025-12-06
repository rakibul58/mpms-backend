/* eslint-disable @typescript-eslint/no-explicit-any */
import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';

// Database connection promise (cached for serverless)
let isConnected = false;

const initializeServer = async (): Promise<void> => {
  if (!isConnected) {
    await connectDB();
    configureCloudinary();
    isConnected = true;
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async (): Promise<void> => {
    try {
      await initializeServer();

      const server = app.listen(config.port, () => {
        console.info(`
🚀 Server is running!
📡 Environment: ${config.env}
🔗 URL: http://localhost:${config.port}
📚 API: http://localhost:${config.port}${config.apiPrefix}
❤️  Health: http://localhost:${config.port}${config.apiPrefix}/health
        `);
      });

      // Graceful shutdown
      const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

      signals.forEach(signal => {
        process.on(signal, () => {
          console.info(`\n${signal} received. Shutting down gracefully...`);
          server.close(() => {
            console.info('Server closed.');
            process.exit(0);
          });
        });
      });

      process.on('unhandledRejection', (reason: Error) => {
        console.error('Unhandled Rejection:', reason);
        server.close(() => {
          process.exit(1);
        });
      });

      process.on('uncaughtException', (error: Error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

// For Vercel serverless - export a handler
export default async function handler(req: any, res: any) {
  await initializeServer();
  return app(req, res);
}
