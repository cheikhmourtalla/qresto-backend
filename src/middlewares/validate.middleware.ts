import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import logger from "../utils/logger";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        const errors = zodError.issues.map((e) => ({
          field: e.path[1] || e.path[0],
          message: e.message,
        }));
        logger.warn(`Validation échouée`, { method: req.method, url: req.originalUrl, errors });
        return res.status(400).json({
          status: "fail",
          errors,
        });
      }
      logger.error(`Erreur interne de validation`, { method: req.method, url: req.originalUrl });
      return res.status(500).json({ message: "Erreur interne de validation" });
    }
  };
};