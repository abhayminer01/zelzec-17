const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage to process image before saving
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only .jpeg, .jpg, .png and .webp format allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Middleware to resize and convert images to WebP
const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const processedFiles = [];

        await Promise.all(
            req.files.map(async (file) => {
                const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".webp";
                const outputPath = path.join(uploadDir, uniqueName);

                await sharp(file.buffer)
                    .resize({
                        width: 1920,
                        height: 1080,
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                // Standardize file object to match what diskStorage usually returns
                processedFiles.push({
                    ...file,
                    filename: uniqueName,
                    path: outputPath,
                    destination: uploadDir,
                    mimetype: "image/webp",
                });
            })
        );

        // Replace req.files with the processed files
        req.files = processedFiles;
        next();
    } catch (error) {
        console.error("Error processing images:", error);
        res.status(500).json({ success: false, message: "Error processing uploaded images" });
    }
};


module.exports = {
    upload,
    processImages
};
