import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";

const router = Router();

router.get('/signup', authControllers.signup);

router.get('/login', authControllers.login);

router.get('/logout', authControllers.logout);

export default router;