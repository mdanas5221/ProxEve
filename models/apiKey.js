const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      enum: ["Development", "Production"],
      required: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

module.exports = ApiKey;
