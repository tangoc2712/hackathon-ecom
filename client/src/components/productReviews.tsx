import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductRatingsQuery, useProductDetailsQuery } from '../redux/api/product.api';
import AddReviewModal from './AddReviewModal';

interface Props {
    productId: string;
}

const MiniStar = ({ filled }: { filled: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" className={`inline-block ${filled ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg">
        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Unknown date';
    try {
        // Handle yyyy-mm-dd format from database
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr.split('T')[0]; // Return just yyyy-mm-dd part
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString();
    } catch {
        return 'Invalid date';
    }
};

const ProductReviews: React.FC<Props> = ({ productId }) => {
    const { data, isLoading, isError, refetch } = useGetProductRatingsQuery(productId);
    const { data: productData } = useProductDetailsQuery(productId);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    if (isLoading) return <div className="py-6">Loading reviews...</div>;
    if (isError) return <div className="py-6 text-red-500">Failed to load reviews.</div>;

    const ratings = data?.productRatings ?? [];
    const latest = ratings.slice().sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()).slice(0, 3);

    // Calculate average rating
    const avgRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0;

    if (latest.length === 0) return null;

    return (
        <section className="mt-8">
            <div className="mb-4">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
            </div>

            {/* Rating Summary */}
            <div className="mb-6 flex items-center space-x-3 pb-4 border-b">
                <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MiniStar key={i} filled={i < Math.round(Number(avgRating))} />
                    ))}
                </div>
                <span className="font-semibold text-lg">{avgRating}</span>
                <span className="text-gray-600">({ratings.length} {ratings.length === 1 ? 'comment' : 'comments'})</span>
            </div>

            <ul className="space-y-4 mb-6">
                {latest.map((r) => (
                    <li key={r.product_review_id} className="pb-4 border-b last:border-b-0">
                        {/* Title and Date */}
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{r.title}</h4>
                            <span className="text-sm text-gray-500">{formatDate(r.created_at || r.createdAt)}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <MiniStar key={i} filled={i < Math.round(r.rating)} />
                            ))}
                        </div>

                        {/* Comment */}
                        {r.comment && <p className="text-sm text-gray-700 mb-2">{r.comment}</p>}
                    </li>
                ))}
            </ul>

            {/* Buttons Section */}
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-black text-white py-3 font-semibold rounded-full hover:bg-gray-800 transition"
                >
                    ADD COMMENTS
                </button>
                <button 
                    onClick={() => navigate(`/products/${productId}/ratings`)}
                    className="flex-1 border-2 border-black text-black py-3 font-semibold rounded-full hover:bg-gray-100 transition"
                >
                    VIEW MORE
                </button>
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

export default ProductReviews;
