const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionName: {
    type: String,
    required: true,
    unique: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Session",
  sessionSchema
);