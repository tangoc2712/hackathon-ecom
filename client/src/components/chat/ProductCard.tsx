import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/reducers/cart.reducer';
import { CartItem } from '../../types/api-types';
import { toast } from 'react-toastify';

interface ProductCardProps {
    product: {
        name: string;
        price: number;
        sale_price: number | null;
        image: string;
        url: string;
        stock: number;
        colors: string[];
        sizes: string[];
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    if (!product) return null;

    // Extract product ID from URL if possible, or use the full URL
    // The URL format is expected to be ".../product/:id"
    const productId = product.url ? product.url.split('/').pop() : '';
    const productLink = productId ? `/product/${productId}` : (product.url || '#');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (!productId) {
            toast.error("Cannot add to cart: Invalid product ID");
            return;
        }

        if (product.stock <= 0) {
            toast.error("Product is out of stock");
            return;
        }

        const cartItem: CartItem = {
            productId: productId,
            photo: product.image,
            name: product.name,
            price: product.sale_price || product.price,
            currency: "USD",
            quantity: 1,
            stock: product.stock,
        };

        dispatch(addToCart(cartItem));
        toast.success("Added to cart");
        navigate('/cart');
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 max-w-xs my-2">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {product.sale_price && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 h-10" title={product.name}>
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                    {product.sale_price ? (
                        <>
                            <span className="text-lg font-bold text-red-600">${Number(product.sale_price).toFixed(2)}</span>
                            <span className="text-xs text-gray-500 line-through">${Number(product.price || 0).toFixed(2)}</span>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-gray-900">${Number(product.price || 0).toFixed(2)}</span>
                    )}
                </div>

                {product.stock < 10 && product.stock > 0 && (
                    <div className="text-xs text-orange-600 font-medium mb-2">
                        Only {product.stock} left!
                    </div>
                )}

                {product.stock === 0 && (
                    <div className="text-xs text-red-600 font-medium mb-2">
                        Out of Stock
                    </div>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                    {(() => {
                        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
                        return (
                            <>
                                {sizes.slice(0, 4).map((size) => (
                                    <span key={size} className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">
                                        {size}
                                    </span>
                                ))}
                                {sizes.length > 4 && (
                                    <span className="text-xs text-gray-500 self-center">+{sizes.length - 4}</span>
                                )}
                            </>
                        );
                    })()}
                </div>

                <div className="flex gap-2">
                    <Link
                        to={productLink}
                        className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 rounded transition-colors"
                    >
                        View
                    </Link>
                    {product.stock > 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
