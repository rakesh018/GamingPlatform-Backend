const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true,required:true },
    isVerified: { type: Boolean, default: true }, 
    balance:{type:Number,default:0}
},{
    timestamps:true, //store createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('User', userSchema);
