import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Postchannel",
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  superAdminId: process.env.SUPER_ADMIN_TELEGRAM_ID || "",
  allowTestAuth: process.env.ALLOW_TEST_AUTH === "true"
};
