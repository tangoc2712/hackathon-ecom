const axios = require('axios');

const API_URL = 'http://localhost:4000/api/v1';
const jwt = require('jsonwebtoken');
const secret = 'default_secret_key_change_me'; 

// Valid UUIDs from DB
const USER_ID = "86cae1f1-bd73-4b1f-b483-4a3c7e3406e2";
const PRODUCT_ID = "0006b62a-63f5-44c8-8050-c6d41cb9387e";

const token = jwt.sign({ user_id: USER_ID, role: 'user' }, secret);

async function testIntegration() {
    try {
        console.log("Testing ZaloPay Integration...");

        const orderData = {
            amount: 50000,
            description: "Integration Test Order",
            items: [{
                itemid: PRODUCT_ID,
                itemname: "Test Product",
                itemprice: 50000,
                itemquantity: 1
            }],
            app_user: "test_user_uid",
            shippingInfo: {
                address: "123 Test St",
                city: "Test City",
                state: "Test State",
                country: "Test Country",
                pinCode: "123456",
                phone: "1234567890"
            },
            subTotal: 50000,
            tax: 0,
            shippingCharges: 0,
            total: 50000,
            orderItems: [{
                productId: PRODUCT_ID,
                name: "Test Product",
                price: 50000,
                quantity: 1,
                photo: "http://example.com/photo.jpg",
                stock: 10
            }]
        };

        const response = await axios.post(`${API_URL}/payments/zalopay/create`, orderData, {
            headers: {
                'Cookie': `token=${token}`
            }
        });

        console.log("Response:", response.data);

        if (response.data.returncode === 1 && response.data.orderurl) {
            console.log("SUCCESS: ZaloPay Order Created and URL returned.");
        } else {
            console.log("FAILURE: Unexpected response format.");
        }

    } catch (error) {
        console.error("Integration Test Failed:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        if (error.response && error.response.status === 500) {
             console.error("Server Error Details:", error.response.data);
        }
    }
}

testIntegration();
