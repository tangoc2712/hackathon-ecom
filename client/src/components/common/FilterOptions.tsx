import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import icons from react-icons/fa
import { useCategoriesQuery } from '../../redux/api/product.api';

type Category = {
    category_id?: number;
    name: string;
    parent_category_id?: number | null;
    type?: string;
    img_url?: string | null;
};

interface FilterOptionsProps {
    // optional: if provided, use this array of category names or category objects; otherwise fetch parent categories from API
    categories?: Category[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    minPrice: number | undefined;
    setMinPrice: (price: number) => void;
    maxPrice: number | undefined;
    setMaxPrice: (price: number) => void;
    sort: 'asc' | 'desc' | 'relevance';
    setSort: (sort: 'asc' | 'desc' | 'relevance') => void;
    clearFilters: () => void;
    // optional: allow parent to receive selected category id for search by id
    selectedCategoryId?: number | undefined;
    setSelectedCategoryId?: (id?: number) => void;
}

// Functional component for filter options
const FilterOptions: React.FC<FilterOptionsProps> = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    clearFilters,
    //selectedCategoryId,
    setSelectedCategoryId,
}) => {
    // State to toggle the visibility of categories
    const [showCategories, setShowCategories] = useState(true);

    // Fetch categories like Header: get all categories and filter for type === 'category'
    const { data: categoriesData } = useCategoriesQuery('');
    const parentCategoryNames: string[] = categoriesData?.categories
        ? (categoriesData.categories as Category[]).filter((c) => c.type === 'category').map((c) => c.name)
        : [];

    // Normalize incoming categories (could be string[] or Category[])
    const normalizedPropCategories: string[] | undefined = categories
        ? (categories as any[]).map((c) => (typeof c === 'string' ? c : (c && c.name ? c.name : String(c))))
        : undefined;

    // Build grouped parent -> subcategories structure when we have category objects
    const allCategoryObjects: Category[] | undefined =
        categories && categories.length > 0 && typeof (categories as any[])[0] !== 'string'
            ? (categories as Category[])
            : (categoriesData?.categories as Category[] | undefined);

    const groupedByParent: { parent: Category; subs: Category[] }[] = [];
    if (allCategoryObjects && allCategoryObjects.length > 0) {
        const parents = allCategoryObjects.filter((c) => c.type === 'category');
        for (const p of parents) {
            const subs = allCategoryObjects.filter((c) => c.type === 'sub_category' && c.parent_category_id === p.category_id);
            groupedByParent.push({ parent: p, subs });
        }
    }

    // Track expanded parents (by category_id). Default: all collapsed.
    const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

    const toggleParent = (parentId: number) => {
        setExpandedParents((prev) => {
            const next = new Set(prev);
            if (next.has(parentId)) next.delete(parentId);
            else next.add(parentId);
            return next;
        });
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Sort options */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Sort</label>
                <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | 'relevance')}
                >
                    <option value="relevance">Relevance</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                </select>
            </div>
            {/* Category filter */}
            <div className="mb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCategories(!showCategories)}>
                    <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                    {showCategories ? <FaChevronUp className="h-5 w-5 text-gray-500" /> : <FaChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                {showCategories && (
                    <ul className="mt-2 space-y-1">
                        {groupedByParent.length > 0 ? (
                            groupedByParent.map(({ parent, subs }) => (
                                <React.Fragment key={parent.category_id}>
                                    <li className="flex items-center justify-between">
                                        <button
                                            className={`text-left w-full cursor-pointer px-3 py-2 rounded-md ${
                                                selectedCategory === parent.name ? 'bg-indigo-500 text-white' : 'hover:bg-gray-200'
                                            }`}
                                            onClick={() => {
                                                // For parent categories (type === 'category') search by name
                                                setSelectedCategory(parent.name);
                                                if (setSelectedCategoryId) setSelectedCategoryId(undefined);
                                            }}
                                        >
                                            {parent.name}
                                        </button>
                                        <button
                                            aria-label={`Toggle ${parent.name}`}
                                            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                                            onClick={() => toggleParent(parent.category_id)}
                                        >
                                            {expandedParents.has(parent.category_id) ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </li>
                                    {expandedParents.has(parent.category_id) &&
                                        subs.map((sub) => (
                                            <li
                                                key={`sub-${sub.category_id}`}
                                                className={`cursor-pointer px-3 py-2 rounded-md ml-6 text-sm ${
                                                    selectedCategory === sub.name ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'
                                                }`}
                                                onClick={() => {
                                                    setSelectedCategory(sub.name);
                                                    if (setSelectedCategoryId && sub.category_id !== undefined) {
                                                        setSelectedCategoryId(sub.category_id);
                                                    }
                                                }}
                                            >
                                                {sub.name}
                                            </li>
                                        ))}
                                </React.Fragment>
                            ))
                        ) : (
                            (normalizedPropCategories && normalizedPropCategories.length > 0 ? normalizedPropCategories : parentCategoryNames).map((category) => (
                                <li
                                    key={category}
                                    className={`cursor-pointer px-3 py-2 rounded-md ${
                                        selectedCategory === category
                                            ? 'bg-indigo-500 text-white'
                                            : 'hover:bg-gray-200'
                                    }`}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        if (setSelectedCategoryId) setSelectedCategoryId(undefined);
                                    }}
                                >
                                    {category}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
            {/* Price filter */}
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Price</h3>
                <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2 items-center">
                        <label className="w-1/2 text-sm font-medium text-gray-700">Starting Range</label>
                        <input
                            type="number"
                            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            placeholder="Min Price"
                            value={minPrice || ''}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                        />
                    </div>
                    <div className="flex space-x-2 items-center">
                        <label className="w-1/2 text-sm font-medium text-gray-700">Ending Range</label>
                        <input
                            type="number"
                            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            placeholder="Max Price"
                            value={maxPrice || ''}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>
            {/* Clear filters button */}
            <button
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                onClick={clearFilters}
            >
                Clear Filters
            </button>
        </div>
    );
};

export default FilterOptions;
