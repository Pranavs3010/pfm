const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    plaidTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    authorizedDate: Date,
    name: {
      type: String,
      required: true,
    },
    merchantName: String,
    category: {
      type: [String],
      default: ["Uncategorized"],
    },
    primaryCategory: {
      type: String,
      default: "Uncategorized",
      index: true,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    paymentChannel: String,
    transactionType: String,
    location: {
      address: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
      lat: Number,
      lon: Number,
    },
    notes: String,
    tags: [String],
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

// Indexes for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ account: 1, date: -1 });
transactionSchema.index({ user: 1, primaryCategory: 1, date: -1 });
transactionSchema.index({ user: 1, pending: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
