import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";

const router = Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.get('/logout', authControllers.logout);
router.get('/refresh-access-token', authControllers.refreshAccessToken);

export default router;