import React from 'react';
import { useGetRelatedProductsQuery } from '../redux/api/product.api';
import ProductCard from './ProductCard';


interface RelatedProductsProps {
    productId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId }) => {
    const { data, isLoading, isError } = useGetRelatedProductsQuery(productId);

    if (isLoading) return <div className="w-full h-40 flex items-center justify-center">Loading related products...</div>;
    if (isError || !data || !data.products || data.products.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-black uppercase tracking-wide">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.products.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
