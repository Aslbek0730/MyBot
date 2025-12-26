import { User } from "../models/User.js";

export async function requireUser(req, res, next) {
  const telegramId = req.header("x-telegram-id");
  if (!telegramId) {
    return res.status(401).json({ error: "Missing telegram id" });
  }

  const user = await User.findOne({ telegramId }).lean();
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  return next();
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin only" });
  }
  return next();
}
