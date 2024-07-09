const mongoose=require("mongoose");

mongoose.connect(process.env.DB_URL,(err)=>{
    if(err){
        console.log(`Error connecting to database : ${err}`);
    }
    else{
        console.log('Connected to Database');
    }
})

module.exports=mongoose;