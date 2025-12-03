import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from 'express';
import { ZaloPayService } from '../services/zaloPay.service';
import prisma from "../config/prisma";

export const createZaloPayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Received ZaloPay Create Order Request:", req.body);
    const { 
        amount, 
        description, 
        items, 
        app_user,
        shippingInfo,
        subTotal,
        tax,
        shippingCharges,
        total,
        orderItems
    } = req.body;

    // 1. Create Order in DB (Status: Pending Payment)
    // We need to map orderItems to the format expected by Prisma if not already
    // Assuming orderItems comes from frontend in correct format or we use items
    
    // Check if user exists (req.user should be populated by auth middleware)
    // But here we rely on app_user or req.body.userId if passed
    // The auth middleware is used in routes, so req.user should be available if we cast it
    // But let's use the passed data for now or check req.user
    
    // Note: In payment.routes.ts, this route is authenticated: router.post('/zalopay/create', authenticateUser, createZaloPayOrder);
    // So we can use (req as any).user
    const user = (req as any).user;
    
    if (!user) {
        throw new ApiError(401, "User not authenticated");
    }

    const newOrder = await prisma.order.create({
        data: {
            user_id: user.uid,
            shipping_info: shippingInfo,
            discount: 0, // Assuming discount is handled or passed
            shipping_charges: Number(shippingCharges),
            subtotal: Number(subTotal),
            tax: Number(tax),
            order_total: Number(total),
            status: "Pending Payment" // Or "Processing" but we want to distinguish
        }
    });

    // Create Order Items
    // orderItems from frontend might be different from Prisma structure
    // In CheckoutForm, items is mapped to ZaloPay format, but orderItems is also passed?
    // We need to make sure frontend passes orderItems
    
    if (orderItems && orderItems.length > 0) {
        const prismaItems = orderItems.map((item: any) => ({
            order_id: newOrder.order_id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
        }));
        
        await prisma.orderItem.createMany({
            data: prismaItems
        });
    }

    // 2. Call ZaloPay Service
    const result = await ZaloPayService.createOrder({
        amount,
        description,
        items,
        app_user: app_user || "DemoUser",
        embed_data: {
            order_id: newOrder.order_id,
            redirecturl: 'http://localhost:5173/order-success' // Redirect to success page
        }
    });


    
    console.log("ZaloPay Service Result:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("PaymentController Error:", error);
    next(error);
  }
};

export const zaloPayCallback = async (req: Request, res: Response) => {
  try {
    const { data: dataStr, mac: reqMac } = req.body;
    const isValid = ZaloPayService.verifyCallback(dataStr, reqMac);

    if (!isValid) {
      return res.json({ returncode: -1, returnmessage: 'mac not equal' });
    }

    const dataJson = JSON.parse(dataStr);
    console.log("ZaloPay Callback Data:", dataJson);

    // Update order status in DB
    // Extract order ID from embeddata
    let orderId = null;
    try {
        const embedData = JSON.parse(dataJson.embeddata);
        orderId = embedData.order_id;
    } catch (e) {
        console.error("Error parsing embeddata:", e);
    }

    if (orderId) {
        await prisma.order.update({
            where: { order_id: orderId },
            data: { status: "Processing" } // Update to Paid/Processing
        });
        console.log(`Order ${orderId} updated to Processing`);
    } else {
        console.warn("No order_id found in callback embeddata");
    }

    return res.json({ returncode: 1, returnmessage: 'success' });
  } catch (error: any) {
    console.error("ZaloPay Callback Error:", error);
    return res.json({ returncode: 0, returnmessage: error.message });
  }
};

export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.body;
        
        const order = await prisma.order.findUnique({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status === "Processing" || order.status === "Paid") {
             return res.status(200).json({ returncode: 1, returnmessage: "Order already paid", isprocessing: false });
        }

        // if (!order.app_trans_id) {
        //      return res.status(400).json({ message: "Order does not have ZaloPay transaction ID" });
        // }

        // const result = await ZaloPayService.queryOrder(order.app_trans_id);

        // if (result.returncode === 1) {
        //     await prisma.order.update({
        //         where: { order_id: orderId },
        //         data: { status: "Processing" }
        //     });
        // }

        // res.status(200).json(result);
        res.status(200).json({ message: "Manual check disabled" });
    } catch (error) {
        next(error);
    }
};
