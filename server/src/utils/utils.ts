import prisma from "../config/prisma";
import { OrderItemType } from "../types/types";

export const reduceStock = async (orderItems: OrderItemType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const product = await prisma.product.findUnique({
            where: { product_id: item.productId }
        });
        
        if (!product) throw new Error('Product not found');
        
        // Ensure stock is not null before subtraction, default to 0 if null
        const currentStock = product.stock || 0;
        
        await prisma.product.update({
            where: { product_id: item.productId },
            data: { stock: currentStock - item.quantity }
        });
    }
}