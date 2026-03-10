import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiBell, FiPackage, FiTruck, FiCheckCircle, FiStar, FiMessageSquare, FiX, FiShoppingBag, FiUser, FiSettings, FiAlertTriangle, FiTrendingUp, FiDollarSign, FiRefreshCw, FiSearch, FiFilter, FiCalendar, FiClock, FiTrash2, FiCheck, FiEye, FiArchive } from 'react-icons/fi';

const NotificationsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all'); // all, order, delivery, payment, system, account
    const [searchQuery, setSearchQuery] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [lastFetched, setLastFetched] = useState(null);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

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

    const NOTIFICATION_CATEGORIES = {
        ORDER: ['order_placed', 'order_update', 'order_shipped', 'order_delivered'],
        DELIVERY: ['delivery_update'],
        PAYMENT: ['payment_confirmed'],
        SYSTEM: ['system_alert', 'promotion'],
        ACCOUNT: ['account_update', 'seller_approved', 'product_approved', 'earning_update'],
        REVIEW: ['review_request', 'seller_message']
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling for real-time updates
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [filter, typeFilter, searchQuery]);

    const fetchNotifications = async () => {
        try {
            const params = {
                limit: 100,
                include_read: true
            };

            if (filter !== 'all') {
                params.read = filter === 'read';
            }

            if (typeFilter !== 'all') {
                params.category = typeFilter;
            }

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await api.get('/notifications', { params });
            const notificationData = response.data.notifications || [];
            setNotifications(notificationData);
            setLastFetched(new Date());
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const deleteSelectedNotifications = async () => {
        try {
            await Promise.all(selectedNotifications.map(id => api.delete(`/notifications/${id}`)));
            setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Failed to delete selected notifications:', error);
        }
    };

    const archiveSelectedNotifications = async () => {
        try {
            await Promise.all(selectedNotifications.map(id => api.patch(`/notifications/${id}/archive`)));
            setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Failed to archive selected notifications:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
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

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getNotificationCategory = (type) => {
        for (const [category, types] of Object.entries(NOTIFICATION_CATEGORIES)) {
            if (types.includes(type)) return category.toLowerCase();
        }
        return 'other';
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

    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && !notification.read) ||
            (filter === 'read' && notification.read);

        const matchesType = typeFilter === 'all' ||
            getNotificationCategory(notification.type) === typeFilter;

        const matchesSearch = searchQuery === '' ||
            notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesType && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const readCount = notifications.filter(n => n.read).length;

    const toggleNotificationSelection = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const toggleAllSelections = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <FiClock className="w-4 h-4" />
                                {lastFetched && <span>Last updated {formatTime(lastFetched)}</span>}
                            </div>
                            <button
                                onClick={fetchNotifications}
                                className="text-gray-500 hover:text-gray-700"
                                title="Refresh"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Status Filters */}
                        <div className="flex space-x-1">
                            {['all', 'unread', 'read'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? `All (${notifications.length})` :
                                        status === 'unread' ? `Unread (${unreadCount})` :
                                            `Read (${readCount})`}
                                </button>
                            ))}
                        </div>

                        {/* Category Filters */}
                        <div className="flex items-center space-x-2">
                            <FiFilter className="w-4 h-4 text-gray-500" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="order">Orders</option>
                                <option value="delivery">Delivery</option>
                                <option value="payment">Payments</option>
                                <option value="system">System</option>
                                <option value="account">Account</option>
                                <option value="review">Reviews</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notifications..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedNotifications.length > 0 && (
                        <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-blue-800">
                                    {selectedNotifications.length} selected
                                </span>
                                <button
                                    onClick={toggleAllSelections}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Select all
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Mark as read
                                </button>
                                <button
                                    onClick={archiveSelectedNotifications}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Archive
                                </button>
                                <button
                                    onClick={deleteSelectedNotifications}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <FiBell className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {filter === 'unread' ? 'No unread notifications' :
                                filter === 'read' ? 'No read notifications' :
                                    'No notifications found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'unread' ? 'All your notifications have been read.' :
                                filter === 'read' ? 'No read notifications to show.' :
                                    searchQuery ? 'Try adjusting your search terms.' :
                                        'We\'ll notify you about important updates here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Select All Checkbox */}
                        <div className="flex items-center px-4 py-2 bg-gray-50 rounded-t-lg">
                            <input
                                type="checkbox"
                                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                                onChange={toggleAllSelections}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Select all</span>
                        </div>

                        {/* Notification Items */}
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg border shadow-sm transition-all ${getNotificationColor(notification)} ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-orange-500' : ''
                                    }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={() => toggleNotificationSelection(notification.id)}
                                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-3"
                                        />

                                        <div className="flex-shrink-0 mr-3">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-1">
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <FiCalendar className="w-3 h-3 mr-1" />
                                                            {formatDate(notification.created_at)}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <FiClock className="w-3 h-3 mr-1" />
                                                            {formatTime(notification.created_at)}
                                                        </span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                                                            {getNotificationCategory(notification.type)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 ml-4">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-orange-600 hover:text-orange-700 p-1"
                                                            title="Mark as read"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className="text-blue-600 hover:text-blue-700 p-1"
                                                        title="View details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-red-600 hover:text-red-700 p-1"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {filteredNotifications.length > 0 && notifications.length > filteredNotifications.length && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                // Load more functionality
                            }}
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                            Load more notifications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
