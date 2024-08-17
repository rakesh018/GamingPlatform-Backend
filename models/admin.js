const mongoose=require('./db');

const adminSchema=new mongoose.Schema({
    user:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    upi:{type:String},
    qr:{type:String},
});

module.exports=mongoose.model('Admin',adminSchema);