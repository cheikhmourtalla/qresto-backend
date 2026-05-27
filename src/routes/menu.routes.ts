import { Router } from "express";
import { getPublicMenu } from "../controllers/menu.controller";

const router = Router();

router.get("/:slug", getPublicMenu);

export default router;