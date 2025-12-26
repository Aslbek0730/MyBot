import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireUser } from "../utils/auth.js";
import { generateText } from "../services/aiService.js";

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/text", requireUser, limiter, async (req, res) => {
  try {
    const { topic, language, contentType } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const generatedText = await generateText({ topic, language, contentType });
    return res.json({ generatedText });
  } catch (error) {
    return res.status(500).json({ error: "Generation failed" });
  }
});

export default router;
