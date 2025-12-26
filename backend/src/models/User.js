import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    username: { type: String, default: "" },
    role: { type: String, enum: ["super_admin", "user"], default: "user" },
    firstUsedAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

export const User = mongoose.model("User", userSchema);
