import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the temp directory exists
const tempDir = path.resolve('./public/temp');
// const tempDir = path.resolve('/tmp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("Entered Multer", file)
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // console.log("Entered Multer", file)
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });