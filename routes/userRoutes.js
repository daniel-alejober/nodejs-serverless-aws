import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
} from "../controllers/userController.js";
import verifyJWT from "../jwt/verifyJWT.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.post("/login", loginUser);
router.get("/logout", verifyJWT, logoutUser);

export default router;
