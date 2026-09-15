import express from "express";

const router = express.Router();

import { register, login, getProfile, getNewToken, logout } from "../controllers/auth.controller.js"
import authenticate from "../middlewares/auth.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.get("/refresh-token", getNewToken);
router.get("/logout", logout);

export default router;
