import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import {
    FiStar, FiShoppingCart, FiImage, FiMapPin, FiCheckCircle,
    FiPackage, FiTruck, FiGrid, FiList as FiListIcon, FiFilter
} from 'react-icons/fi';

const SellerStorefront = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                const response = await api.get(`/sellers/${id}/products`);
                setSeller(response.data.seller || null);
                setProducts(response.data.products || []);
            } catch (err) {
                console.error('Failed to fetch seller storefront:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSellerData();
    }, [id]);

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'name': return a.name.localeCompare(b.name);
            case 'newest':
            default: return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(rating || 0) ? 'text-[#FF9900] fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF9900] mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading storefront...</p>
                </div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-[#0f1111] mb-2">Seller Not Found</h2>
                    <p className="text-gray-500 text-sm mb-4">This seller storefront is not available.</p>
                    <Link to="/" className="text-[#007185] hover:text-[#C7511F] font-medium text-sm hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Seller Banner / Hero */}
            <div className="relative">
                {seller.store_banner ? (
                    <div className="h-48 md:h-64 w-full overflow-hidden">
                        <img
                            src={seller.store_banner}
                            alt={`${seller.store_name} banner`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                ) : (
                    <div className="h-48 md:h-64 w-full bg-gradient-to-r from-[#232f3e] via-[#37475A] to-[#131921] relative">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#FF9900] blur-3xl" />
                            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#146EB4] blur-3xl" />
                        </div>
                    </div>
                )}

                {/* Seller Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end space-x-5">
                            {/* Seller Logo */}
                            <div className="flex-shrink-0">
                                {seller.store_logo ? (
                                    <img
                                        src={seller.store_logo}
                                        alt={seller.store_name}
                                        className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border-4 border-white shadow-lg bg-white"
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#C7511F] border-4 border-white shadow-lg flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">
                                            {(seller.store_name || 'S').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* Seller Name & Meta */}
                            <div className="pb-2 flex-1 min-w-0">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 inline-block shadow-sm">
                                    <h1 className="text-xl md:text-2xl font-bold text-[#0f1111] truncate">
                                        {seller.store_name || 'Amazon Seller'}
                                    </h1>
                                    <div className="flex items-center space-x-3 mt-0.5">
                                        <div className="flex items-center">
                                            {renderStars(seller.rating)}
                                            <span className="ml-1 text-sm text-gray-600">
                                                ({(seller.rating || 0).toFixed(1)})
                                            </span>
                                        </div>
                                        {seller.is_verified && (
                                            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
                {/* Description */}
                {seller.description && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">About This Seller</h2>
                        <p className="text-sm text-gray-700 leading-relaxed">{seller.description}</p>
                    </div>
                )}

                {/* Toolbar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FiPackage className="w-5 h-5 text-[#FF9900]" />
                        <span className="text-sm font-bold text-[#0f1111]">
                            {products.length} Product{products.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Sort */}
                        <div className="flex items-center space-x-2">
                            <FiFilter className="w-4 h-4 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-[#F0F2F2] hover:bg-gray-200 cursor-pointer focus:ring-2 focus:ring-[#FF9900] focus:outline-none"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name A–Z</option>
                            </select>
                        </div>
                        {/* View Toggle */}
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#FF9900] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                            >
                                <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 ${viewMode === 'list' ? 'bg-[#FF9900] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                            >
                                <FiListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products */}
                {products.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                        <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[#0f1111] mb-1">No products listed yet</h3>
                        <p className="text-sm text-gray-500">This seller hasn't added any products to their store yet.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sortedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <FiImage className="w-12 h-12 text-gray-300" />
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">OUT OF STOCK</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-medium text-[#0f1111] line-clamp-2 group-hover:text-[#C7511F] transition-colors min-h-[2.5rem]">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                        {renderStars(product.rating || 0)}
                                    </div>
                                    <p className="text-lg font-bold text-[#B12704] mt-1">
                                        {formatPrice(product.price)}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <FiTruck className="w-3 h-3 mr-1" />
                                        FREE Delivery
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product, 1);
                                        }}
                                        disabled={product.stock <= 0}
                                        className={`w-full mt-3 py-1.5 rounded text-sm font-medium transition-colors ${product.stock <= 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0f1111]'
                                            }`}
                                    >
                                        <FiShoppingCart className="w-3 h-3 inline mr-1" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-3">
                        {sortedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex space-x-4"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="flex-shrink-0 w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <FiImage className="w-10 h-10 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-medium text-[#0f1111] hover:text-[#C7511F] line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center mt-1">{renderStars(product.rating || 0)}</div>
                                    <p className="text-xl font-bold text-[#B12704] mt-1">{formatPrice(product.price)}</p>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {product.stock > 0 ? (
                                            <span className="text-xs text-green-700 font-medium">In Stock</span>
                                        ) : (
                                            <span className="text-xs text-red-700 font-medium">Out of Stock</span>
                                        )}
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 flex items-center"><FiTruck className="w-3 h-3 mr-1" />FREE Delivery</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product, 1);
                                        }}
                                        disabled={product.stock <= 0}
                                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${product.stock <= 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0f1111]'
                                            }`}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerStorefront;
