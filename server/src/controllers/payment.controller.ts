import stripe from "../config/stripe.config";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";


export const createPaymentIntent = asyncHandler(async (req, res, next) => {

    const { amount } = req.body;

    if (!amount) {
        return next(new ApiError(400, 'Please provide amount'));
    }

    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount,
    //     currency: 'inr',
    // });
    
    // Mock payment intent
    const paymentIntent = {
        client_secret: "pi_test_secret_123456789"
    };

    return res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        message: 'Payment Intent created successfully'
    });
});


