import React from 'react';
import { Product } from '../types/api-types';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

interface PopularProductsProps {
  products: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products }) => {
  return (
    // Container for the popular products
    <section className="container mx-auto my-8 p-4">
      {/* Header section with title and link to view all products */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black uppercase tracking-wide">New Arrivals</h2>
        <Link to="/products" className="text-gray-600 hover:text-black font-semibold underline decoration-1 underline-offset-4">
          View all
        </Link>
      </div>
      {/* Grid for displaying products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Map through the products and display each one using ProductCard component */}
        {products.map((product) => (
          <ProductCard product={product} key={product.product_id} />
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;
