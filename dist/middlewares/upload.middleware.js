"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_v2_1 = require("multer-storage-cloudinary-v2");
const cloudinary_1 = require("cloudinary");
// Configuration de Cloudinary avec tes clés du .env
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_v2_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'cms_automobile', // Dossier où seront stockées les photos
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        };
    },
});
exports.upload = (0, multer_1.default)({ storage: storage });
