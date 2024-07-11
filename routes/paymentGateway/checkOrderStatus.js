const axios=require('axios');

const url=;
const payload=;
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