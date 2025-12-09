import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Fix: Get actual backend path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src folder
// const rootPath = __dirname;

// storage folder inside backend/src/storage
const storageRoot = path.join(__dirname, '..', 'storage');

const storage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(storageRoot, folderName, 'original');

      fs.mkdir(folderPath, { recursive: true })
        .then(() => cb(null, folderPath))
        .catch((error) => cb(error, folderPath));
    },

    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^\w.-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  });

// Process and save images
const processAndSaveImages = async (file, folderName) => {
  const safeName = file.filename;

  const originalPath = path.join(storageRoot, folderName, 'original', safeName);

  const buffer = await fs.readFile(file.path);
  await fs.writeFile(originalPath, buffer);

  const sizes = [
    { suffix: 'extraSmall', width: 50, height: 50 },
    { suffix: 'small', width: 200 },
    { suffix: 'medium', width: 400 },
  ];

  for (const size of sizes) {
    const folderPath = path.join(storageRoot, folderName, size.suffix);
    await fs.mkdir(folderPath, { recursive: true });

    const resizedPath = path.join(folderPath, safeName);
    await sharp(buffer).resize(size.width, size.height).toFile(resizedPath);
  }

  return safeName;
};



// Move PDF files
const processAndSavePDF = async (file, folderName) => {
  const folder = path.join(storageRoot, folderName, 'pdfs');
  await fs.mkdir(folder, { recursive: true });
  await fs.rename(file.path, path.join(folder, file.filename));
  return file.filename;
};

// Move DOC/DOCX files
const processAndSaveDocs = async (file, folderName) => {
  const destinationFolder = path.join(storageRoot, folderName, 'docs');
  await fs.mkdir(destinationFolder, { recursive: true });
  await fs.rename(file.path, `${destinationFolder}/${file.filename}`);
  return file.filename;
};

// Create Multer upload handlers
export const createUpload = (folderName) => {
  const upload = multer({ storage: storage(folderName) });

  return {
    single: (fieldName) => async (req, res, next) => {
      upload.single(fieldName)(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading file', status: false });
        }
        if (!req.file) {
          return next();
        }

        try {
          req.uploadedFilename = await processAndSaveImages(req.file, folderName);
          return next();
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error processing image', status: false });
        }
      });
    },

    multiple: (fieldName, maxCount) => async (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading files', status: false });
        }
        try {
          req.uploadedFilenames = [];
          if (req.files && req.files.length > 0) {
            for (const file of req.files) {
              console.log('Processing file:', file.originalname, 'Type:', file.mimetype);

              if (file.mimetype.startsWith('image/')) {
                const filename = await processAndSaveImages(file, folderName);
                req.uploadedFilenames.push(filename);
              } else if (file.mimetype === 'application/pdf') {
                const filename = await processAndSavePDF(file, folderName);
                req.uploadedFilenames.push(filename);
              } else if (
                file.mimetype === 'application/msword' ||
                file.mimetype ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ) {
                const filename = await processAndSaveDocs(file, folderName);
                req.uploadedFilenames.push(filename);
              } else {
                console.log('Unsupported file type:', file.mimetype);
              }
            }
          }
          return next();
        } catch (error) {
          console.error('File processing error:', error);
          return res.status(500).json({ message: 'Error processing files', status: false });
        }
      });
    },
  };
};
