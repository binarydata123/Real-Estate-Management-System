import multer from "multer";
import path from "path";
import fs from "fs/promises";

const uploadFolder = path.join(process.cwd(), "../frontend/public/uploads/profiles");

// Ensure upload folder exists
(async () => {
  try {
    await fs.mkdir(uploadFolder, { recursive: true });
  } catch (err) {
    console.error("Error ensuring upload folder:", err);
  }
})();

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadProfilePicture = multer({ storage });
