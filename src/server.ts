import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Configure Cloudinary
    configureCloudinary();

    // Start server
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

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error) => {
      console.error('Unhandled Rejection:', reason);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
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
