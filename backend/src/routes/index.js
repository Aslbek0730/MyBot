import { Router } from "express";
import authRoutes from "./auth.js";
import generateRoutes from "./generate.js";
import channelRoutes from "./channels.js";
import publishRoutes from "./publish.js";
import postRoutes from "./posts.js";
import statsRoutes from "./stats.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/generate", generateRoutes);
router.use("/channels", channelRoutes);
router.use("/publish", publishRoutes);
router.use("/posts", postRoutes);
router.use("/stats", statsRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
