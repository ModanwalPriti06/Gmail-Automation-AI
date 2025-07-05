const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema({
  threadId: String,
  to: String,
  subject: String,
  snippet: String,
  lastSent: Date,
  followUpCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["waiting", "replied", "completed"],
    default: "waiting",
  },
});

module.exports = mongoose.model("FollowUp", followUpSchema);
