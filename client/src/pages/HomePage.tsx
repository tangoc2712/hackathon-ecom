import React from 'react';
import FeaturedSection from '../components/FeaturedSection';
import PopularProducts from '../components/PopularProduct';
import { useLatestProductsQuery } from '../redux/api/product.api';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const { data: productData, isLoading: productLoading, isError: productError } = useLatestProductsQuery('');

    const products = productData?.products || [];

    if (productLoading) {
        return <p className="text-center mt-10 text-lg text-blue-500">Loading...</p>;
    }

    if (productError) {
        return <div className="flex items-center justify-center min-h-[80vh] text-lg text-red-500">Error loading products.</div>;
    }

    if (products.length === 0) {
        return <div className="text-center min-h-[80%] text-lg text-yellow-500">No products available.</div>;
    }

    return (
        <div className='min-h-screen flex flex-col items-center bg-white'>

            <FeaturedSection />

            {/* Categories Section */}
            <section className="container mx-auto px-4 mb-12">
                <h2 className="text-2xl font-bold text-black uppercase tracking-wide mb-6">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['WOMEN', 'MEN', 'KIDS', 'BABY'].map((cat) => (
                        <Link to={`/products?category=${cat.toLowerCase()}`} key={cat} className="group relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <span className="text-xl font-bold text-black z-10 group-hover:scale-110 transition duration-300">{cat}</span>
                            {/* Placeholder for category image if available */}
                            {/* <img src="..." className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition duration-300" /> */}
                        </Link>
                    ))}
                </div>
            </section>

            <PopularProducts products={products} />

        </div>
    );
};

export default HomePage;
