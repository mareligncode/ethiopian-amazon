import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiStar, FiMessageSquare, FiChevronRight, FiCalendar, FiMapPin, FiXCircle } from 'react-icons/fi';

const OrderHistory = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/');
            console.log('DEBUG: Full Orders Array:', response.data.orders);
            console.log('DEBUG: Order Statuses:', response.data.orders?.map(o => o.status));
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'processing': return 'text-blue-600 bg-blue-50';
            case 'shipped': return 'text-purple-600 bg-purple-50';
            case 'delivered': return 'text-green-600 bg-green-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FiClock className="w-5 h-5 animate-pulse" />;
            case 'processing': return <FiPackage className="w-5 h-5" />;
            case 'shipped': return <FiTruck className="w-5 h-5" />;
            case 'delivered': return <FiCheckCircle className="w-5 h-5" />;
            case 'cancelled': return <FiXCircle className="w-5 h-5" />;
            default: return <FiPackage className="w-5 h-5" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateSubtotal = (items) => {
        return items.reduce((sum, item) => sum + (item.Product.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ffedc2] via-[#f8c471] to-[#ff9900]">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Your Orders</h1>
                    <p className="text-sm text-gray-600 mt-1">Track, return, or buy things again</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto py-3">
                        {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium capitalize transition-colors ${filter === status
                                    ? 'bg-amazon-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'All Orders' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders found.`}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF9900] hover:bg-[#F7CA00] text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amazon-orange"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white bg-opacity-80 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 animate-fadeIn">
                                {/* Order Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Order placed</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-300"></div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total</p>
                                                <p className="text-sm font-medium text-gray-900">${calculateSubtotal(order.items).toFixed(2)}</p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-300"></div>
                                            <div>
                                                <p className="text-sm text-gray-600">Ship to</p>
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {order.shipping_address?.split(',')[0] || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1 capitalize">{order.status}</span>
                                            </span>
                                            <button
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium flex items-center"
                                            >
                                                View order details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/orders/${order.id}/ticket`)}
                                                className="text-[#c45500] hover:text-[#C7511F] hover:underline text-sm font-bold flex items-center ml-4 border-l pl-4 border-gray-300"
                                            >
                                                Digital Ticket / Scanning
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={`${item.id}-${index}`} className="flex space-x-4">
                                                <img
                                                    src={item.Product.image_url || `https://picsum.photos/seed/${item.Product.id}/120/120`}
                                                    alt={item.Product.name}
                                                    className="w-20 h-20 object-contain bg-gray-50 rounded border border-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-[#0f1111] hover:text-[#C7511F] hover:underline cursor-pointer truncate" onClick={() => navigate(`/product/${item.Product.id}`)}>
                                                        {item.Product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.Product.category || 'Product'} • {item.condition || 'New'}
                                                    </p>
                                                    <div className="flex items-center mt-2">
                                                        <span className="text-sm text-gray-900 font-medium">Qty: {item.quantity}</span>
                                                        <span className="mx-2 text-gray-300">•</span>
                                                        <span className="text-[#B12704] text-sm font-bold">
                                                            ${(item.Product.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    {order.status === 'delivered' && (
                                                        <button 
                                                            onClick={() => navigate(`/orders/${order.id}/review/${item.Product.id}`)}
                                                            className="bg-white border border-gray-300 rounded shadow-sm text-sm font-medium hover:bg-gray-50 py-1 px-3"
                                                        >
                                                            Write review
                                                        </button>
                                                    )}
                                                    {['shipped', 'delivered'].includes(order.status) && (
                                                        <button className="bg-[#FFD814] border border-[#FCD200] rounded shadow-sm hover:bg-[#F7CA00] text-sm font-medium text-black py-1 px-3" onClick={() => navigate(`/orders/${order.id}`)}>
                                                            Track package
                                                        </button>
                                                    )}
                                                    {['pending', 'processing'].includes(order.status) && (
                                                        <button className="bg-white border border-gray-300 rounded shadow-sm text-sm font-medium hover:bg-gray-50 py-1 px-3">
                                                            Cancel item
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Actions Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <button className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium flex items-center">
                                                Contact seller
                                            </button>
                                            {order.status === 'delivered' && (
                                                <button className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium">
                                                    Return or replace items
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Order ID: #{order.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
