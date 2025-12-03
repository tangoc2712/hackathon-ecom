import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment'; // We might need moment for formatting, or just use Date

export class ZaloPayService {
  private static config = {
    app_id: process.env.ZALO_APP_ID!,
    key1: process.env.ZALO_KEY1!,
    key2: process.env.ZALO_KEY2!,
    endpoint: process.env.ZALO_ENDPOINT!
  };

  static async createOrder(orderData: {
    app_user: string;
    amount: number;
    description: string;
    bank_code?: string;
    items?: any[];
    embed_data?: any;
  }) {
    const embed_data = {
        redirecturl: 'http://localhost:5173/orders', // Redirect back to frontend orders page
        ...orderData.embed_data
    };

    const items = orderData.items || [];
    const transID = Math.floor(Math.random() * 1000000);
    
    const order: any = {
      appid: this.config.app_id,
      appuser: orderData.app_user,
      apptime: Date.now(), // miliseconds
      amount: orderData.amount,
      apptransid: `${moment().format('YYMMDD')}_${transID}`,
      embeddata: JSON.stringify(embed_data),
      item: JSON.stringify(items),
      description: orderData.description,
      bankcode: orderData.bank_code || "zalopayapp",
    };

    // appid|apptransid|appuser|amount|apptime|embeddata|item
    const data = `${order.appid}|${order.apptransid}|${order.appuser}|${order.amount}|${order.apptime}|${order.embeddata}|${order.item}`;
    order.mac = crypto.createHmac('sha256', this.config.key1).update(data).digest('hex');

    console.log("ZaloPay Request Data:", order);

    try {
        const params = new URLSearchParams();
        for (const key in order) {
            params.append(key, order[key]);
        }

        const result = await axios.post(this.config.endpoint, params, {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });
      
      console.log("ZaloPay Response Data:", result.data);
      return { ...result.data, apptransid: order.apptransid };
    } catch (error: any) {
      console.error('ZaloPay create order error:', error.response?.data || error.message);
      throw error;
    }
  }



  static verifyCallback(dataStr: string, reqMac: string) {
    const mac = crypto.createHmac('sha256', this.config.key2).update(dataStr).digest('hex');
    return mac === reqMac;
  }
}
