import { Router } from "express";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { validateInitData } from "../utils/telegram.js";

const router = Router();

router.post("/telegram", async (req, res) => {
  try {
    const { initData, user: testUser } = req.body || {};

    if (env.allowTestAuth && testUser) {
      const telegramId = String(testUser.id);
      const role = telegramId === env.superAdminId ? "super_admin" : "user";
      const now = new Date();

      const user = await User.findOneAndUpdate(
        { telegramId },
        {
          telegramId,
          firstName: testUser.first_name || "",
          lastName: testUser.last_name || "",
          username: testUser.username || "",
          role,
          $setOnInsert: { firstUsedAt: now },
          lastUsedAt: now
        },
        { upsert: true, new: true }
      ).lean();

      return res.json({ role: user.role, telegramId: user.telegramId });
    }

    const result = validateInitData(initData);
    if (!result.ok) {
      return res.status(401).json({ error: result.reason });
    }

    const userRaw = result.data.user;
    if (!userRaw) {
      return res.status(400).json({ error: "Missing user data" });
    }

    const userData = JSON.parse(userRaw);
    const telegramId = String(userData.id);
    const role = telegramId === env.superAdminId ? "super_admin" : "user";
    const now = new Date();

    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        telegramId,
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        username: userData.username || "",
        role,
        $setOnInsert: { firstUsedAt: now },
        lastUsedAt: now
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({ role: user.role, telegramId: user.telegramId });
  } catch (error) {
    return res.status(500).json({ error: "Auth failed" });
  }
});

export default router;
