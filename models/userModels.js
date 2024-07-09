const mongoose = require('./db');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true,required:true },
    isVerified: { type: Boolean, default: false }, //if otp is verfied yet or not
    isRestricted:{type:Boolean,default:false}, //if admin restricted this account or not
    balance:{type:Number,default:0}
},{
    timestamps:true, //store createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('User', userSchema);
