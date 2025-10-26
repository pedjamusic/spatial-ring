import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/assets');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter - only accept images
// const fileFilter = (req, file, cb) => {
//   const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
//   if (allowedMimes.includes(file.mimetype)) {
//     // cb(null, true);
//     cb(ok ? null : new Error('[Photo, upload.js]Only JPEG/PNG/WebP images are allowed'), ok);
//   }
//   // } else {
//   //   cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
//   // }
// };
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Only JPEG/PNG/WebP images are allowed'), false);
};

// Create multer upload middleware
export const uploadAssetPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size (suitable for weak VM)
  }
}).single('photo'); // field name will be 'photo'

// Helper to delete old photo file
export const deletePhotoFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted old photo: ${filename}`);
    } catch (err) {
      console.error(`❌ Failed to delete photo ${filename}:`, err);
    }
  }
};
