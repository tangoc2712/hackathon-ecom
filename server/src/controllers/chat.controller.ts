import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const processMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { message, role } = req.body;

    if (!message) {
        return next(new ApiError(400, "Message is required"));
    }

    const userRole = role || 'admin'; // Default to admin/privileged if not specified
    const lowerMessage = message.toLowerCase();

    // User Role Logic
    if (userRole === 'user') {
        // Deny access to orders
        if (lowerMessage.includes('order')) {
             return res.status(200).json({
                success: true,
                message: "I can't access order data",
                data: []
            });
        }

        // Allow access to products
        // Simple keyword extraction for demo purposes
        // "Show me red t-shirts" -> looks for "red" and "t-shirt"
        const searchTerms = [];
        if (lowerMessage.includes('red')) searchTerms.push({ name: { contains: 'red', mode: 'insensitive' } });
        if (lowerMessage.includes('t-shirt')) searchTerms.push({ name: { contains: 't-shirt', mode: 'insensitive' } });
        if (lowerMessage.includes('blue')) searchTerms.push({ name: { contains: 'blue', mode: 'insensitive' } });
        if (lowerMessage.includes('shirt') && !lowerMessage.includes('t-shirt')) searchTerms.push({ name: { contains: 'shirt', mode: 'insensitive' } });
        
        if (searchTerms.length > 0 || lowerMessage.includes('product')) {
             const whereClause: any = {};
             if (searchTerms.length > 0) {
                 whereClause.AND = searchTerms;
             }

             const products = await prisma.product.findMany({
                 where: whereClause,
                 take: 5
             });

            return res.status(200).json({
                success: true,
                message: `Found ${products.length} products`,
                data: products
            });
        }
        
        // Default fallback for user
        return res.status(200).json({
            success: true,
            message: "I can help you find products. Try asking for 'red t-shirts'.",
            data: []
        });
    }

    // Admin/Default Role Logic
    if (lowerMessage.includes('order')) {
        const orders = await prisma.order.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { user: true }
        });
        return res.status(200).json({
            success: true,
            message: "Here are the recent orders",
            data: orders
        });
    }

    return res.status(200).json({
        success: true,
        message: "I can help you with orders. Try asking 'Show me recent orders'.",
        data: []
    });
});
