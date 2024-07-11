const axios=require('axios');

const url=`https://upigatewaypro.in/api/check-order-status`;
const payload={
    "user_token": "b35ba0b3c5a1aab880d03a6581321404",
    "order_id": "8787772321804"
}
const checkStatus=async()=>{
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
        const data = response.data;

        console.log(data);
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
checkStatus();