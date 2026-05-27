import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary avec tes clés du .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'cms_automobile', // Dossier où seront stockées les photos
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    };
  },
});

export const upload = multer({ storage: storage });