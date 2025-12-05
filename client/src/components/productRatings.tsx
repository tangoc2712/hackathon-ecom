import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductRatingsQuery, useProductDetailsQuery } from '../redux/api/product.api';
import { RootState } from '../redux/store';
import AddReviewModal from './AddReviewModal';

interface ProductRatingsProps {
    productId: string;
}

const starsArray = (n: number) => Array.from({ length: 5 }, (_, i) => i < n);

function Star({ filled }: { filled: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            className={`inline-block ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );
}

const MiniStar = ({ filled }: { filled: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" className={`inline-block ${filled ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg">
        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Unknown date';
    try {
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr.split('T')[0];
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString();
    } catch {
        return 'Invalid date';
    }
};

const ProductRatings: React.FC<ProductRatingsProps> = ({ productId }) => {
    const navigate = useNavigate();
    const { data, isLoading, isError, refetch } = useGetProductRatingsQuery(productId);
    const { data: productData } = useProductDetailsQuery(productId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const ratings = data?.productRatings ?? [];

    const stats = useMemo(() => {
        const counts = [0, 0, 0, 0, 0]; // index 0 -> 1 star, index 4 -> 5 star
        let total = 0;
        let sum = 0;
        for (const r of ratings) {
            const rating = Math.max(1, Math.min(5, Math.floor(r.rating)));
            counts[rating - 1]++;
            sum += r.rating;
            total++;
        }
        const avg = total ? +(sum / total).toFixed(1) : 0;
        return { counts, total, avg };
    }, [ratings]);

    if (isLoading) return <div className="w-full h-40 flex items-center justify-center">Loading reviews...</div>;
    if (isError) return <div className="text-red-500">Failed to load reviews.</div>;
    if (!ratings || ratings.length === 0) return <div className="text-gray-600">No reviews yet.</div>;

    return (
        <section className="mt-8">
            {/* Product Title */}
            {productData?.product && (
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{productData.product.name}</h2>
            )}
            
            <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
                <div className="md:w-1/3 space-y-4">
                    <h3 className="text-xl font-semibold">Rating Avg</h3>
                    {/* Rating Avg Card */}
                    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-end space-x-3">
                            <div className="text-5xl font-extrabold text-black">{stats.avg}</div>
                            <div className="text-sm text-gray-600">/ 5</div>
                        </div>
                        <div className="mt-2 flex items-center">
                            {starsArray(Math.round(stats.avg)).map((filled, i) => (
                                <Star key={i} filled={filled} />
                            ))}
                            <div className="ml-2 text-sm text-gray-600">({stats.total} reviews)</div>
                        </div>

                        <div className="mt-6 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.counts[star - 1] ?? 0;
                                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center">
                                        <div className="w-10 text-sm text-gray-700">{star} <span className="sr-only">star</span></div>
                                        <div className="w-full bg-gray-200 h-3 rounded overflow-hidden mx-3">
                                            <div className="bg-yellow-400 h-3" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="w-12 text-sm text-gray-600">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-black text-white py-3 font-semibold rounded-full hover:bg-gray-800 transition"
                    >
                        ADD COMMENTS
                    </button>
                    <button 
                        onClick={() => navigate(`/product/${productId}`)}
                        className="w-full border-2 border-black text-black py-3 font-semibold rounded-full hover:bg-gray-100 transition"
                    >
                        BACK
                    </button>
                </div>

                <div className="md:w-2/3 mt-6 md:mt-0">
                    <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                        <ul className="space-y-4">
                            {ratings.map((r) => (
                                <li key={r.product_review_id} className="pb-4 border-b last:border-b-0">
                                    {/* Title and Date */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{r.title}</h4>
                                        <span className="text-sm text-gray-500">{formatDate(r.created_at)}</span>
                                    </div>

                                    {/* Stars */}
                                    <div className="flex items-center space-x-1 mb-2">
                                        {starsArray(Math.round(r.rating)).map((filled, i) => (
                                            <MiniStar key={i} filled={filled} />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    {r.comment && <p className="text-sm text-gray-700 mb-2">{r.comment}</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add Review Modal */}
            {productData?.product && (
                <AddReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={productData.product}
                    onSubmitSuccess={() => refetch()}
                />
            )}
        </section>
    );
};

export default ProductRatings;
