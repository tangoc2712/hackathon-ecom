import React from 'react';
import { useGetSuggestedProductsQuery } from '../redux/api/product.api';
import ProductCard from './ProductCard';

const SuggestedProducts: React.FC = () => {
    const { data, isLoading, isError } = useGetSuggestedProductsQuery('');

    if (isLoading) return <div className="w-full h-40 flex items-center justify-center">Loading suggestions...</div>;
    if (isError || !data || !data.products || data.products.length === 0) return null;

    return (
        <section className="container mx-auto px-4 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-black uppercase tracking-wide">Suggested For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.products.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default SuggestedProducts;
