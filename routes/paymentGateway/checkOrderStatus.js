require("dotenv").config();
const axios = require("axios");

const url = `https://upigatewaypro.in/api/check-order-status`;

const payload = {
  user_token: `${process.env.UPI_TOKEN}`,
  order_id: "1853879",
};

const checkStatus = async () => {
  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;

    console.log(data);
    if (data.result.status === "SUCCESS") {
      console.log(`payment done`);
      return data;
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
checkStatus();
