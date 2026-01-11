import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";

const router = Router();

router.post('/signup', authControllers.signup)
      .post('/login', authControllers.login);

router.get('/logout', authControllers.logout)
      .get('/refresh-access-token', authControllers.refreshAccessToken);
// router.get('/profile', getUserProfile);

export default router;