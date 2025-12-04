import React, { useEffect, useState } from 'react';
import FeaturedSection from '../components/FeaturedSection';
import PopularProducts from '../components/PopularProduct';
import SuggestedProducts from '../components/SuggestedProducts';
import { useLatestProductsQuery, useCategoriesQuery } from '../redux/api/product.api';
import { Link } from 'react-router-dom';
import ChatComponent from '../components/ChatComponent';

interface Category {
  category_id: number;
  name: string;
  parent_category_id?: number | null;
  type: string;
  img_url?: string;
}

const HomePage: React.FC = () => {
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const { data: productData, isLoading: productLoading, isError: productError } = useLatestProductsQuery('');
    const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery('');

    const products = productData?.products || [];

    // Fetch parent categories
    useEffect(() => {
        if (categoriesData?.categories) {
            const filtered = (categoriesData.categories as Category[]).filter(
                (cat) => cat.type === 'category'
            );
            setParentCategories(filtered);
        }
    }, [categoriesData]);

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

            <ChatComponent />

            {/* Categories Section */}
            <section className="container mx-auto px-4 mb-12">
                <h2 className="text-2xl font-bold text-black uppercase tracking-wide mb-6">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoriesLoading ? (
                        <div className="col-span-2 md:col-span-4 text-center text-gray-500">Loading categories...</div>
                    ) : parentCategories.length > 0 ? (
                        parentCategories.map((category) => (
                                <Link 
                                    to={`/products?category=${encodeURIComponent(category.name)}`}
                                key={category.category_id} 
                                className="group relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                                style={{
                                    backgroundImage: category.img_url ? `url('${category.img_url}')` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                <span className="text-xl font-bold text-white z-10 group-hover:scale-110 transition duration-300 drop-shadow-lg">
                                    {category.name.toUpperCase()}
                                </span>
                                {/* Dark overlay for better text readability */}
                                <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-20 transition duration-300 z-0"></div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-2 md:col-span-4 text-center text-gray-500">No categories available</div>
                    )}
                </div>
            </section>

            <SuggestedProducts />

            <PopularProducts products={products} />

        </div>
    );
};

export default HomePage;
