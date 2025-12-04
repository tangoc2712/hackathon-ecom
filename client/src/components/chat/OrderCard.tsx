import React from 'react';

interface OrderCardProps {
    order: {
        type: 'order';
        order_id: string;
        status: string;
        total: number;
        currency: string;
        placed_date: string;
        url: string;
        items_count: number;
        item_names: string[];
    };
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const getStatusColor = (status: string) => {
        const statusColors: { [key: string]: string } = {
            'Delivered': 'text-green-600',
            'Shipped': 'text-blue-600',
            'Processing': 'text-orange-600',
            'Cancelled': 'text-red-600',
            'Pending': 'text-yellow-600'
        };
        return statusColors[status] || 'text-gray-600';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 max-w-xs my-2 w-full">
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-800">Order #{order.order_id.slice(0, 8)}</span>
                    <span className={`text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="mb-3 text-sm text-gray-600">
                    <p className="mb-1">Placed on {order.placed_date}</p>
                    <p className="font-medium text-gray-900">
                        Total: {order.currency} {order.total.toFixed(2)}
                    </p>
                </div>

                <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">{order.items_count} item(s):</p>
                    <ul className="text-xs text-gray-700 list-disc list-inside">
                        {order.item_names.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="truncate">{item}</li>
                        ))}
                        {order.item_names.length > 3 && (
                            <li className="text-gray-500 italic">+{order.item_names.length - 3} more</li>
                        )}
                    </ul>
                </div>

                <a
                    href={order.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors"
                >
                    View Order Details
                </a>
            </div>
        </div>
    );
};

export default OrderCard;
