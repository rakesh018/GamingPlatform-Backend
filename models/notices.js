const mongoose = require("./db");

const noticeSchema = new mongoose.Schema(
  {
    notice: { type: String, required: true, unique: true },
    noticeid:{type:String,unique:true,required:true}
  }
);

module.exports = mongoose.model("Notice", noticeSchema);
