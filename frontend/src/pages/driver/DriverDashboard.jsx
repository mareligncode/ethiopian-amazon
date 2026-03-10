import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiTruck, FiMapPin, FiPackage, FiClock, FiDollarSign, FiUser, FiLogOut, FiRefreshCw, FiNavigation, FiPhone, FiMail, FiCalendar, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';

const DriverDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('routes');

    // Available Routes State
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [acceptingRoute, setAcceptingRoute] = useState(false);

    // Active Assignment State
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [assignmentProgress, setAssignmentProgress] = useState([]);

    // Driver Stats State
    const [driverStats, setDriverStats] = useState({
        todayDeliveries: 0,
        todayEarnings: 0,
        totalDeliveries: 0,
        averageRating: 0,
        currentStatus: 'available' // available, on_route, break, offline
    });

    useEffect(() => {
        fetchDriverData();
        // Set up real-time updates every 30 seconds
        const interval = setInterval(fetchDriverData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDriverData = async () => {
        try {
            const [routesRes, assignmentRes, statsRes] = await Promise.all([
                api.get('/driver/routes'),
                api.get('/driver/assignment'),
                api.get('/driver/stats')
            ]);

            setAvailableRoutes(routesRes.data.routes || []);
            setActiveAssignment(assignmentRes.data.assignment);
            setDriverStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch driver data:', error);
            setError('Failed to load driver data');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRoute = async (routeId) => {
        setAcceptingRoute(true);
        setError('');

        try {
            await api.post(`/driver/routes/${routeId}/accept`);
            setSelectedRoute(null);
            fetchDriverData();
            setActiveTab('assignment');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to accept route');
        } finally {
            setAcceptingRoute(false);
        }
    };

    const handleStartDelivery = async () => {
        try {
            await api.post('/driver/assignment/start');
            fetchDriverData();
        } catch (error) {
            setError('Failed to start delivery');
        }
    };

    const handleCompleteDelivery = async (deliveryId) => {
        navigate(`/driver/delivery/${deliveryId}/complete`);
    };

    const handleUpdateStatus = async (status) => {
        try {
            await api.put('/driver/status', { status });
            setDriverStats(prev => ({ ...prev, currentStatus: status }));
        } catch (error) {
            setError('Failed to update status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'on_route': return 'bg-blue-100 text-blue-800';
            case 'break': return 'bg-yellow-100 text-yellow-800';
            case 'offline': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FiTruck className="w-6 h-6 mr-2" />
                            <div>
                                <h1 className="text-lg font-semibold">Amazon Logistics</h1>
                                <p className="text-xs text-blue-100">Driver Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(driverStats.currentStatus)}`}>
                                    {driverStats.currentStatus.replace('_', ' ')}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-blue-100 hover:text-white"
                            >
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border-b">
                <div className="px-4 py-3">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{driverStats.todayDeliveries}</p>
                            <p className="text-xs text-gray-500">Today</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(driverStats.todayEarnings)}</p>
                            <p className="text-xs text-gray-500">Earned</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{driverStats.totalDeliveries}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{driverStats.averageRating?.toFixed(1) || 0}</p>
                            <p className="text-xs text-gray-500">Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="px-4">
                    <div className="flex space-x-6">
                        {[
                            { id: 'routes', label: 'Available Routes', icon: FiMapPin },
                            { id: 'assignment', label: 'Active Route', icon: FiTruck },
                            { id: 'stats', label: 'Earnings', icon: FiDollarSign },
                            { id: 'profile', label: 'Profile', icon: FiUser }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-1" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="px-4 py-2">
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="px-4 py-4">
                {/* Available Routes Tab */}
                {activeTab === 'routes' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Available Routes</h2>
                            <button
                                onClick={fetchDriverData}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {availableRoutes.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No available routes</h3>
                                <p className="text-sm text-gray-500">Check back later for new delivery opportunities</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableRoutes.map((route) => (
                                    <div key={route.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="font-medium text-gray-900">Route #{route.id}</h3>
                                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        {route.deliveries?.length || 0} deliveries
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span>{route.start_location} → {route.end_location}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiClock className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span>Est. {route.estimated_duration}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span className="font-medium text-gray-900">{formatCurrency(route.payment)}</span>
                                                    </div>
                                                </div>

                                                {route.deliveries && route.deliveries.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs text-gray-500 mb-2">Sample deliveries:</p>
                                                        <div className="space-y-1">
                                                            {route.deliveries.slice(0, 2).map((delivery, index) => (
                                                                <div key={index} className="text-xs text-gray-600">
                                                                    {delivery.address}
                                                                </div>
                                                            ))}
                                                            {route.deliveries.length > 2 && (
                                                                <div className="text-xs text-gray-400">
                                                                    +{route.deliveries.length - 2} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <button
                                                    onClick={() => handleAcceptRoute(route.id)}
                                                    disabled={acceptingRoute}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                                >
                                                    {acceptingRoute ? 'Accepting...' : 'Accept'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Active Assignment Tab */}
                {activeTab === 'assignment' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Active Route</h2>

                        {!activeAssignment ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No active assignment</h3>
                                <p className="text-sm text-gray-500 mb-4">Accept a route to get started</p>
                                <button
                                    onClick={() => setActiveTab('routes')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                                >
                                    View Available Routes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Route Overview */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Route #{activeAssignment.route_id}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${activeAssignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                            activeAssignment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {activeAssignment.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Start Time</p>
                                            <p className="font-medium">{formatTime(activeAssignment.start_time)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Progress</p>
                                            <p className="font-medium">
                                                {activeAssignment.completed_deliveries}/{activeAssignment.total_deliveries}
                                            </p>
                                        </div>
                                    </div>

                                    {activeAssignment.status === 'pending' && (
                                        <div className="mt-4">
                                            <button
                                                onClick={handleStartDelivery}
                                                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                                            >
                                                Start Delivery
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Deliveries List */}
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="px-4 py-3 border-b">
                                        <h4 className="font-medium text-gray-900">Deliveries</h4>
                                    </div>
                                    <div className="divide-y">
                                        {activeAssignment.deliveries?.map((delivery) => (
                                            <div key={delivery.id} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="font-medium text-gray-900">#{delivery.order_id}</span>
                                                            {delivery.status === 'completed' && (
                                                                <FiCheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">{delivery.customer_name}</p>
                                                        <p className="text-sm text-gray-500">{delivery.address}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {delivery.packages?.length || 1} package(s)
                                                        </p>
                                                    </div>
                                                    <div className="ml-4">
                                                        {delivery.status === 'assigned' && activeAssignment.status === 'active' && (
                                                            <button
                                                                onClick={() => handleCompleteDelivery(delivery.id)}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        {delivery.status === 'delivered' && (
                                                            <span className="text-green-600 text-sm font-medium">Done</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Earnings & Performance</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <FiDollarSign className="w-5 h-5 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">Today</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(driverStats.todayEarnings)}</p>
                                <p className="text-xs text-gray-500">From {driverStats.todayDeliveries} deliveries</p>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <FiTrendingUp className="w-5 h-5 text-blue-600" />
                                    <span className="text-xs text-blue-600 font-medium">This Week</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(driverStats.weekEarnings || 0)}</p>
                                <p className="text-xs text-gray-500">From {driverStats.weekDeliveries || 0} deliveries</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-900 mb-3">Performance Metrics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Deliveries</span>
                                    <span className="font-medium">{driverStats.totalDeliveries}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Average Rating</span>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-1">{driverStats.averageRating?.toFixed(1) || 0}</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`w-3 h-3 ${i < Math.floor(driverStats.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">On-Time Rate</span>
                                    <span className="font-medium">{driverStats.onTimeRate || 95}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Driver Profile</h2>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FiUser className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-medium text-gray-900">{user?.name}</h3>
                                    <p className="text-sm text-gray-500">Employee ID: {user?.employee_id}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(driverStats.currentStatus)}`}>
                                        {driverStats.currentStatus.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <FiMail className="w-4 h-4 text-gray-400 mr-3" />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiPhone className="w-4 h-4 text-gray-400 mr-3" />
                                    <span>{user?.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiCalendar className="w-4 h-4 text-gray-400 mr-3" />
                                    <span>Joined {new Date(user?.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-900 mb-3">Status Update</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['available', 'on_route', 'break', 'offline'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(status)}
                                        disabled={driverStats.currentStatus === status}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${driverStats.currentStatus === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } disabled:opacity-50`}
                                    >
                                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
