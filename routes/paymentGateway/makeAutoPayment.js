const AutoDeposit = require("../../models/autoDeposit");
const axios=require('axios');
const makeAutoPayment = async (req, res) => {
  //Currently auto payment gateway is not yet configured so no response from here
  return res.json({message:'Automatic payment will be available soon'});

  
  //Makes an order order and gets link to qr code to which user can pay
  // {
  //     phoneNumber:Number,amount:Number,type:String(deposit,withdrawal)
  // }

  //Put the request in the DB and return the id generated
  const { phoneNumber, amount } = req.body;
  try {
    const newAutoDeposit = new AutoDeposit({
      userId: req.userId, //from token validation
      amount: amount,
      phoneNumber: phoneNumber,
    });

    //Saving AutoDeposit request to DB with default pending status
    const savedAutoDeposit = await newAutoDeposit.save();
    if (!savedAutoDeposit) {
      throw new Error(
        JSON.stringify({ status: 400, message: `ERROR SAVING AutoDeposit` })
      );
    }

    //Creating new order request to payment gateway
    const gatewayResponse = await createOrder({
      phoneNumber: phoneNumber,
      amount: amount,
      order_id: savedAutoDeposit._id,
      uid:req.uid,
    });
    res.json({ message: `QR CODE GENERATED`,paymentUrl:gatewayResponse.data.payment_url });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 400, message: `INTERNAL SERVER ERROR` };
    }
    console.error(`ERROR MAKING AUTO PAYMENT `, error)
    res.status(parsedError.status).json({ message: parsedError.message });
  }
};

const createOrder = async (orderDetails) => {
  const url = `https://api.ekqr.in/api/create_order`;

  // let payload = {
  //   customer_mobile: `1234567890`,
  //   user_token: `${process.env.UPI_TOKEN}`,
  //   amount: `1`,
  //   order_id: `1853876`, //unique orderId
  //   redirect_url: "https://upii.instamedia.in", //put the link of your web page to which user is to be redirected.
  //   remark1: "testremark",
  // };
  //ABOVE IS THE FORMAT FOR PAYLOAD DATA

  const payload = {
    customer_mobile: `${orderDetails.phoneNumber}`,
    key: `${process.env.UPI_TOKEN}`,
    amount: `${orderDetails.amount}`,
    client_txn_id: `${orderDetails.order_id}`,
    redirect_url: `https://upii.instamedia.in`,
    udf1:`Deposit id : ${orderDetails.order_id}`,
    p_info:'Deposit',
    customer_name:`${orderDetails.uid}`,
    customer_email:'rakhi@gmail.com'
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data=response.data;
    console.log(data);
    if (data.status === true) {
      return data;
    } else {
      throw new Error(JSON.stringify({status:500,message:`INTERNAL SERVER ERROR`}));
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
module.exports = makeAutoPayment;
