import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCalendar, FiPhone, FiMail, FiHome, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';

const OrderTracking = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackingHistory, setTrackingHistory] = useState([]);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
            fetchTrackingHistory();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            setLoading(false);
        }
    };

    const fetchTrackingHistory = async () => {
        try {
            const response = await api.get(`/orders/${id}/tracking`);
            setTrackingHistory(response.data.tracking || []);
        } catch (error) {
            console.error('Failed to fetch tracking history:', error);
        } finally {
            setLoading(false);
        }
    };

    const trackingSteps = [
        { key: 'pending', label: 'Order Placed', icon: FiClock, description: 'Your order has been received' },
        { key: 'processing', label: 'Processing', icon: FiPackage, description: 'Order is being prepared' },
        { key: 'shipped', label: 'Shipped', icon: FiTruck, description: 'Package is on the way' },
        { key: 'delivered', label: 'Delivered', icon: FiCheckCircle, description: 'Package has been delivered' }
    ];

    const getCurrentStepIndex = (status) => {
        const stepMap = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
        return stepMap[status] || 0;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-[#007185] hover:text-[#C7511F] font-medium hover:underline"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const currentStepIndex = getCurrentStepIndex(order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/orders')}
                            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
                        >
                            <FiChevronLeft className="w-5 h-5 mr-1" />
                            Back to Orders
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Track Your Package</h1>
                            <p className="text-sm text-gray-600 mt-1">Order ID: #{order.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Tracking Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h2>

                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded"></div>
                                <div
                                    className="absolute top-5 left-0 h-1 bg-[#007600] rounded transition-all duration-500"
                                    style={{ width: `${((currentStepIndex + 1) / trackingSteps.length) * 100}%` }}
                                ></div>

                                <div className="relative flex justify-between">
                                    {trackingSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isActive = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#007600] text-white' : 'bg-gray-200 text-gray-400'
                                                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 max-w-24">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Status */}
                            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-[#007600] rounded-full flex items-center justify-center text-white mr-4">
                                        {React.createElement(trackingSteps[currentStepIndex].icon, { className: 'w-6 h-6' })}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800">
                                            {trackingSteps[currentStepIndex].label}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {trackingSteps[currentStepIndex].description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking History */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Tracking History</h2>
                                <button
                                    onClick={fetchTrackingHistory}
                                    className="text-[#007185] hover:text-[#C7511F] text-sm font-medium flex items-center hover:underline"
                                >
                                    <FiRefreshCw className="w-4 h-4 mr-1" />
                                    Refresh
                                </button>
                            </div>

                            {trackingHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {trackingHistory.map((event, index) => (
                                        <div key={index} className="flex space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                </div>
                                                {index < trackingHistory.length - 1 && (
                                                    <div className="w-0.5 h-16 bg-gray-200 ml-4 mt-2"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{event.status}</p>
                                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                <p className="text-xs text-gray-500 mt-2">{formatDate(event.timestamp)}</p>
                                                {event.location && (
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                        <FiMapPin className="w-3 h-3 mr-1" />
                                                        {event.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">No tracking updates available yet</p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex space-x-4">
                                        <img
                                            src={item.Product.image_url || `https://picsum.photos/seed/${item.Product.id}/80/80`}
                                            alt={item.Product.name}
                                            className="w-20 h-20 object-contain bg-gray-50 rounded border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => navigate(`/product/${item.Product.id}`)}>{item.Product.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.Product.category || 'Product'} • Qty: {item.quantity}
                                            </p>
                                            <p className="text-sm font-bold text-[#B12704] mt-2">
                                                ${(item.Product.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <FiHome className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            {order.shipping_address || 'Address not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">${calculateSubtotal(order.items).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">$5.99</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900">${(calculateSubtotal(order.items) * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-[#B12704] text-lg">Total</span>
                                        <span className="font-bold text-[#B12704] text-lg">
                                            ${(calculateSubtotal(order.items) + 5.99 + (calculateSubtotal(order.items) * 0.08)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium flex items-center">
                                    <FiMail className="w-4 h-4 mr-2" />
                                    Contact Support
                                </button>
                                <button className="w-full text-left text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium flex items-center">
                                    <FiPhone className="w-4 h-4 mr-2" />
                                    Call Customer Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
