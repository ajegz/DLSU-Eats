const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const reviewExts = [...imageExts, '.mp4', '.webm', '.ogg', '.mov'];

function extensionFilter(allowedExtensions) {
  return (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file type uploaded.'));
    }
    cb(null, true);
  };
}

const avatarUpload = multer({
  storage,
  fileFilter: extensionFilter(imageExts),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const reviewMediaUpload = multer({
  storage,
  fileFilter: extensionFilter(reviewExts),
  limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = {
  avatarUpload,
  reviewMediaUpload
};
