import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiPackage, FiTruck, FiCheckCircle, FiStar, FiMessageSquare, FiX, FiShoppingBag, FiUser, FiSettings, FiAlertTriangle, FiTrendingUp, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

const NotificationHub = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const dropdownRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Enhanced notification types for Phase 9
    const NOTIFICATION_TYPES = {
        ORDER_PLACED: 'order_placed',
        ORDER_UPDATE: 'order_update',
        ORDER_SHIPPED: 'order_shipped',
        ORDER_DELIVERED: 'order_delivered',
        REVIEW_REQUEST: 'review_request',
        SELLER_MESSAGE: 'seller_message',
        ACCOUNT_UPDATE: 'account_update',
        DELIVERY_UPDATE: 'delivery_update',
        PAYMENT_CONFIRMED: 'payment_confirmed',
        SELLER_APPROVED: 'seller_approved',
        PRODUCT_APPROVED: 'product_approved',
        SYSTEM_ALERT: 'system_alert',
        PROMOTION: 'promotion',
        EARNING_UPDATE: 'earning_update'
    };

    // Enhanced polling with error handling and reconnection logic
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Poll every 15 seconds for more real-time feel
        pollingIntervalRef.current = setInterval(async () => {
            try {
                await fetchNotifications(false); // Silent fetch
                setIsConnected(true);
            } catch (error) {
                console.error('Polling error:', error);
                setIsConnected(false);
                // Retry connection after 5 seconds
                setTimeout(() => {
                    fetchNotifications(true);
                }, 5000);
            }
        }, 15000);
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications(true);
            startPolling();

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [user, startPolling]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async (showLoading = false) => {
        if (showLoading) setLoading(true);

        try {
            const response = await api.get('/notifications', {
                params: {
                    limit: 50,
                    include_read: true
                }
            });

            const notificationData = response.data.notifications || [];
            setNotifications(notificationData);
            setUnreadCount(notificationData.filter(n => !n.read).length);
            setLastFetched(new Date());
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setIsConnected(false);

            // Show connection error indicator
            if (error.response?.status !== 401) {
                // Don't show error for auth issues, just for network issues
                setNotifications(prev => prev.length === 0 ? [] : prev);
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            const deleted = notifications.find(n => n.id === notificationId);
            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Enhanced navigation based on notification type
        switch (notification.type) {
            case NOTIFICATION_TYPES.ORDER_PLACED:
            case NOTIFICATION_TYPES.ORDER_UPDATE:
            case NOTIFICATION_TYPES.ORDER_SHIPPED:
            case NOTIFICATION_TYPES.ORDER_DELIVERED:
                navigate(`/orders/${notification.order_id}`);
                break;
            case NOTIFICATION_TYPES.REVIEW_REQUEST:
                navigate(`/orders/${notification.order_id}/review/${notification.product_id}`);
                break;
            case NOTIFICATION_TYPES.SELLER_MESSAGE:
                navigate(`/orders/${notification.order_id}`);
                break;
            case NOTIFICATION_TYPES.DELIVERY_UPDATE:
                navigate(`/orders/${notification.order_id}`);
                break;
            case NOTIFICATION_TYPES.PAYMENT_CONFIRMED:
                navigate(`/orders/${notification.order_id}`);
                break;
            case NOTIFICATION_TYPES.SELLER_APPROVED:
                navigate('/seller/dashboard');
                break;
            case NOTIFICATION_TYPES.PRODUCT_APPROVED:
                navigate('/seller/dashboard');
                break;
            case NOTIFICATION_TYPES.EARNING_UPDATE:
                navigate('/driver/dashboard?tab=stats');
                break;
            case NOTIFICATION_TYPES.ACCOUNT_UPDATE:
                if (user?.role === 'seller') {
                    navigate('/seller/dashboard');
                } else if (user?.role === 'delivery') {
                    navigate('/driver/dashboard');
                } else {
                    navigate('/buyer/profile');
                }
                break;
            default:
                navigate('/notifications');
        }

        setIsOpen(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.ORDER_PLACED:
                return <FiShoppingBag className="w-5 h-5 text-blue-500" />;
            case NOTIFICATION_TYPES.ORDER_UPDATE:
                return <FiPackage className="w-5 h-5 text-orange-500" />;
            case NOTIFICATION_TYPES.ORDER_SHIPPED:
                return <FiTruck className="w-5 h-5 text-purple-500" />;
            case NOTIFICATION_TYPES.ORDER_DELIVERED:
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case NOTIFICATION_TYPES.REVIEW_REQUEST:
                return <FiStar className="w-5 h-5 text-yellow-500" />;
            case NOTIFICATION_TYPES.SELLER_MESSAGE:
                return <FiMessageSquare className="w-5 h-5 text-indigo-500" />;
            case NOTIFICATION_TYPES.DELIVERY_UPDATE:
                return <FiTruck className="w-5 h-5 text-blue-600" />;
            case NOTIFICATION_TYPES.PAYMENT_CONFIRMED:
                return <FiDollarSign className="w-5 h-5 text-green-600" />;
            case NOTIFICATION_TYPES.SELLER_APPROVED:
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case NOTIFICATION_TYPES.PRODUCT_APPROVED:
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case NOTIFICATION_TYPES.EARNING_UPDATE:
                return <FiTrendingUp className="w-5 h-5 text-green-600" />;
            case NOTIFICATION_TYPES.SYSTEM_ALERT:
                return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
            case NOTIFICATION_TYPES.PROMOTION:
                return <FiStar className="w-5 h-5 text-purple-500" />;
            case NOTIFICATION_TYPES.ACCOUNT_UPDATE:
                return <FiUser className="w-5 h-5 text-gray-500" />;
            default:
                return <FiBell className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return time.toLocaleDateString();
    };

    const getNotificationColor = (notification) => {
        if (notification.read) return 'bg-white';

        // Priority colors for different types
        switch (notification.type) {
            case NOTIFICATION_TYPES.SYSTEM_ALERT:
                return 'bg-red-50 border-l-4 border-red-500';
            case NOTIFICATION_TYPES.ORDER_DELIVERED:
            case NOTIFICATION_TYPES.PAYMENT_CONFIRMED:
                return 'bg-green-50 border-l-4 border-green-500';
            default:
                return 'bg-orange-50 border-l-4 border-orange-500';
        }
    };

    const getPriorityClass = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.SYSTEM_ALERT:
                return 'border-red-200 bg-red-50';
            case NOTIFICATION_TYPES.ORDER_DELIVERED:
            case NOTIFICATION_TYPES.PAYMENT_CONFIRMED:
                return 'border-green-200 bg-green-50';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell with Connection Status */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
                title={isConnected ? "Notifications" : "Connection lost"}
            >
                <FiBell className={`w-6 h-6 ${!isConnected ? 'text-red-500' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                {!isConnected && (
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {/* Enhanced Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header with Status */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => fetchNotifications(true)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Refresh"
                                >
                                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                            </span>
                            {lastFetched && (
                                <span className="text-gray-400">
                                    Updated {formatTime(lastFetched)}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <div className="mt-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-80">
                        {loading && notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto mb-3"></div>
                                <p className="text-gray-500">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No notifications yet</p>
                                <p className="text-sm text-gray-400 mt-1">We'll notify you about important updates</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(notification)} group`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {formatTime(notification.created_at)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <FiX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {!notification.read && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNotificationClick(notification);
                                                            }}
                                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                                        >
                                                            View details
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationHub;
