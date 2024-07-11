const axios=require("axios");
const url=`https://upigatewaypro.in/api/create-order`;
const api=`b35ba0b3c5a1aab880d03a6581321404`;

const payload={
    "customer_mobile": "8143541640",
    "user_token": "b35ba0b3c5a1aab880d03a6581321404",
    "amount": "1",
    "order_id": "8787772321804",
    "redirect_url": "https://upii.instamedia.in",
    "remark1" : "testremark",
    "remark2" : "testremark2",
}
const createOrder=async()=>{
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
        const data = response.data;
    
        if (response.status === 200 && data.status === true) {
            console.log(data);
            return data;
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}
createOrder();

