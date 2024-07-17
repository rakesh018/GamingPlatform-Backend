const mongoose=require('./db');
const User=require('./userModels');
const transactionSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:User},
    amount:{type:Number,required:true},
    type : {type:String,required:true,enum:['deposit','withdrawal']},
    status:{type:String,required:true,enum:['pending','completed','failed','rejected'],default:'pending'},
    phoneNumber:{type:Number,required:true},
},{
    timestamps:true
});

const Transaction=new mongoose.model('Transaction',transactionSchema);

module.exports=Transaction;