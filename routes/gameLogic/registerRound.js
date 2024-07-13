const Game=require('../../models/gameModel');
exports.registerRound=async(gameName,roundDuration)=>{
    const newGame=new Game({
        gameType:gameName,
        roundDuration:roundDuration
    });
    let savedGame=await newGame.save();
    while(!savedGame._id){
        //try until round is registered
        savedGame=registerRound(gameName,roundDuration); 
    }
    return savedGame._id;
}