import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Fix: Get actual backend path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// storage folder inside backend/src/storage
const storageRoot = path.join(__dirname, '..', 'storage');

// File Processors

const processAndSaveImages = async (file, folder) => {
  const safeName = file.filename;
  const originalPath = path.join(storageRoot, folder, 'original', safeName);

  const buffer = await fs.readFile(file.path);
  await fs.writeFile(originalPath, buffer);

  const sizes = [
    { suffix: 'extraSmall', width: 50, height: 50 },
    { suffix: 'small', width: 200 },
    { suffix: 'medium', width: 400 },
  ];

  for (const size of sizes) {
    const folderPath = path.join(storageRoot, folder, size.suffix);
    await fs.mkdir(folderPath, { recursive: true });

    const resizedPath = path.join(folderPath, safeName);
    await sharp(buffer).resize(size.width, size.height).toFile(resizedPath);
  }

  return safeName;
};

const processAndSavePDF = async (file, folder) => {
  const folderPath = path.join(storageRoot, folder, 'pdfs');
  await fs.mkdir(folderPath, { recursive: true });
  await fs.rename(file.path, path.join(folderPath, file.filename));
  return file.filename;
};

const processAndSaveDocs = async (file, folder) => {
  const dest = path.join(storageRoot, folder, 'docs');
  await fs.mkdir(dest, { recursive: true });
  await fs.rename(file.path, path.join(dest, file.filename));
  return file.filename;
};

// createUpload() with backward compatibility

export const createUpload = (folderNameOrMap) => {
  const isMap = typeof folderNameOrMap === "object";
  const folderMap = isMap ? folderNameOrMap : null;
  const defaultFolder = isMap ? null : folderNameOrMap;

  const upload = multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          const folder = isMap ? folderMap[file.fieldname] : defaultFolder;
          const folderPath = path.join(storageRoot, folder, "original");
          await fs.mkdir(folderPath, { recursive: true });
          return cb(null, folderPath);
        } catch (e) {
          return cb(e);
        }
      },

      filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^\w.-]/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
      }
    })
  });

  // SINGLE
  return {
    single: (fieldName) => async (req, res, next) => {
      upload.single(fieldName)(req, res, async (err) => {
        if (err) return res.status(500).json({ message: "Error uploading file", status: false });
        if (!req.file) return next();

        try {
          const folder = isMap ? folderMap[fieldName] : defaultFolder;
          req.uploadedFilename = await processAndSaveImages(req.file, folder);
          return next();
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Error processing image", status: false });
        }
      });
    },

    // MULTIPLE FILES
    multiple: (fieldName, maxCount) => async (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) return res.status(500).json({ message: "Error uploading files", status: false });

        try {
          req.uploadedFilenames = [];
          const folder = isMap ? folderMap[fieldName] : defaultFolder;

          for (const file of req.files || []) {
            let filename;

            if (file.mimetype.startsWith("image/")) {
              filename = await processAndSaveImages(file, folder);
            } else if (file.mimetype === "application/pdf") {
              filename = await processAndSavePDF(file, folder);
            } else {
              filename = await processAndSaveDocs(file, folder);
            }

            req.uploadedFilenames.push(filename);
          }

          return next();
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Error processing files", status: false });
        }
      });
    },

    // MULTIPLE FIELDS (logo + favicon etc.)
    fields: (fieldsArray) => async (req, res, next) => {
      upload.fields(fieldsArray)(req, res, async (err) => {
        if (err)
          return res.status(500).json({ message: "Error uploading files", status: false });

        try {
          req.uploadedFiles = {};

          for (const fieldName of Object.keys(req.files || {})) {
            req.uploadedFiles[fieldName] = [];

            const folder = isMap ? folderMap[fieldName] : defaultFolder;

            for (const file of req.files[fieldName]) {
              let filename;

              if (file.mimetype.startsWith("image/")) {
                filename = await processAndSaveImages(file, folder);
              } else if (file.mimetype === "application/pdf") {
                filename = await processAndSavePDF(file, folder);
              } else {
                filename = await processAndSaveDocs(file, folder);
              }

              req.uploadedFiles[fieldName].push(filename);
            }
          }

          return next();
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Error processing files", status: false });
        }
      });
    }
  };
};
