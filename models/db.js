const mongoose=require("mongoose");

mongoose.connect(process.env.DB_URL).then(()=>{
    console.log('Connected to database');
}).catch((error)=>{
    console.log(`Error connecting to database : ${error}`);
})

module.exports=mongoose;