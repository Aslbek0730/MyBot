import { Router } from "express";
import { Post } from "../models/Post.js";
import { requireUser } from "../utils/auth.js";

const router = Router();

router.get("/", requireUser, async (req, res) => {
  const filter = req.user.role === "super_admin"
    ? {}
    : { publishedBy: req.user.telegramId };

  const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
  return res.json({ posts });
});

export default router;
