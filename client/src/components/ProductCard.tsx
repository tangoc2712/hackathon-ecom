import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/api-types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleNavigateToProduct = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/product/${product.product_id}`);
  };

  return (
    <div onClick={handleNavigateToProduct} className="group cursor-pointer flex flex-col gap-2">
      {/* Product image */}
      <div className="relative w-full overflow-hidden bg-gray-100">
        <img
          src={product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : 'https://via.placeholder.com/300x400')}
          alt={product.name}
          className="w-full h-auto object-cover aspect-[3/4]"
        />
        {/* Optional: Add "New" or "Sale" badge here if data available */}
        {product.featured && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1">
            LIMITED OFFER
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-start">
        {/* Color Swatches (Mock/Placeholder if empty) */}
        <div className="flex gap-1 mb-1">
          {product.colors && product.colors.length > 0 ? (
            product.colors.slice(0, 5).map((color, idx) => (
              <div key={idx} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color.hex || '#ccc' }} title={color.name}></div>
            ))
          ) : (
            // Fallback swatches for visual demo if no colors scraped yet
            <>
              <div className="w-3 h-3 rounded-full bg-black border border-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-gray-500 border border-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-blue-800 border border-gray-300"></div>
            </>
          )}
          {product.colors && product.colors.length > 5 && <span className="text-xs text-gray-500">+{product.colors.length - 5}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-black line-clamp-2 leading-tight group-hover:underline decoration-1 underline-offset-2">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-black mt-1">
          ${(product.price / 100).toFixed(2)}
        </p>

        {/* Rating (Mock) */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-black text-xs">
            {'★★★★☆'}
          </div>
          <span className="text-xs text-gray-500">(24)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;