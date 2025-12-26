import { Router } from "express";
import { Channel } from "../models/Channel.js";
import { requireUser } from "../utils/auth.js";
import { fetchChannelInfo, verifyBotAdmin } from "../utils/telegram.js";

const router = Router();

router.get("/", requireUser, async (req, res) => {
  const channels = await Channel.find({ addedBy: req.user.telegramId })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ channels });
});

router.post("/connect", requireUser, async (req, res) => {
  try {
    const { channelId } = req.body || {};
    if (!channelId) {
      return res.status(400).json({ error: "Channel id is required" });
    }

    const info = await fetchChannelInfo(channelId);
    const isAdmin = await verifyBotAdmin(info.channelId);
    if (!isAdmin) {
      return res.status(400).json({ error: "Bot is not admin in channel" });
    }

    const saved = await Channel.findOneAndUpdate(
      { channelId: info.channelId, addedBy: req.user.telegramId },
      {
        channelId: info.channelId,
        title: info.title,
        username: info.username,
        addedBy: req.user.telegramId,
        botIsAdmin: true,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({ channel: saved });
  } catch (error) {
    return res.status(500).json({ error: "Channel connect failed" });
  }
});

export default router;
