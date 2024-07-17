require("dotenv").config();
const axios = require("axios");
const url = `https://upigatewaypro.in/api/create-order`;

let payload = {
  customer_mobile: `1234567890`,
  user_token: `${process.env.UPI_TOKEN}`,
  amount: `1`,
  order_id: `1853abc888`,
  redirect_url: "https://upii.instamedia.in",
  remark1: "testremark",
};             
//ABOVE IS THE FORMAT FOR PAYLOAD DATA
const createOrder = async () => {
  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;

    if (response.status === 200 && data.status === true) {
      console.log(data);
      return data;
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

module.exports=createOrder;
