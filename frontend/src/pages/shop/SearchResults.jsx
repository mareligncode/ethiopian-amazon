import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { FiFilter, FiChevronDown, FiStar } from 'react-icons/fi';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q') || '';
    const categoryQuery = new URLSearchParams(location.search).get('category') || '';

    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategory, setSelectedCategory] = useState(categoryQuery);

    useEffect(() => {
        setSelectedCategory(categoryQuery);
    }, [categoryQuery]);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.append('q', query);
                if (priceRange.min) params.append('minPrice', priceRange.min);
                if (priceRange.max) params.append('maxPrice', priceRange.max);
                if (selectedCategory) params.append('category', selectedCategory);

                const response = await api.get(`/catalog?${params.toString()}`);
                setProducts(response.data.products || []);
            } catch (err) {
                console.error("Search failed:", err);
                setError("Failed to load search results.");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query, priceRange, selectedCategory]);

    return (
        <div className="bg-white min-h-screen">
            {/* Results Header */}
            <div className="border-b shadow-sm py-2 px-6 flex items-center justify-between text-sm text-[#565959]">
                <div>
                    {loading ? "Searching..." : `${products.length} results for `}
                    <span className="text-[#c45500] font-bold">"{query}"</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-[#c45500]">
                        Sort by: Featured <FiChevronDown />
                    </span>
                </div>
            </div>

            <div className="flex max-w-[1500px] mx-auto">
                {/* Sidebar Filters */}
                <aside className="w-[240px] shrink-0 p-6 hidden md:block border-r min-h-[calc(100vh-100px)]">
                    <h3 className="font-bold text-[14px] mb-2">Category</h3>
                    <ul className="text-[14px] space-y-1 mb-6">
                        <li className={`cursor-pointer hover:text-[#c45500] ${!selectedCategory ? 'font-bold' : ''}`} onClick={() => setSelectedCategory('')}>All</li>
                        <li className="cursor-pointer hover:text-[#c45500]">Electronics</li>
                        <li className="cursor-pointer hover:text-[#c45500]">Books</li>
                        <li className="cursor-pointer hover:text-[#c45500]">Home & Kitchen</li>
                    </ul>

                    <h3 className="font-bold text-[14px] mb-2">Customer Reviews</h3>
                    <ul className="space-y-1 mb-6">
                        {[4, 3, 2, 1].map(stars => (
                            <li key={stars} className="flex items-center gap-1 text-[14px] cursor-pointer hover:text-[#c45500]">
                                <div className="flex text-[#FFA41C]">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < stars ? "fill-current" : ""} />
                                    ))}
                                </div>
                                <span>& Up</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="font-bold text-[14px] mb-2">Price</h3>
                    <div className="space-y-2">
                        <button className="block text-[14px] hover:text-[#c45500]" onClick={() => setPriceRange({ min: '', max: '25' })}>Under $25</button>
                        <button className="block text-[14px] hover:text-[#c45500]" onClick={() => setPriceRange({ min: '25', max: '50' })}>$25 to $50</button>
                        <button className="block text-[14px] hover:text-[#c45500]" onClick={() => setPriceRange({ min: '50', max: '100' })}>$50 to $100</button>
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="number"
                                placeholder="$ Min"
                                className="w-16 border rounded p-1 text-sm focus:ring-1 focus:ring-[#e47911] outline-none"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="$ Max"
                                className="w-16 border rounded p-1 text-sm focus:ring-1 focus:ring-[#e47911] outline-none"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            />
                            <button
                                className="text-[12px] border rounded px-2 py-1 shadow-sm hover:bg-gray-50"
                                onClick={() => { }}
                            >
                                Go
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Results Main Area */}
                <main className="flex-1 p-6">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e47911]"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <h2 className="text-xl font-bold mb-2">No results for {query}</h2>
                            <p className="text-gray-600">Try checking your spelling or use more general terms.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchResults;
