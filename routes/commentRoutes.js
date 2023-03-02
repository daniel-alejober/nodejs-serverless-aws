import express from "express";
import verifyJWT from "../jwt/verifyJWT.js";
import {
  createComment,
  commentsByUser,
  getComment,
  getAllComents,
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/create-comment", verifyJWT, createComment);
router.get("/user-comments", verifyJWT, commentsByUser);
router.get("/:commentId", getComment);
router.delete("/:commentId", deleteComment);
router.put("/:commentId", updateComment);
router.get("/", getAllComents);

export default router;
