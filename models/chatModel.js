const mongoose = require("./db");
const User = require("./userModels"); // Assuming you have a User model

const chatSchema = new mongoose.Schema(
  {
    hasSeen: { type: Boolean, required: true, default: false },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    uid: { type: String },  // Add uid field
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate 'uid' based on sender or receiver
chatSchema.pre('save', async function (next) {
  try {
    const chat = this;

    // If sender is not "admin", fetch uid from User model based on sender
    if (chat.sender !== "admin") {
      const user = await User.findById(chat.sender);
      if (user) {
        chat.uid = user.uid; // Assuming the user model has a uid field
      } else {
        return next(new Error("Sender not found"));
      }
    }

    // If receiver is not "admin", fetch uid from User model based on receiver
    else if (chat.receiver !== "admin") {
      const user = await User.findById(chat.receiver);
      if (user) {
        chat.uid = user.uid; // Assuming the user model has a uid field
      } else {
        return next(new Error("Receiver not found"));
      }
    }

    next(); // Proceed with the save
  } catch (error) {
    return next(error); // Pass the error to Mongoose
  }
});

module.exports = mongoose.model("Chat", chatSchema);
