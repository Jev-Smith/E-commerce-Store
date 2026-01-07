import { Router } from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import productControllers from "../controllers/product.controller.js";

const router = Router();

router.get('/', protectRoute, adminRoute, productControllers.getAllProducts);
router.get('/featured', getFeaturedProducts);

export default router;