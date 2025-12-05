import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../redux/store';
import { Product } from '../types/api-types';
import { useEventTracking } from '../hooks/useEventTracking';

interface AddReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onSubmitSuccess?: () => void;
}

function StarRating({ rating, setRating }: { rating: number; setRating: (n: number) => void }) {
    return (
        <div className="flex gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition transform hover:scale-110"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill={star <= rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                    </svg>
                </button>
            ))}
        </div>
    );
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
    isOpen,
    onClose,
    product,
    onSubmitSuccess,
}) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.user);
    const { trackComment } = useEventTracking();
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle not logged in
    if (isOpen && !user) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Sign in to write a review</h3>
                    <p className="text-gray-600 mb-6">
                        Please sign in to add a review for this product.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Stay
                        </button>
                        <button
                            onClick={() => {
                                navigate('/auth');
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Please enter a review title');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/v1/products/${product.product_id}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    rating,
                    comment: comment.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add review');
            }

            toast.success('Review added successfully! 🎉');
            setTitle('');
            setRating(5);
            setComment('');
            trackComment(product.product_id);
            onClose();
            onSubmitSuccess?.();
        } catch (error: any) {
            console.error('Add review error:', error);
            toast.error(error.message || 'Failed to add review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Write a Review</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left - Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        RATING <span className="text-red-500">*</span>
                                    </label>
                                    <StarRating rating={rating} setRating={setRating} />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        TITLE <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Summarize your review"
                                        maxLength={100}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Your title must be less than 100 characters.
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {title.length}/100
                                    </p>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        COMMENT <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share more details about this product..."
                                        maxLength={500}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You must write at least 50 characters
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {comment.length}/500
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Add Comment'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right - Product Info */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="w-full text-center">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    {product.name}
                                </h4>
                                <div className="mb-4">
                                    <img
                                        src={product.photo || (product.photos && product.photos.length > 0 ? product.photos[0] : '')}
                                        alt={product.name}
                                        className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {product.category}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddReviewModal;
