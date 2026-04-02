import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
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

// storage for cover images
export const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gridlock/covers",
    allowed_formats: ["jpg", "jpeg", "gif", "webp"],
  } as any,
});

// Storage for product files (zip)
export const filesStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gridlock/files",
    resource_type: "raw",
    allowed_formats: ["zip", "rar"],
  } as any,
});

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

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /zip|rar|7z|tar|gz|x-7z-compressed|x-rar-compressed/;
  const mimeType = allowedTypes.test(file.mimetype);
  if (mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only archive files (zip, rar, 7z, tar, gz) are allowed"));
  }
};

export const uploadProductFiles = multer({
  storage: filesStorage,
  limits: {fileSize: 50 * 1024 * 1024},
  fileFilter: fileFilter
})


export const uploadCover = multer({
  storage: coverStorage,
  limits: {fileSize: 5 * 1024 * 1024},
  fileFilter: imageFilter
})


export const uploadFiles = multer({
  storage: filesStorage,
  limits: {fileSize: 50 * 1024 * 1024},
  fileFilter: fileFilter
})


export default cloudinary;
