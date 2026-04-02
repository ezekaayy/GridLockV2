import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import "dotenv/config";

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//store files in memory/buffer
const storage = multer.memoryStorage();

// image filter
const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  if (mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// file filter

// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback,
// ) => {
//   const allowedTypes = /zip|rar|7z|tar|gz|x-7z-compressed|x-rar-compressed/;
//   const mimeType = allowedTypes.test(file.mimetype);
//   if (mimeType) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only archive files (zip, rar, 7z, tar, gz) are allowed"));
//   }
// };


const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.fieldname === "coverImage") {
    // Allow images for cover image field
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const mimeType = allowedImageTypes.test(file.mimetype);
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for cover image"));
    }
  } else if (file.fieldname === "files") {
    // Allow archives for product files field
    const allowedArchiveTypes = /zip|rar|7z|tar|gz|x-7z-compressed|x-rar-compressed/;
    const mimeType = allowedArchiveTypes.test(file.mimetype);
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only archive files (zip, rar, 7z, tar, gz) are allowed"));
    }
  } else {
    cb(new Error("Unexpected field name"));
  }
};

// upload to cloudinary
// Upload to Cloudinary from buffer
export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "raw" = "image"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

export const uploadProductFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});
export const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});
export const uploadFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

export default cloudinary;



