import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useProductDetailsQuery } from '../redux/api/product.api';
import { addToCart, decrementCartItem, incrementCartItem } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';

const SingleProduct: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { data, isLoading, isError } = useProductDetailsQuery(productId!);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const cartItem = cartItems.find(item => item.productId === productId);

    const [selectedPhoto, setSelectedPhoto] = React.useState<string>('');
    const [selectedColor, setSelectedColor] = React.useState<string>('');
    const [selectedSize, setSelectedSize] = React.useState<string>('');

    const product = data?.product;

    React.useEffect(() => {
        if (product) {
            setSelectedPhoto(product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : ''));
            if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0].name);
            if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
        }
    }, [product]);

    if (isLoading) return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    if (isError || !product) return <div className="flex justify-center items-center h-screen"><p>Error loading product.</p></div>;

    const handleAddToCart = (event: React.MouseEvent) => {
        event.preventDefault();
        const cartItem = {
            productId: product.product_id,
            name: product.name + (selectedColor ? ` - ${selectedColor}` : '') + (selectedSize ? ` - ${selectedSize}` : ''),
            price: Number(product.price),
            currency: product.currency,
            quantity: 1,
            stock: product.stock,
            photo: selectedPhoto || product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : ''),
            photos: product.photos,
        };
        dispatch(addToCart(cartItem));
    };

    const handleIncrement = (event: React.MouseEvent) => {
        event.preventDefault();
        dispatch(incrementCartItem(product.product_id));
    };

    const handleDecrement = (event: React.MouseEvent) => {
        event.preventDefault();
        dispatch(decrementCartItem(product.product_id));
    };

    const handleGoToCart = (event: React.MouseEvent) => {
        event.preventDefault();
        navigate('/cart');
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
            <BackButton />
            <div className="flex flex-col lg:flex-row gap-12 mt-6">
                {/* Product Images Gallery */}
                <div className="flex-1 flex flex-col-reverse lg:flex-row gap-4">
                    {/* Thumbnails */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
                        {product.photos && product.photos.length > 0 ? (
                            product.photos.map((photo, index) => (
                                <img
                                    key={index}
                                    src={photo}
                                    alt={`${product.name} ${index}`}
                                    className={`w-20 h-20 object-cover cursor-pointer border-2 ${selectedPhoto === photo ? 'border-black' : 'border-transparent'}`}
                                    onClick={() => setSelectedPhoto(photo)}
                                />
                            ))
                        ) : (
                            <img
                                src={product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : '')}
                                alt={product.name}
                                className={`w-20 h-20 object-cover cursor-pointer border-2 border-black`}
                            />
                        )}
                    </div>
                    {/* Main Image */}
                    <div className="flex-1">
                        <img
                            src={selectedPhoto || product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : '')}
                            alt={product.name}
                            className="w-full h-auto max-h-[700px] object-contain"
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 lg:max-w-md">
                    <h1 className="text-3xl font-bold text-black mb-2">{product.name}</h1>
                    <p className="text-2xl font-bold text-black mb-6">{product.currency || '₹'} {Number(product.price).toFixed(2)}</p>

                    {/* Description Short */}
                    <div className="mb-6 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: product.description.substring(0, 150) + '...' }} />

                    {/* Color Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold mb-2 uppercase">Color: {selectedColor}</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.name ? 'border-black ring-1 ring-black' : 'border-gray-300'}`}
                                        style={{ backgroundColor: color.hex || '#ccc' }} // Fallback color
                                        onClick={() => setSelectedColor(color.name)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold mb-2 uppercase">Size: {selectedSize}</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`px-4 py-2 border text-sm font-bold min-w-[3rem] ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black hover:border-black'}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to Cart / Actions */}
                    <div className="mb-8">
                        {cartItem ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border border-black p-2 w-32">
                                    <button onClick={handleDecrement} className="px-3 py-1 text-xl">-</button>
                                    <span className="font-bold">{cartItem.quantity}</span>
                                    <button onClick={handleIncrement} className="px-3 py-1 text-xl">+</button>
                                </div>
                                <button onClick={handleGoToCart} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition">
                                    Go to Cart
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className={`w-full py-4 font-bold uppercase text-white transition-all duration-200 ${product.stock > 0 ? 'bg-primary hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                disabled={product.stock <= 0}
                            >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="border-t border-gray-200 pt-6 space-y-4">
                        <div>
                            <h3 className="font-bold mb-2">Description</h3>
                            <div className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                        {product.materials && (
                            <div>
                                <h3 className="font-bold mb-2">Materials</h3>
                                <p className="text-sm text-gray-600">{product.materials}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleProduct;
