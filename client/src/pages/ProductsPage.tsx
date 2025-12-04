import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import ProductCard from '../components/ProductCard';
import { useSearchProductsQuery, useCategoriesQuery } from '../redux/api/product.api';
import { Product } from '../types/api-types';

const ProductsPage: React.FC = () => {
    const [page, setPage] = useState(1);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category') || '';
    const categoryIdParam = searchParams.get('category_id') || undefined;
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

    const { data, isLoading, isError } = useSearchProductsQuery({
        page,
        category: category || undefined,
        category_id: categoryIdParam,
        search: ''
    });

    const { data: categoriesData } = useCategoriesQuery('');
    const categoryName = categoryId && categoriesData?.categories
        ? (categoriesData.categories as any[]).find((c) => c.category_id === categoryId)?.name
        : category;

    const handlePageClick = (selectedItem: { selected: number }) => {
        setPage(selectedItem.selected + 1);
    };

    useEffect(() => {
        setPage(1); // Reset to page 1 when category or category_id changes
    }, [category, categoryId]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh]">
            <h1 className="text-3xl font-bold text-center mb-8">
                {categoryName ? `${categoryName} Products` : 'All Products'}
            </h1>
            <div className="w-full p-4">
                {isLoading ? (
                    <p className="text-center text-lg">Loading...</p>
                ) : isError ? (
                    <p className="text-center text-lg text-red-500">Error loading products.</p>
                ) : data?.products.length === 0 ? (
                    <p className="text-center text-lg">No products found.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {data?.products.map((product: Product) => (
                                <ProductCard key={product.product_id} product={product} />
                            ))}
                        </div>
                        {data && data.totalPage > 1 && (
                            <div className="mt-8">
                                <ReactPaginate
                                    pageCount={data.totalPage}
                                    pageRangeDisplayed={2}
                                    marginPagesDisplayed={2}
                                    onPageChange={handlePageClick}
                                    containerClassName="flex justify-center space-x-2"
                                    pageClassName="px-3 py-1 border border-gray-300 rounded-lg"
                                    pageLinkClassName="block text-gray-700"
                                    previousClassName="px-3 py-1 border border-gray-300 rounded-lg"
                                    previousLinkClassName="block text-gray-700"
                                    nextClassName="px-3 py-1 border border-gray-300 rounded-lg"
                                    nextLinkClassName="block text-gray-700"
                                    breakClassName="px-3 py-1 border border-gray-300 rounded-lg"
                                    breakLinkClassName="block text-gray-700"
                                    activeClassName="bg-blue-500 text-white"
                                    disabledClassName="opacity-50 cursor-not-allowed"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
