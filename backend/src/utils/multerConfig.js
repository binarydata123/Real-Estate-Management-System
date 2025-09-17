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
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

const processAndSaveImages = async (file, folderName) => {
    const sizes = [
        { suffix: 'extraSmall', width: 50, height: 50 },
        { suffix: 'small', width: 200 },
        { suffix: 'medium', width: 400 }
    ];

    const imagePath = file.path;
    const fileName = file.filename;
    const originalFilePath = `src/storage/${folderName}/original/${fileName}`;

    // Save the original image
    const originalImageBuffer = await sharp(imagePath).toBuffer();
    await fs.writeFile(originalFilePath, originalImageBuffer);

    // Process and save resized images
    for (const size of sizes) {
        const resizedImageBuffer = await sharp(originalFilePath).resize(size.width, size.height).toBuffer();
        const folderPath = `src/storage/${folderName}/${size.suffix}`;
        const filePath = `${folderPath}/${fileName}`;
        await fs.mkdir(folderPath, { recursive: true });
        await fs.writeFile(filePath, resizedImageBuffer);
    }

    return fileName;
};

const processAndSavePDF = async (file, folderName) => {
    const filePath = file.path;
    const fileName = file.filename;
    const destinationFolder = `src/storage/${folderName}/pdfs`;

    await fs.mkdir(destinationFolder, { recursive: true });
    const pdfFilePath = `${destinationFolder}/${fileName}`;
    await fs.rename(filePath, pdfFilePath);
    return fileName;
};

const processAndSaveDocs = async (file, folderName) => {
    const filePath = file.path;
    const fileName = file.filename;
    const destinationFolder = `src/storage/${folderName}/docs`;

    await fs.mkdir(destinationFolder, { recursive: true });
    const docFilePath = `${destinationFolder}/${fileName}`;
    await fs.rename(filePath, docFilePath);
    return fileName;
};

export const createUpload = (folderName) => {
    const upload = multer({ storage: storage(folderName) });
    return {
        single: (fieldName) => async (req, res, next) => {
            upload.single(fieldName)(req, res, async (err) => {
                console.log(err);
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

        fields: (fields) => async (req, res, next) => {
            upload.fields(fields)(req, res, async (err) => {

                if (err) return res.status(500).json({ message: 'Error uploading files', status: false });
                try {
                    for (const fieldName of Object.keys(req.files)) {
                        const files = req.files[String(fieldName)];
                        for (const file of files) {

                            // Check if the file is an image or a PDF and process accordingly
                            if (file.mimetype.startsWith('image/')) {
                                await processAndSaveImages(file, folderName);  // Process images
                            } else if (file.mimetype === 'application/pdf') {
                                await processAndSavePDF(file, folderName);  // Process PDFs
                            } else if (
                                file.mimetype === 'application/msword' ||
                                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ) {
                                await processAndSaveDocs(file, folderName);
                            } else {
                                console.log('Unsupported file type:', file.mimetype);
                            }
                        }
                    }
                    next();
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Error processing files', status: false });
                }
            });
        },

        multiple: (fieldName, maxCount) => async (req, res, next) => {
            upload.array(fieldName, maxCount)(req, res, async (err) => {
                if (err) return res.status(500).json({ message: 'Error uploading files', status: false });
                try {
                    if (req.files && req.files.length > 0) {
                        req.uploadedFilenames = [];
                        for (const file of req.files) {
                            const filename = await processAndSaveImages(file, folderName);
                            req.uploadedFilenames.push(filename);
                        }
                    }
                    next();
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Error processing files', status: false });
                }
            });
        }
    };
};
