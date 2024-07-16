require("dotenv").config();
const axios = require("axios");
const url = `https://upigatewaypro.in/api/create-order`;
let payload = {
  customer_mobile: `8143541640`,
  user_token: `${process.env.UPI_TOKEN}`,
  amount: `1`,
  order_id: `1853876`,
  redirect_url: "https://upii.instamedia.in",
  remark1: "testremark",
};
console.log(payload);
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
createOrder();
