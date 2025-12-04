import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetCart } from '../redux/reducers/cart.reducer';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useEventTracking } from '../hooks/useEventTracking';

const OrderSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const { trackPurchase } = useEventTracking();

    const status = searchParams.get('status');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (status === '1') {
            dispatch(resetCart());
            // Assuming orderId is available or generated, but here we might just track the amount
            // Since trackPurchase requires orderId, we might need to get it from params or generate a temporary one if not available
            // The user request said "Payment Successful", keysearch (Payment Successful)
            // The URL params has amount.
            // Let's use a placeholder or check if orderId is in params.
            // Looking at the file, only status and amount are retrieved.
            // I'll use 'unknown' or try to get orderId if possible.
            // Wait, the hook requires orderId.
            // Let's check if there is an orderId in the URL.
            // The previous code didn't get orderId.
            // I'll check if I can get orderId from searchParams.
            const orderId = searchParams.get('orderId') || 'unknown';
            if (amount) {
                trackPurchase(orderId, Number(amount));
            }
        }
    }, [status, dispatch, amount, trackPurchase, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status === '1' ? (
                    <>
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase. Your order has been placed successfully.
                        </p>
                        {amount && (
                            <p className="text-lg font-semibold mb-4">
                                Amount Paid: {Number(amount).toLocaleString()} VND
                            </p>
                        )}
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/my-orders')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg w-full transition duration-200"
                            >
                                View My Orders
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-3 rounded-lg w-full transition duration-200"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-6">
                            Something went wrong with your payment. Please try again.
                        </p>
                        <button
                            onClick={() => navigate('/cart')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg w-full transition duration-200"
                        >
                            Return to Cart
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderSuccess;
