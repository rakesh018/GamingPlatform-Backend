const mongoose=require("./db")
const User=require("./userModels")
const otpSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:User},
    code:{type:String,required:true},
    purpose:{type:String,required:true,enum: ['registration', 'reset_password', 'edit_details']}, //purpose can be 'registration','reset_password','edit_details'
    createdAt:{type:Date,default:Date.now,expires:'5m'}, //expires automatically after 5 minutes
})

//This is a concept in mongoDB called TTL(Time-to-Live) which automatically deleted entried from db after certain period 

// Create a TTL index on the `createdAt` field which automatically expires after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });


module.exports=mongoose.model('OTP',otpSchema);