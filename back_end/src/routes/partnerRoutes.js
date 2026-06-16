import { Router } from "express";
import { searchPartners } from "../controllers/partnerController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// GET /api/partners ou /api/experts
router.get("/", requireAuth, searchPartners);

// GET /api/partners/search ou /api/experts/search
router.get("/search", requireAuth, searchPartners);

export default router;
