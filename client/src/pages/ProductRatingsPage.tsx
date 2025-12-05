import React from 'react';
import { useParams } from 'react-router-dom';
import ProductRatings from '../components/productRatings';

const ProductRatingsPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();

    if (!productId) {
        return (
            <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
                <p className="text-red-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
            <div className="mt-6">
                <ProductRatings productId={productId} />
            </div>
        </div>
    );
};

export default ProductRatingsPage;
