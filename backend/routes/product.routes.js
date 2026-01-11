import { Router } from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import productControllers from "../controllers/product.controller.js";

const router = Router();

router.get('/', protectRoute, adminRoute, productControllers.getAllProducts)
      .get('/featured', productControllers.getFeaturedProducts);

router.post('/', protectRoute, adminRoute, productControllers.createProduct);

export default router;