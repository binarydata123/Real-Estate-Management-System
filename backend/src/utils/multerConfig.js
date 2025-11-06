/* eslint-disable security/detect-non-literal-fs-filename */
import multer from 'multer';
import fs from 'fs/promises';
import sharp from 'sharp';

const storage = (folderName) =>
  multer.diskStorage({
    destination: async (req, file, cb) => {
      const folderPath = `src/storage/${folderName}/original`;
      try {
        await fs.mkdir(folderPath, { recursive: true });
        cb(null, folderPath);
      } catch (error) {
        cb(error, folderPath);
      }
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^\w.-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

// Process and save uploaded images in multiple sizes
const processAndSaveImages = async (file, folderName) => {
  try {
    const sizes = [
      { suffix: 'extraSmall', width: 50, height: 50 },
      { suffix: 'small', width: 200 },
      { suffix: 'medium', width: 400 },
    ];

    const safeName = file.filename;
    const originalPath = `src/storage/${folderName}/original/${safeName}`;

    // Read file buffer
    const buffer = await fs.readFile(file.path);

    // Save original
    await fs.writeFile(originalPath, buffer);

    // Save resized images
    for (const size of sizes) {
      const folderPath = `src/storage/${folderName}/${size.suffix}`;
      await fs.mkdir(folderPath, { recursive: true });
      const resizedPath = `${folderPath}/${safeName}`;
      await sharp(buffer).resize(size.width, size.height).toFile(resizedPath);
    }

    return safeName;
  } catch (error) {
    console.error('Error processing image:', file.originalname, error);
    throw error;
  }
};

// Move PDF files
const processAndSavePDF = async (file, folderName) => {
  const destinationFolder = `src/storage/${folderName}/pdfs`;
  await fs.mkdir(destinationFolder, { recursive: true });
  await fs.rename(file.path, `${destinationFolder}/${file.filename}`);
  return file.filename;
};

// Move DOC/DOCX files
const processAndSaveDocs = async (file, folderName) => {
  const destinationFolder = `src/storage/${folderName}/docs`;
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
        if (err) return res.status(500).json({ message: 'Error uploading file', status: false });
        if (!req.file) return next();

        try {
          req.uploadedFilename = await processAndSaveImages(req.file, folderName);
          next();
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error processing image', status: false });
        }
      });
    },

    multiple: (fieldName, maxCount) => async (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) return res.status(500).json({ message: 'Error uploading files', status: false });

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
          next();
        } catch (error) {
          console.error('File processing error:', error);
          return res.status(500).json({ message: 'Error processing files', status: false });
        }
      });
    },
  };
};
