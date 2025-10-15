const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plaidAccountId: {
      type: String,
      required: true,
    },
    plaidItemId: {
      type: String,
      required: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      select: false,
    },
    institutionId: String,
    institutionName: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    officialName: String,
    accountType: {
      type: String,
      enum: ["depository", "credit", "loan", "investment", "other"],
      required: true,
    },
    accountSubtype: String,
    currentBalance: {
      type: Number,
      default: 0,
    },
    availableBalance: Number,
    limit: Number,
    currency: {
      type: String,
      default: "USD",
    },
    mask: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
accountSchema.index({ user: 1, isActive: 1 });
accountSchema.index({ plaidItemId: 1, plaidAccountId: 1 }, { unique: true });

module.exports = mongoose.model("Account", accountSchema);
