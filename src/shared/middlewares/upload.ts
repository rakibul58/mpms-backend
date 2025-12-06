import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { FILE_UPLOAD } from '../constants';
import { ApiError } from '../errors';

// Memory storage for cloud uploads (works on serverless)
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes: string[] = [...FILE_UPLOAD.ALLOWED_IMAGE_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (jpeg, png, gif, webp) are allowed'));
  }
};

// File filter for documents (pdf + images)
const documentFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes: string[] = [...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF and image files are allowed'));
  }
};

// Upload configurations (all use memory storage for serverless compatibility)
export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
  fileFilter: imageFilter,
});

export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
  fileFilter: documentFilter,
});

// For local development only - use memory storage on serverless
export const uploadLocal = multer({
  storage: memoryStorage,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
});

// Helper for single file upload
export const singleImage = uploadImage.single('image');
export const singleThumbnail = uploadImage.single('thumbnail');
export const singleDocument = uploadDocument.single('document');
export const multipleDocuments = uploadDocument.array('attachments', 5);
