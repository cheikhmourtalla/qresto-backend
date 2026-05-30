"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../utils/logger"));
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const zodError = error;
                const errors = zodError.issues.map((e) => ({
                    field: e.path[1] || e.path[0],
                    message: e.message,
                }));
                logger_1.default.warn(`Validation échouée`, { method: req.method, url: req.originalUrl, errors });
                return res.status(400).json({
                    status: "fail",
                    errors,
                });
            }
            logger_1.default.error(`Erreur interne de validation`, { method: req.method, url: req.originalUrl });
            return res.status(500).json({ message: "Erreur interne de validation" });
        }
    };
};
exports.validate = validate;
