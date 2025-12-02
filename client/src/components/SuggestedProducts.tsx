import React from 'react';
import { useGetSuggestedProductsQuery } from '../redux/api/product.api';
import ProductCard from './ProductCard';

const SuggestedProducts: React.FC = () => {
    const { data, isLoading, isError } = useGetSuggestedProductsQuery('');

    if (isLoading) return <div className="w-full h-40 flex items-center justify-center">Loading suggestions...</div>;
    if (isError || !data || !data.products || data.products.length === 0) return null;

    return (
        <section className="container mx-auto my-8 p-4">
            <h2 className="text-2xl font-bold mb-6 text-black uppercase tracking-wide">Suggested For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {data.products.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default SuggestedProducts;
