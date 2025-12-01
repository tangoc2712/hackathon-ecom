import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import { useGetAllFeaturedProductsQuery } from '../redux/api/product.api';

const FeaturedSection: React.FC = () => {

    // Fetch all featured products using a Redux API hook
    const { data } = useGetAllFeaturedProductsQuery('');
    const products = data?.products || [];

    return (
        <section className="w-full mb-8">
            <Carousel showThumbs={false} showStatus={false} infiniteLoop autoPlay showArrows={true} interval={5000}>
                {products.map((product) => (
                    <div className="relative w-full h-[500px] bg-gray-100 flex items-center justify-center" key={product.name}>
                        <div className="absolute inset-0">
                            <img
                                src={product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : '')}
                                alt={product.name}
                                className="w-full h-full object-cover opacity-90"
                            />
                        </div>
                        <div className="relative z-10 bg-white/90 p-8 max-w-lg text-left shadow-lg ml-10 md:ml-20 self-center md:self-auto md:mr-auto">
                            <h2 className="text-red-600 font-bold text-sm tracking-widest mb-2 uppercase">Featured Collection</h2>
                            <h1 className="text-4xl font-bold mb-4 text-black">{product.name}</h1>
                            <p className="mb-6 text-gray-700 line-clamp-2">{product.description}</p>
                            <Link
                                to={`/product/${product.product_id}`}
                                className="inline-block bg-primary text-white px-8 py-3 font-bold hover:bg-red-700 transition duration-300"
                            >
                                VIEW DETAILS
                            </Link>
                        </div>
                    </div>
                ))}
            </Carousel>
        </section>
    );
};

export default FeaturedSection;
