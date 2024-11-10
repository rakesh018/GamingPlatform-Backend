const mongoose=require('./db');
const Game=require('./gameModel');
const lotteryResultSchema=new mongoose.Schema({
    gameType:{type:String,required:true,default:"lottery"},
    totalLotteriesSold:{type:Number,required:true,default:0},
    gameId:{type: mongoose.Schema.Types.ObjectId, required: true, ref: Game},
    result:{type:[Number],required:true/*,enum:[0,1,2]*/,default:[]},
    
},{
    timestamps:true,
});

module.exports=mongoose.model('LotteryResult',lotteryResultSchema);