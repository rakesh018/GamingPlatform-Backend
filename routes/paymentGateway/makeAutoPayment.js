const Transaction = require("../../models/transactionModel");
const axios=require('axios');
const makeAutoPayment = async (req, res) => {
  //Makes an order order and gets link to qr code to which user can pay
  // {
  //     phoneNumber:Number,amount:Number,type:String(deposit,withdrawal)
  // }

  //Put the request in the DB and return the id generated
  const { phoneNumber, amount, type } = req.body;
  try {
    const newTransaction = new Transaction({
      userId: req.userId, //from token validation
      amount: amount,
      type: type,
      phoneNumber: phoneNumber,
    });

    //Saving transaction request to DB with default pending status
    const savedTransaction = await newTransaction.save();
    if (!savedTransaction) {
      throw new Error(
        JSON.stringify({ status: 400, message: `ERROR SAVING TRANSACTION` })
      );
    }

    //Creating new order request to payment gateway
    const gatewayResponse = await createOrder({
      phoneNumber: phoneNumber,
      amount: amount,
      order_id: savedTransaction._id,
      type: type,
    });
    res.json({ message: `QR CODE GENERATED`,paymentUrl:gatewayResponse.result.payment_url });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 400, message: `INTERNAL SERVER ERROR` };
    }

    res.status(parsedError.status).json({ message: parsedError.message });
  }
};

const createOrder = async (orderDetails) => {
  const url = `https://upigatewaypro.in/api/create-order`;

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
    user_token: `${process.env.UPI_TOKEN}`,
    amount: `${orderDetails.amount}`,
    order_id: `${orderDetails.order_id}`,
    redirect_url: `https://upii.instamedia.in`,
    remark1: `${orderDetails.type}`,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;

    if (response.status === 200 && data.status === true) {
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
