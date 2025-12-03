const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

const config = {
  app_id: "553",
  key1: "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q",
  key2: "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3",
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder"
};

const embed_data = {
    redirecturl: 'http://localhost:5173/orders'
};

const items = [{
    itemid: "knb",
    itemname: "kim nguyen bao",
    itemprice: 198400,
    itemquantity: 1
}];

const transID = Math.floor(Math.random() * 1000000);
const order = {
  appid: config.app_id,
  appuser: "DemoUser",
  apptime: Date.now(), // miliseconds
  amount: 50000,
  apptransid: `${moment().format('YYMMDD')}_${transID}`,
  embeddata: JSON.stringify(embed_data),
  item: JSON.stringify(items),
  description: "ZaloPay Integration Demo",
  bankcode: "zalopayapp",
};

// appid|apptransid|appuser|amount|apptime|embeddata|item
const data = `${order.appid}|${order.apptransid}|${order.appuser}|${order.amount}|${order.apptime}|${order.embeddata}|${order.item}`;
order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

console.log("Sending order to ZaloPay Sandbox (AppID 553, v001 endpoint):", order);

// Use URLSearchParams to send as application/x-www-form-urlencoded
const params = new URLSearchParams();
for (const key in order) {
    params.append(key, order[key]);
}

axios.post(config.endpoint, params)
    .then(res => {
        console.log("Response:", res.data);
    })
    .catch(err => {
        console.error("Error:", err.response ? err.response.data : err.message);
    });
