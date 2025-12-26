import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    channelId: { type: String, required: true },
    title: { type: String, default: "" },
    username: { type: String, default: "" },
    addedBy: { type: String, required: true },
    botIsAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

channelSchema.index({ channelId: 1, addedBy: 1 }, { unique: true });

export const Channel = mongoose.model("Channel", channelSchema);
