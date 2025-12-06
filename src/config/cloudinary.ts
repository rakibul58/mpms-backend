import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';

export const configureCloudinary = (): void => {
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    console.info('✅ Cloudinary configured successfully');
  } else {
    console.warn('⚠️ Cloudinary not configured - file uploads will use local storage');
  }
};

export { cloudinary };
