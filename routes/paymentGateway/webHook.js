
exports.webHook=async(req,res)=>{
    const body=req.body;
    console.log(body);

    res.status(200).json({message:"Webhook received"});
}