import { Router } from "express";
import { User } from "../models/User.js";
import { Channel } from "../models/Channel.js";
import { Post } from "../models/Post.js";
import { requireSuperAdmin, requireUser } from "../utils/auth.js";

const router = Router();

router.get("/", requireUser, requireSuperAdmin, async (req, res) => {
  const [users, channels, posts] = await Promise.all([
    User.countDocuments(),
    Channel.countDocuments(),
    Post.countDocuments()
  ]);

  return res.json({ users, channels, posts });
});

export default router;
