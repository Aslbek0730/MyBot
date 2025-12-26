import crypto from "crypto";
import { env } from "../config/env.js";

export function validateInitData(initData) {
  if (!initData || !env.botToken) {
    return { ok: false, reason: "Missing init data or bot token" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    return { ok: false, reason: "Missing hash" };
  }

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(env.botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    return { ok: false, reason: "Invalid hash" };
  }

  return { ok: true, data: Object.fromEntries(params.entries()) };
}

let cachedBotId = null;

async function telegramApi(method, payload) {
  const url = `https://api.telegram.org/bot${env.botToken}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.ok) {
    const error = new Error(data.description || "Telegram API error");
    error.telegram = data;
    throw error;
  }
  return data.result;
}

export async function getBotId() {
  if (cachedBotId) return cachedBotId;
  const result = await telegramApi("getMe", {});
  cachedBotId = String(result.id);
  return cachedBotId;
}

export async function verifyBotAdmin(channelId) {
  const botId = await getBotId();
  const member = await telegramApi("getChatMember", {
    chat_id: channelId,
    user_id: botId
  });
  return member && ["administrator", "creator"].includes(member.status);
}

export async function fetchChannelInfo(channelId) {
  const chat = await telegramApi("getChat", { chat_id: channelId });
  return {
    channelId: String(chat.id),
    title: chat.title || "",
    username: chat.username || ""
  };
}

export async function publishToChannel(channelId, text) {
  const message = await telegramApi("sendMessage", {
    chat_id: channelId,
    text
  });
  return message;
}
