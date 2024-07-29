const mongoose=require('./db');
const User=require('./userModels');
const autoDepositSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:User},
    amount:{type:Number,required:true},
    status:{type:String,required:true,enum:['pending','completed','failed','rejected'],default:'pending'},
    phoneNumber:{type:Number,required:true},
},{
    timestamps:true
});

module.exports=mongoose.model('AutoDeposit',autoDepositSchema);