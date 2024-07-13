const mongoose=require('./db');

const gameSchema=new mongoose.Schema({
    gameType:{type:String,required:true,enum:['coinFlip','stockTrader']},
    roundDuration:{type:Number,required:true,enum:[1,3,5,10]},
    result:{type:Number,required:true,enum:[0,1,2],default:2},
},{
    timestamps:true,
});

module.exports=mongoose.model('Game',gameSchema);

//Mapping of numbers to outcomes
//COIN FLIP GAME : 1 means head and 0 means tail
//STOCK TRADER GAME : 1 means up and 0 means down
//2 means undeclared yet 

//Why values instead of strings for results?
//In the same table for 2 different games, we will have different kind of results which is not good for us 

//So mapping outcomes to numbers is the better way as it is scalable and consistent.