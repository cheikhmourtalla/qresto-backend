"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const logger_1 = __importDefault(require("../utils/logger"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        logger_1.default.info(`Fichier accepté`, { filename: file.originalname, mimetype: file.mimetype });
        cb(null, true);
    }
    else {
        logger_1.default.warn(`Fichier rejeté : type non autorisé`, { filename: file.originalname, mimetype: file.mimetype });
        cb(new Error("Le fichier doit être une image"), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: fileFilter,
});
