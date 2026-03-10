import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiStar, FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, priceLow, priceHigh, name
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlist');
            setWishlistItems(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            setWishlistItems(wishlistItems.filter(item => item.id !== productId));
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const handleAddToCart = (product) => {
        if (addToCart) {
            addToCart({
                ...product,
                quantity: 1,
                image_url: product.image_url,
                id: product.id
            });
        }
    };

    const filteredAndSortedItems = () => {
        let filtered = wishlistItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort items
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priceLow':
                    return a.price - b.price;
                case 'priceHigh':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'dateAdded':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        return filtered;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FiStar key={`star-${i}`} className="text-yellow-400 fill-current" />);
        }
        if (hasHalfStar) {
            stars.push(<FiStar key="half" className="text-yellow-400 opacity-50" />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9900]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Your Wishlist</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#FF9900] text-black' : 'bg-gray-200 text-gray-600'}`}
                            >
                                <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#FF9900] text-black' : 'bg-gray-200 text-gray-600'}`}
                            >
                                <FiList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search your wishlist..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                        >
                            <option value="dateAdded">Recently Added</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Wishlist Items */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {filteredAndSortedItems().length === 0 ? (
                    <div className="text-center py-12">
                        <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'No items found' : 'Your wishlist is empty'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Save items you love to your wishlist and come back to them later'
                            }
                        </p>
                        <Link
                            to="/"
                            className="text-[#FF9900] hover:text-[#FF7700] font-medium"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                        {filteredAndSortedItems().map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {viewMode === 'grid' ? (
                                    // Grid View
                                    <div>
                                        <div className="relative">
                                            <img
                                                src={item.image_url || `https://picsum.photos/seed/${item.id}/300/300`}
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                            >
                                                <FiTrash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                            <div className="flex items-center mb-2">
                                                {renderStars(item.rating || 0)}
                                                <span className="text-sm text-gray-500 ml-2">({item.reviews || 0})</span>
                                            </div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-lg font-bold text-[#B12704]">{formatPrice(item.price)}</span>
                                                <span className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={item.stock <= 0}
                                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${item.stock <= 0
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-[#FFD814] hover:bg-[#F7CA00] text-black'
                                                        }`}
                                                >
                                                    <FiShoppingCart className="w-4 h-4 mr-1" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // List View
                                    <div className="flex items-center p-4">
                                        <img
                                            src={item.image_url || `https://picsum.photos/seed/${item.id}/100/100`}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                        <div className="flex-1 ml-4">
                                            <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                            <div className="flex items-center mb-2">
                                                {renderStars(item.rating || 0)}
                                                <span className="text-sm text-gray-500 ml-2">({item.reviews || 0})</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-[#B12704]">{formatPrice(item.price)}</span>
                                                <span className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                <FiTrash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.stock <= 0}
                                                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${item.stock <= 0
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#FFD814] hover:bg-[#F7CA00] text-black'
                                                    }`}
                                            >
                                                <FiShoppingCart className="w-4 h-4 mr-1" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
