import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiPlus, FiX, FiStar, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

import { CartContext } from '../../context/CartContext';

const ProductComparison = () => {
    const { addToCart } = useContext(CartContext);
    const [compareItems, setCompareItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompareItems();
    }, []);

    const fetchCompareItems = async () => {
        try {
            const response = await api.get('/compare');
            setCompareItems(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch compare items:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCompare = (productId) => {
        setCompareItems(compareItems.filter(item => item.id !== productId));
    };

    const clearCompare = () => {
        setCompareItems([]);
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
                            <h1 className="text-2xl font-semibold text-gray-900">Compare Products</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {compareItems.length} {compareItems.length === 1 ? 'item' : 'items'} selected
                            </p>
                        </div>
                        {compareItems.length > 0 && (
                            <button
                                onClick={clearCompare}
                                className="text-red-600 hover:text-red-800 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {compareItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiPlus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No products to compare</h2>
                        <p className="text-gray-600 mb-6">
                            Add products to your comparison list to see them side by side
                        </p>
                        <Link
                            to="/"
                            className="text-[#FF9900] hover:text-[#FF7700] font-medium"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                                        Products
                                    </th>
                                    {compareItems.map((item) => (
                                        <th key={item.id} className="px-4 py-3 text-center border-b min-w-[200px]">
                                            <div className="relative">
                                                <button
                                                    onClick={() => removeFromCompare(item.id)}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <FiX className="w-3 h-3" />
                                                </button>
                                                <div className="space-y-2">
                                                    <img
                                                        src={item.image_url || `https://picsum.photos/seed/${item.id}/150/150`}
                                                        alt={item.name}
                                                        className="w-32 h-32 object-cover mx-auto rounded"
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                                        <p className="text-lg font-bold text-[#B12704] mt-1">{formatPrice(item.price)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Rating */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Rating
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b">
                                            <div className="flex items-center justify-center">
                                                {renderStars(item.rating || 0)}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.rating?.toFixed(1) || '0.0'} ({item.reviews || 0})
                                            </p>
                                        </td>
                                    ))}
                                </tr>

                                {/* Price */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Price
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b">
                                            <div className="text-lg font-bold text-[#B12704]">{formatPrice(item.price)}</div>
                                            {item.original_price && item.original_price > item.price && (
                                                <div className="text-sm text-gray-500 line-through">
                                                    {formatPrice(item.original_price)}
                                                </div>
                                            )}
                                            {item.discount_percentage && (
                                                <div className="text-sm text-red-600 font-medium">
                                                    {item.discount_percentage}% off
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Stock */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Availability
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b">
                                            <span className={`text-sm font-medium ${item.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Brand */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Brand
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b text-sm text-gray-600">
                                            {item.brand || 'Generic'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Category */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Category
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b text-sm text-gray-600">
                                            {item.category || 'Electronics'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Description */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Description
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b text-sm text-gray-600">
                                            <div className="line-clamp-3">{item.description || 'No description available'}</div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Features */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Key Features
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b text-sm text-gray-600">
                                            <ul className="space-y-1">
                                                {item.features?.slice(0, 3).map((feature, index) => (
                                                    <li key={index} className="text-left">• {feature}</li>
                                                )) || <li className="text-left">No features listed</li>}
                                            </ul>
                                        </td>
                                    ))}
                                </tr>

                                {/* Shipping */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Shipping
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b text-sm text-gray-600">
                                            {item.free_shipping ? (
                                                <span className="text-green-600 font-medium">FREE Shipping</span>
                                            ) : (
                                                <span>${item.shipping_cost || '9.99'} Shipping</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Actions */}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                        Actions
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-4 py-3 text-center border-b">
                                            <div className="space-y-2">
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => addToCart && addToCart(item, 1)}
                                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <FiShoppingCart className="w-4 h-4 inline mr-1" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductComparison;
