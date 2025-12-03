import React from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useOrderDetailsQuery } from '../redux/api/order.api';
import { useCheckZaloPayStatusMutation } from '../redux/api/payment.api';
import { notify } from '../utils/util';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError, refetch } = useOrderDetailsQuery(id!);
    const [checkStatus, { isLoading: isChecking }] = useCheckZaloPayStatusMutation();

    if (isLoading) {
        return <p className="text-center text-lg">Loading...</p>;
    }

    if (isError || !data) {
        return <p className="text-center text-lg text-red-500">Error loading order details</p>;
    }

    const { order } = data;

    return (
        <div className="container mx-auto my-8 p-4 bg-white rounded-lg shadow-md min-h-screen">

            <BackButton />
            <h2 className="text-2xl font-bold mb-6 text-center">Order Details</h2>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Order ID: {order.order_id}</h3>
                <p>Status: <span className="font-medium">{order.status}</span></p>
                <p>Placed on: <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span></p>
                {order.status === 'Pending Payment' && (
                    <button
                        onClick={async () => {
                            try {
                                const res = await checkStatus({ orderId: order.order_id }).unwrap();
                                if (res.returncode === 1) {
                                    notify('Payment confirmed! Order updated.', 'success');
                                    refetch();
                                } else {
                                    notify(`Payment status: ${res.returnmessage}`, 'info');
                                }
                            } catch (error: any) {
                                notify(error?.data?.message || 'Failed to check status', 'error');
                            }
                        }}
                        disabled={isChecking}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {isChecking ? 'Checking...' : 'Check Payment Status (ZaloPay)'}
                    </button>
                )}
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Shipping Information</h3>
                <p>Address: <span className="font-medium">{order.shipping_info.address}</span></p>
                <p>City: <span className="font-medium">{order.shipping_info.city}</span></p>
                <p>Phone: <span className="font-medium">{order.shipping_info.phone}</span></p>
                <p>Pin Code: <span className="font-medium">{order.shipping_info.pinCode}</span></p>
                <p>Country: <span className="font-medium">{order.shipping_info.country}</span></p>
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Order Items</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="p-4">Product</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item) => (
                                <tr className="border-b hover:bg-gray-100" key={item.order_item_id}>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={item.product?.photo || (item.product?.photos && item.product?.photos.length > 0 ? item.product?.photos[0] : '')} alt="Product" className="h-12 w-12 object-cover rounded-lg" />
                                            <div>{item.product?.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">{item.quantity}</td>
                                    <td className="p-4">{order.currency} {item.unit_price}</td>
                                    <td className="p-4">{order.currency} {item.total_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>{order.currency} {order.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Tax</span>
                    <span>{order.currency} {order.tax}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>{order.currency} {order.shipping_charges}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Discount</span>
                    <span>{order.currency} {order.discount}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{order.currency} {order.order_total}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
