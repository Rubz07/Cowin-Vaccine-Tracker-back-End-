const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: String,
    pincode: String,
    categoery: Array,
    status: Boolean,
    isMessageSend: Boolean,
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const users = mongoose.model("users", userSchema);

module.exports = users;
