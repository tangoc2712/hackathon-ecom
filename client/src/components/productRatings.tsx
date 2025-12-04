import React, { useMemo, useState } from 'react';
import { useGetProductRatingsQuery } from '../redux/api/product.api';

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

const ProductRatings: React.FC<ProductRatingsProps> = ({ productId }) => {
    const { data, isLoading, isError } = useGetProductRatingsQuery(productId);
    const [showAll, setShowAll] = useState(false);

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

    const displayed = showAll ? ratings : ratings.slice(0, 6);

    return (
        <section className="mt-8">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
                <div className="md:w-1/3">
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

                <div className="md:w-2/3 mt-6 md:mt-0">
                    <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                    <ul className="space-y-4">
                        {displayed.map((r) => (
                            <li key={r.product_review_id} className="p-4 border rounded-md bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="mt-2 font-semibold text-gray-900">{r.title}</div>
                                        <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {starsArray(Math.round(r.rating)).map((filled, i) => (
                                            <Star key={i} filled={filled} />
                                        ))}
                                    </div>
                                </div>
                                {r.comment && <p className="mt-3 text-gray-700 text-sm">{r.comment}</p>}
                            </li>
                        ))}
                    </ul>

                    {ratings.length > displayed.length && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowAll((s) => !s)}
                                className="px-4 py-2 bg-gray-100 border rounded text-sm hover:bg-gray-200"
                            >
                                {showAll ? 'Show less' : `Show all ${ratings.length} reviews`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductRatings;
