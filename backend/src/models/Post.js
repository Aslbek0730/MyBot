import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    prompt: { type: String, default: "" },
    generatedText: { type: String, default: "" },
    channelId: { type: String, required: true },
    telegramMessageId: { type: String, default: "" },
    publishedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

export const Post = mongoose.model("Post", postSchema);
