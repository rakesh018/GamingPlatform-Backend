const mongoose = require("./db");
const User = require("./userModels");
const querySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    uid:{type:String},
    hasSeen: { type: Boolean, required: true, default: false },
    message:{type:String,required:true,maxlength:500}
  },
  {
    timestamps: true,
  }
);
// Pre-save hook to populate uid from the User model
querySchema.pre("save", async function (next) {
  if (!this.uid) {
    try {
      const user = await User.findById(this.userId);
      if (user) {
        this.uid = user.uid;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});
module.exports = mongoose.model("Query", querySchema);
