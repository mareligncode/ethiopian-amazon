import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
    FiPackage, FiHeart, FiCreditCard, FiBell, FiShield,
    FiMapPin, FiGift, FiHeadphones, FiList, FiUser,
    FiChevronRight, FiStar, FiShoppingBag, FiTruck
} from 'react-icons/fi';

const BuyerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const response = await api.get('/orders/');
                setRecentOrders((response.data.orders || []).slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch recent orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentOrders();
    }, []);

    const accountCards = [
        {
            icon: <FiPackage className="w-8 h-8 text-[#FF9900]" />,
            title: 'Your Orders',
            description: 'Track, return, or buy things again',
            link: '/orders',
            color: 'from-orange-50 to-amber-50',
            border: 'border-orange-200'
        },
        {
            icon: <FiShield className="w-8 h-8 text-[#007185]" />,
            title: 'Login & Security',
            description: 'Edit login, name, and mobile number',
            link: null, // No separate page, show info inline
            color: 'from-teal-50 to-cyan-50',
            border: 'border-teal-200'
        },
        {
            icon: <FiGift className="w-8 h-8 text-[#C7511F]" />,
            title: 'Gift Cards',
            description: 'View balance or redeem a card',
            link: '/gift-cards',
            color: 'from-red-50 to-orange-50',
            border: 'border-red-200'
        },
        {
            icon: <FiBell className="w-8 h-8 text-[#5C3B92]" />,
            title: 'Your Messages',
            description: 'View notifications and alerts',
            link: '/notifications',
            color: 'from-purple-50 to-indigo-50',
            border: 'border-purple-200'
        },
        {
            icon: <FiHeart className="w-8 h-8 text-[#E31B5C]" />,
            title: 'Your Lists',
            description: 'View, modify, and share your lists',
            link: '/wishlist',
            color: 'from-pink-50 to-rose-50',
            border: 'border-pink-200'
        },
        {
            icon: <FiHeadphones className="w-8 h-8 text-[#146EB4]" />,
            title: 'Customer Service',
            description: 'Browse self service options, help',
            link: '/customer-service',
            color: 'from-blue-50 to-sky-50',
            border: 'border-blue-200'
        },
    ];

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#FF9900] to-[#C7511F] rounded-full flex items-center justify-center shadow-lg">
                            <FiUser className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f1111]">Your Account</h1>
                            <p className="text-sm text-gray-600">
                                Welcome, <span className="font-semibold text-[#0f1111]">{user?.name || 'Customer'}</span>
                                <span className="ml-2 px-2 py-0.5 bg-[#F0F2F2] rounded text-xs font-medium text-gray-700 capitalize">{user?.role || 'buyer'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Account Hub Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {accountCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => card.link && navigate(card.link)}
                            className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-lg p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    {card.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-[#0f1111] group-hover:text-[#C7511F] transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-0.5">{card.description}</p>
                                </div>
                                <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#C7511F] transition-colors flex-shrink-0 mt-1" />
                            </div>

                            {/* Inline Login & Security Info */}
                            {card.title === 'Login & Security' && (
                                <div className="mt-4 pt-3 border-t border-gray-200 space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium text-[#0f1111]">{user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-[#0f1111]">{user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Role</span>
                                        <span className="font-medium text-[#0f1111] capitalize">{user?.role || 'buyer'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Become a Seller CTA (only for buyers) */}
                {user?.role === 'buyer' && (
                    <div className="bg-gradient-to-r from-[#232f3e] to-[#131921] rounded-lg p-6 mb-8 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#FF9900] rounded-lg">
                                <FiShoppingBag className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Start Selling on Amazon</h3>
                                <p className="text-sm text-gray-300 mt-0.5">
                                    Reach millions of customers. Register as a seller today!
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/seller/register')}
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0f1111] font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors text-sm whitespace-nowrap"
                        >
                            Register Now
                        </button>
                    </div>
                )}

                {/* Recent Orders Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-bold text-[#0f1111]">Recent Orders</h2>
                        <Link to="/orders" className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline">
                            View all orders →
                        </Link>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF9900]"></div>
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No orders yet</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Your recent orders will appear here.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0f1111] font-medium py-2 px-6 rounded-lg text-sm"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <FiTruck className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0f1111]">Order #{order.id}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                    {' · '}
                                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-sm font-bold text-[#B12704]">
                                                ${order.total_amount?.toFixed(2)}
                                            </span>
                                            <FiChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
