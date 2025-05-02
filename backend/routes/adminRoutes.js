import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import { getAdminStats } from "../controllers/statsController.js";

const router = express.Router();

// Protejăm toate rutele cu middleware-ul de verificare a token-ului
router.use(verifyToken);
router.use(isAdmin);

// Ruta pentru statistici admin - protejată de ambele middleware-uri
router.get("/stats", getAdminStats);

export default router;
