import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";
import { NewOrderRequestBody, RequestWithUser } from "../types/types";
import { ApiError } from "../utils/ApiError";
import { reduceStock } from "../utils/utils";

// Create New Order
export const newOrder = asyncHandler(async (req: Request<{}, {}, NewOrderRequestBody>, res: Response, next: NextFunction) => {

    const { orderItems, shippingInfo, discount, shippingCharges, subTotal, tax, total } = req.body;

    if (!shippingCharges || !shippingInfo || !subTotal || !tax || !total) {
        return next(new ApiError(400, 'Please fill all fields'));
    }

    const user = (req as RequestWithUser).user;

    const newOrder = await prisma.order.create({
        data: {
            user_id: user.uid, // Use Firebase UID
            shipping_info: shippingInfo,
            discount: Number(discount),
            shipping_charges: Number(shippingCharges),
            subtotal: Number(subTotal),
            tax: Number(tax),
            order_total: Number(total),
            status: "Processing"
        }
    });

    await reduceStock(orderItems);

    const items = orderItems.map(item => ({
        order_id: newOrder.order_id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
    }));
    
    await prisma.orderItem.createMany({
        data: items
    });

    return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
    })
})

// Update order status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, status } = req.body;

    const order = await prisma.order.findUnique({
        where: { order_id: orderId }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    await prisma.order.update({
        where: { order_id: orderId },
        data: { status }
    });

    res.status(200).json({ success: true, message: 'Order status updated successfully' });
});

// Delete Order
export const deleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
        where: { order_id: orderId }
    });

    if (!order) return next(new ApiError(404, 'Order not found'));

    await prisma.order.delete({
        where: { order_id: orderId }
    });

    return res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});

// Get User Orders
export const getUserOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;

    const orders = await prisma.order.findMany({
        where: { user_id: user.user_id }
    });

    return res.status(200).json({
        success: true,
        orders
    });
});

// Get All Orders
export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany(); 
    // Populate user is not directly possible like Mongoose, need to include relation.
    // But I haven't defined relation in schema yet. 
    // I will add include: { user: true } after updating schema.

    return res.status(200).json({
        success: true,
        orders
    });
});

// Get Single Order
export const getOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
        where: { order_id: orderId }
    });

    if (!order) return next(new ApiError(404, 'Order not found'));

    return res.status(200).json({
        success: true,
        order
    });
});