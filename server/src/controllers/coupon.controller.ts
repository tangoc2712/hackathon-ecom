import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

// Apply Coupon
export const applyCoupon = asyncHandler(async (req, res, next) => {

    const { code } = req.body;

    if (!code) {
        return next(new ApiError(400, 'Please provide coupon code'));
    }

    const couponCode = await prisma.coupon.findUnique({
        where: { code }
    });

    if (!couponCode) {
        return next(new ApiError(404, 'Invalid coupon code'));
    }

    return res.status(200).json({
        success: true,
        coupon: couponCode,
        message: 'Coupon applied successfully'
    });
});

// Create New Coupon
export const newCoupon = asyncHandler(async (req, res, next) => {

    const { code, amount } = req.body;

    if (!code || !amount) {
        return next(new ApiError(400, 'Please fill all fields'));
    }

    const couponCode = await prisma.coupon.create({
        data: {
            code: code.toUpperCase(),
            amount: Number(amount),
        }
    });

    return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
    });

});

// Delete Coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {

    const couponId = req.params.id;

    const coupon = await prisma.coupon.findUnique({
        where: { id: couponId }
    });

    if (!coupon) {
        return next(new ApiError(404, 'Coupon not found'));
    }

    await prisma.coupon.delete({
        where: { id: couponId }
    });

    return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
    });
});

// getAllCoupons
export const getAllCoupons = asyncHandler(async (req, res, next) => {

    const coupons = await prisma.coupon.findMany({
        orderBy: { created_at: 'desc' }
    });

    return res.status(200).json({
        success: true,
        coupons
    });
});

