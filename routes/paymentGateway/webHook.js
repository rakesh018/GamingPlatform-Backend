
exports.webHook=async(req,res)=>{
    console.log(req);

    res.status(200).json({message:"Webhook received"});
}