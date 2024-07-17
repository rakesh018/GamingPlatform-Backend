
const webHook=async(req,res)=>{
    // {
    //     order_id,status,remarks are received on this route by payment gateway upon successful payment
    // }
    const {order_id,status,remark1}=req.body;
    
    res.status(200).json({message:"Webhook received"});
}

module.exports=webHook;