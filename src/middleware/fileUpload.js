import multer from 'multer';

// Configure multer for memory storage (file will be in req.file.buffer)
const storage = multer.memoryStorage();

// File filter to only accept MP4 video files
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4 video files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    }
});

// Middleware wrapper for single file upload with error handling
export const uploadSingle = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            // Multer error occurred - pass to error handler
            // The error handler will set proper CORS headers
            return next(err);
        }
        // No error, continue to next middleware
        next();
    });
};

