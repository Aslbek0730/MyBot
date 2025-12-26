import { Router } from "express";
import { requireSuperAdmin, requireUser } from "../utils/auth.js";
import { publishToChannel } from "../utils/telegram.js";
import { Post } from "../models/Post.js";

const router = Router();

router.post("/", requireUser, requireSuperAdmin, async (req, res) => {
  try {
    const { channelId, text, prompt } = req.body || {};
    if (!channelId || !text) {
      return res.status(400).json({ error: "Channel id and text are required" });
    }

    const message = await publishToChannel(channelId, text);
    const post = await Post.create({
      prompt: prompt || "",
      generatedText: text,
      channelId: String(channelId),
      telegramMessageId: String(message.message_id),
      publishedBy: req.user.telegramId,
      createdAt: new Date()
    });

    return res.json({ messageId: message.message_id, postId: post._id });
  } catch (error) {
    return res.status(500).json({ error: "Publish failed" });
  }
});

export default router;
