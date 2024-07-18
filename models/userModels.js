const mongoose = require('./db');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, /*unique: true,*/required:true },
    isVerified: { type: Boolean, default: false }, //if otp is verfied yet or not
    isRestricted:{type:Boolean,default:false}, //if admin restricted this account or not
    balance:{type:Number,default:0},
    referralCode:{type:String,required:true,unique:true},
    referredBy:{type:mongoose.Schema.Types.ObjectId,default:null,ref:'User'} ,//refers to User table itself and is null if user does not provide referal code during registration
    referralBalance:{type:Number,required:true,default:0}
},{
    timestamps:true, //store createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('User', userSchema);
