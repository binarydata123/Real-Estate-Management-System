// middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure folder exists
const uploadFolder = path.join(process.cwd(), "../frontend/public/uploads/profiles");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadProfilePicture = multer({ storage });
