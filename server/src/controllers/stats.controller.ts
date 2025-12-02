// controllers/statsController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all orders
        const ordersPromise = prisma.order.findMany({
            include: { user: true, orderItems: true }
        });

        // Calculate user gender demographics
        const userGenderDemographicPromise = prisma.user.groupBy({
            by: ['gender'],
            _count: {
                gender: true
            }
        });

        // Fetch total products
        const totalProductsPromise = prisma.product.count();

        // Fetch total coupons
        const totalCouponsPromise = prisma.coupon.count();

        const [orders, userGenderDemographic, totalProducts, totalCoupons] = await Promise.all([
            ordersPromise,
            userGenderDemographicPromise,
            totalProductsPromise,
            totalCouponsPromise,
        ]);

        // Calculate total revenue
        const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.order_total) || 0), 0);

        // Calculate revenue by month
        const revenueByMonth = orders.reduce((acc, order) => {
            const date = order.created_at ? new Date(order.created_at) : new Date();
            const month = date.getMonth();
            acc[month] = (acc[month] || 0) + (Number(order.order_total) || 0);
            return acc;
        }, {} as Record<number, number>);

        // Calculate revenue by week
        const revenueByWeek = orders.reduce((acc, order) => {
            const date = order.created_at ? new Date(order.created_at) : new Date();
            const week = getWeekOfYear(date);
            acc[week] = (acc[week] || 0) + (Number(order.order_total) || 0);
            return acc;
        }, {} as Record<number, number>);

        // Calculate revenue by day
        const revenueByDay = orders.reduce((acc, order) => {
            const date = order.created_at ? new Date(order.created_at) : new Date();
            const day = date.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + (Number(order.order_total) || 0);
            return acc;
        }, {} as Record<string, number>);

        // Calculate sales by category
        const salesByCategory = orders.reduce((acc, order) => {
            if (order.orderItems) {
                order.orderItems.forEach((item) => {
                    const productId = item.product_id || "unknown"; 
                    acc[productId] = (acc[productId] || 0) + (item.quantity || 0);
                });
            }
            return acc;
        }, {} as Record<string, number>);

        // Calculate best selling products
        const bestSellingProducts = Object.entries(salesByCategory)
            .map(([productId, quantity]) => ({ productId, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Calculate total orders
        const totalOrders = orders.length;

        // Get the latest 5 orders
        const latestOrders = orders.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        }).slice(0, 5);

        // Format gender demographic for frontend if needed
        const formattedGenderDemographic = userGenderDemographic.map(item => ({
            _id: item.gender || "Not Specified",
            count: item._count.gender
        }));

        res.json({
            success: true,
            stats: {
                totalRevenue,
                revenueByMonth,
                revenueByWeek,
                revenueByDay,
                salesByCategory,
                bestSellingProducts,
                userGenderDemographic: formattedGenderDemographic,
                totalOrders,
                latestOrders,
                totalProducts,
                totalCoupons,
            },
        });
    } catch (error) {
        console.error("Error in getStats:", error);
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};

// Helper function to get the week of the year
const getWeekOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)) / 86400000;
    return Math.ceil((diff + ((start.getDay() + 1) - 1)) / 7);
};
