import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetCart } from '../redux/reducers/cart.reducer';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrderSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const status = searchParams.get('status');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (status === 1) {
            dispatch(resetCart());
        }
    }, [status, dispatch]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status === 1 ? (
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
