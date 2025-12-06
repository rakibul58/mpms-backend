import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { FILE_UPLOAD } from '../constants';
import { ApiError } from '../errors';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Memory storage for cloud uploads
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

// Upload configurations
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

export const uploadLocal = multer({
  storage,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
});

// Helper for single file upload
export const singleImage = uploadImage.single('image');
export const singleThumbnail = uploadImage.single('thumbnail');
export const singleDocument = uploadDocument.single('document');
export const multipleDocuments = uploadDocument.array('attachments', 5);
