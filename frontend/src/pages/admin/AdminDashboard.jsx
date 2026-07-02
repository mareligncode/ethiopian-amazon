import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiTrendingUp, FiDollarSign, FiUsers, FiPackage, FiTruck, FiAlertTriangle, FiSettings, FiLogOut, FiRefreshCw, FiFilter, FiSearch, FiEye, FiEdit, FiTrash2, FiShield, FiUserCheck, FiUserX, FiActivity, FiBarChart2, FiPieChart, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiMail, FiPhone, FiMapPin, FiStar, FiCircle } from 'react-icons/fi';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Financial Overview State
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        platformCommission: 0,
        totalTransactions: 0,
        activeUsers: 0,
        monthlyRevenue: [],
        topSellers: [],
        recentTransactions: []
    });

    // User Directory State
    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('all'); // all, buyers, sellers, drivers, admins
    const [userSearch, setUserSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Platform Settings State
    const [settings, setSettings] = useState([]);
    const [savingSettings, setSavingSettings] = useState(false);

    // Order Dispute State
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('all'); // all, pending, processing, shipped, delivered, disputed
    const [orderSearch, setOrderSearch] = useState('');

    // Product Approvals State
    const [products, setProducts] = useState([]);
    const [productFilter, setProductFilter] = useState('all'); // all, pending, approved

    useEffect(() => {
        fetchAdminData();
        // Set up polling for real-time updates
        const interval = setInterval(fetchAdminData, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchAdminData = async () => {
        try {
            const endpoints = {
                overview: '/admin/stats',
                users: '/admin/users',
                orders: '/admin/global-orders',
                settings: '/admin/settings'
            };

            console.log("Fetching admin data from:", endpoints);

            const [overviewResult, usersResult, ordersResult, settingsResult, productsResult] = await Promise.allSettled([
                api.get(endpoints.overview),
                api.get(endpoints.users),
                api.get(endpoints.orders),
                api.get(endpoints.settings),
                api.get('/admin/products')
            ]);

            if (overviewResult.status === 'fulfilled') {
                console.log("Admin Overview Response:", overviewResult.value.data);
                setFinancialData(overviewResult.value.data);
            } else {
                console.error("Overview fetch failed:", overviewResult.reason);
            }

            if (usersResult.status === 'fulfilled') {
                console.log("Admin Users Response:", usersResult.value.data);
                setUsers(usersResult.value.data.users || []);
            } else {
                console.error("Users fetch failed:", usersResult.reason);
            }

            if (ordersResult.status === 'fulfilled') {
                console.log("Admin Orders Response:", ordersResult.value.data);
                setOrders(ordersResult.value.data.orders || []);
            } else {
                console.error("Orders fetch failed:", ordersResult.reason);
            }

            if (settingsResult.status === 'fulfilled') {
                console.log("Admin Settings Response:", settingsResult.value.data);
                setSettings(settingsResult.value.data.settings || []);
            } else {
                console.error("Settings fetch failed:", settingsResult.reason);
            }

            if (productsResult.status === 'fulfilled') {
                setProducts(productsResult.value.data.products || []);
            } else {
                console.error("Products fetch failed:", productsResult.reason);
            }

            if (overviewResult.status === 'rejected' && usersResult.status === 'rejected' && ordersResult.status === 'rejected') {
                setError("All admin data endpoints failed to load. Check console for details.");
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }
            setError(`Failed to load admin dashboard data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        try {
            switch (action) {
                case 'promote':
                    await api.put(`/admin/users/${userId}/role`, { role: 'admin' });
                    break;
                case 'suspend':
                    await api.put(`/admin/users/${userId}/activate`, { is_active: false });
                    break;
                case 'unsuspend':
                    await api.put(`/admin/users/${userId}/activate`, { is_active: true });
                    break;
                case 'verify':
                    // Note: This endpoint expects seller profile ID, assuming 1:1 with user ID here for simplicity 
                    // or that the backend handles it. In this schema, seller profile ID is usually same as user ID.
                    await api.put(`/admin/sellers/${userId}/verify`, { is_verified: true });
                    break;
                case 'delete':
                    await api.delete(`/admin/users/${userId}`);
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
            fetchAdminData();
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
            setError(`Failed to ${action} user: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleOrderIntervention = async (orderId, action) => {
        try {
            setError("Order intervention endpoints are not yet fully implemented in backend.");
            console.log(`Action ${action} requested for order ${orderId}`);
        } catch (error) {
            console.error(`Failed to ${action} order:`, error);
            setError(`Failed to ${action} order`);
        }
    };

    const handleProductApproval = async (productId, approve) => {
        try {
            await api.put(`/admin/products/${productId}/approve`, { is_approved: approve });
            fetchAdminData();
        } catch (error) {
            console.error(`Failed to ${approve ? 'approve' : 'reject'} product:`, error);
            setError(`Failed to update product: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleUpdateSetting = async (key, value) => {
        setSavingSettings(true);
        try {
            await api.put('/admin/settings', { key, value });
            // Refresh settings after update
            const response = await api.get('/admin/settings');
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Failed to update setting:', error);
            setError(`Failed to update setting: ${error.response?.data?.error || error.message}`);
        } finally {
            setSavingSettings(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'seller': return 'bg-blue-100 text-blue-800';
            case 'delivery': return 'bg-green-100 text-green-800';
            case 'buyer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'disputed': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = userFilter === 'all' || user.role === userFilter;
        const name = user.name || '';
        const email = user.email || '';
        const matchesSearch = userSearch === '' ||
            name.toLowerCase().includes(userSearch.toLowerCase()) ||
            email.toLowerCase().includes(userSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filteredOrders = orders.filter(order => {
        const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
        const matchesSearch = orderSearch === '' ||
            order.id.toString().includes(orderSearch) ||
            order.buyer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
            order.buyer_email?.toLowerCase().includes(orderSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-purple-600 text-white">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FiShield className="w-6 h-6 mr-2" />
                            <div>
                                <h1 className="text-lg font-semibold">Admin Command Center</h1>
                                <p className="text-xs text-purple-100">Platform Management Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-800 text-purple-100">
                                    Super Admin
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-purple-100 hover:text-white"
                            >
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="px-4">
                    <div className="flex space-x-6">
                        {[
                            { id: 'overview', label: 'Financial Overview', icon: FiBarChart2 },
                            { id: 'users', label: 'User Directory', icon: FiUsers },
                            { id: 'products', label: 'Product Approvals', icon: FiStar },
                            { id: 'orders', label: 'Order Console', icon: FiPackage },
                            { id: 'settings', label: 'System Settings', icon: FiSettings }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
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
                {/* Financial Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <FiDollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData?.totalRevenue || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FiTrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData?.platformCommission || 0)}</p>
                                        <p className="text-xs text-gray-500">10% of revenue</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FiActivity className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900">{financialData?.totalTransactions || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <FiUsers className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{financialData?.activeUsers || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts and Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <FiBarChart2 className="w-16 h-16" />
                                    <span className="ml-2">Revenue Chart Component</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <FiPieChart className="w-16 h-16" />
                                    <span className="ml-2">Commission Breakdown</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Sellers */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sellers</h3>
                            <div className="space-y-3">
                                {financialData.topSellers?.slice(0, 5).map((seller, index) => (
                                    <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-500 w-8">#{index + 1}</span>
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">{seller.name}</p>
                                                <p className="text-sm text-gray-500">{seller.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">{formatCurrency(seller.total_sales)}</p>
                                            <p className="text-sm text-gray-500">{seller.total_orders} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {financialData.recentTransactions?.slice(0, 10).map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{transaction.order_id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{transaction.customer_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(transaction.amount)}</td>
                                                <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(transaction.commission)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Directory Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">User Directory</h2>
                            <button
                                onClick={fetchAdminData}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex space-x-2">
                                    {['all', 'buyer', 'seller', 'delivery', 'admin'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setUserFilter(role)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${userFilter === role
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Search users..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users DataGrid */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <FiUsers className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.is_active ? 'active' : 'suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        {user.phone && <FiPhone className="w-3 h-3" />}
                                                        {user.email && <FiMail className="w-3 h-3" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        {user.role === 'seller' && user.seller_profile && !user.seller_profile.is_verified && (
                                                            <button
                                                                onClick={() => handleUserAction(user.id, 'verify')}
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Verify Seller"
                                                            >
                                                                <FiUserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleUserAction(user.id, 'promote')}
                                                                className="text-purple-600 hover:text-purple-700"
                                                                title="Promote to Admin"
                                                            >
                                                                <FiCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {user.is_active && (
                                                            <button
                                                                onClick={() => handleUserAction(user.id, 'suspend')}
                                                                className="text-orange-600 hover:text-orange-700"
                                                                title="Suspend User"
                                                            >
                                                                <FiUserX className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {!user.is_active && (
                                                            <button
                                                                onClick={() => handleUserAction(user.id, 'unsuspend')}
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Unsuspend User"
                                                            >
                                                                <FiCheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'delete')}
                                                            className="text-red-600 hover:text-red-700"
                                                            title="Delete User"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Console Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Global Order Console</h2>
                            <button
                                onClick={fetchAdminData}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex space-x-2">
                                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'disputed', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setOrderFilter(status)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${orderFilter === status
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                            placeholder="Search orders..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders DataGrid */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{order.buyer_name}</p>
                                                        <p className="text-sm text-gray-500">{order.buyer_email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{order.seller_name}</p>
                                                        <p className="text-sm text-gray-500">{order.seller_email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(order.total_amount)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    <div>
                                                        <p>{formatDate(order.created_at)}</p>
                                                        <p className="text-xs">{formatTime(order.created_at)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/orders/${order.id}`)}
                                                            className="text-purple-600 hover:text-purple-700"
                                                            title="View Order"
                                                        >
                                                            <FiEye className="w-4 h-4" />
                                                        </button>
                                                        {order.status === 'disputed' && (
                                                            <button
                                                                onClick={() => handleOrderIntervention(order.id, 'resolve')}
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Resolve Dispute"
                                                            >
                                                                <FiCheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {['pending', 'processing'].includes(order.status) && (
                                                            <button
                                                                onClick={() => handleOrderIntervention(order.id, 'cancel')}
                                                                className="text-red-600 hover:text-red-700"
                                                                title="Cancel Order"
                                                            >
                                                                <FiXCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Approvals Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Product Approvals</h2>
                            <button
                                onClick={fetchAdminData}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex space-x-2">
                                {['all', 'pending', 'approved'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setProductFilter(filter)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${productFilter === filter
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Products' : filter === 'pending' ? 'Pending Approval' : 'Approved'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products DataGrid */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products
                                            .filter(p => {
                                                if (productFilter === 'pending') return !p.is_approved;
                                                if (productFilter === 'approved') return p.is_approved;
                                                return true;
                                            })
                                            .map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover mr-3" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                                                                <FiPackage className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.brand || 'No brand'} &middot; SKU: {product.sku || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {product.seller?.store_name || `Seller #${product.seller_id}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {product.category?.name || 'Uncategorized'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.is_approved
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {product.is_approved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        {!product.is_approved && (
                                                            <button
                                                                onClick={() => handleProductApproval(product.id, true)}
                                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                                                title="Approve Product"
                                                            >
                                                                <FiCheckCircle className="w-3 h-3 mr-1" /> Approve
                                                            </button>
                                                        )}
                                                        {product.is_approved && (
                                                            <button
                                                                onClick={() => handleProductApproval(product.id, false)}
                                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                                                title="Revoke Approval"
                                                            >
                                                                <FiXCircle className="w-3 h-3 mr-1" /> Revoke
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.filter(p => {
                                            if (productFilter === 'pending') return !p.is_approved;
                                            if (productFilter === 'approved') return p.is_approved;
                                            return true;
                                        }).length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No products found matching this filter.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* System Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Configuration</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Commission Rate</p>
                                        <p className="text-sm text-gray-500">Current platform commission percentage</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-bold text-purple-600">10%</span>
                                        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                                        <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                                    </div>
                                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                                        Disable
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-500">System-wide email settings</p>
                                    </div>
                                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        Configure
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Platform Version</p>
                                    <p className="font-medium text-gray-900">v1.0.0</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Database Status</p>
                                    <p className="font-medium text-green-600">Healthy</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">API Response Time</p>
                                    <p className="font-medium text-gray-900">245ms</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Uptime</p>
                                    <p className="font-medium text-gray-900">99.9%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
