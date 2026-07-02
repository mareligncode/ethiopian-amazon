import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import SellerRegistrationForm from '../../components/SellerRegistrationForm';
import {
    FiBarChart2, FiPackage, FiShoppingCart, FiStar, FiClock,
    FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiCamera, FiX,
    FiTruck, FiCheckCircle, FiMessageSquare, FiSend, FiUser, FiMapPin
} from 'react-icons/fi';

const SellerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(user?.role === 'seller' ? 'dashboard' : 'inventory');

    // Dashboard Analytics State
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        averageRating: 0
    });

    // Inventory State
    const [products, setProducts] = useState([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '1',
        brand: '',
        sku: '',
        weight: '',
        dimensions: '',
        images: []
    });

    // Orders State
    const [orders, setOrders] = useState([]);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchSellerData();
    }, [user?.role]);

    const fetchSellerData = async () => {
        try {
            setLoading(true);
            setError('');

            // Only fetch if user is a seller
            if (user?.role === 'seller' || user?.role === 'admin') {
                const [statsRes, productsRes, ordersRes, reviewsRes] = await Promise.allSettled([
                    api.get('/seller/dashboard/stats'),
                    api.get('/seller/products'),
                    api.get('/seller/orders'),
                    api.get('/seller/reviews')
                ]);

                if (statsRes.status === 'fulfilled') {
                    setAnalytics(statsRes.value.data.stats || statsRes.value.data);
                }
                if (productsRes.status === 'fulfilled') {
                    setProducts(productsRes.value.data.products || productsRes.value.data || []);
                }
                if (ordersRes.status === 'fulfilled') {
                    setOrders(ordersRes.value.data.items || []);
                }
                if (reviewsRes.status === 'fulfilled') {
                    setReviews(reviewsRes.value.data.reviews || []);
                }
            }
        } catch (err) {
            console.error('Error fetching seller data:', err);
            // Don't set error if it's just a 404 from a new seller
            if (err.response?.status === 403) {
                setError('Access Denied. If you just registered as a seller, please log out and log back in to refresh your permissions.');
            } else if (err.response?.status !== 404) {
                setError('Failed to load dashboard data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProductForm(prev => ({ ...prev, images: files }));
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '1',
            brand: '',
            sku: '',
            weight: '',
            dimensions: '',
            images: []
        });
        setEditingProduct(null);
        setShowAddProduct(false);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            Object.keys(productForm).forEach(key => {
                if (key === 'images') {
                    productForm.images.forEach(image => formData.append('images', image));
                } else {
                    formData.append(key, productForm[key]);
                }
            });

            if (editingProduct) {
                await api.put(`/seller/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/seller/products', formData);
            }

            await fetchSellerData();
            resetForm();
        } catch (err) {
            console.error('Error saving product:', err);
            if (err.response?.status === 403) {
                setError('Access Denied. Please ensure you are logged in with the correct seller permissions.');
            } else {
                setError(err.response?.data?.error || 'Failed to save product.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            category_id: product.category_id || '1',
            brand: product.brand || '',
            sku: product.sku || '',
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            images: [] // Reset images for update
        });
        setShowAddProduct(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            setLoading(true);
            await api.delete(`/seller/products/${productId}`);
            await fetchSellerData();
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access Denied. Unauthorized action.');
            } else {
                setError('Failed to delete product.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUpdateOrderStatus = async (orderItemId, newStatus) => {
        try {
            await api.put(`/seller/orders/${orderItemId}/status`, { status: newStatus });
            fetchSellerData();
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError(err.response?.data?.error || 'Failed to update order status.');
        }
    };

    const handleReplyToReview = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text?.trim()) return;
        try {
            await api.post(`/seller/reviews/${reviewId}/response`, { response: text });
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
            setReplyingTo(null);
            fetchSellerData();
        } catch (err) {
            console.error('Failed to reply to review:', err);
            setError(err.response?.data?.error || 'Failed to submit reply.');
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-amazon-orange fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Seller Central</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your business on Amazon Clone</p>
                        </div>
                        <button onClick={() => navigate('/')} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">
                            Switch to Buyer View
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
                            { id: 'inventory', label: 'Inventory', icon: FiPackage },
                            { id: 'orders', label: 'Order Fulfillment', icon: FiShoppingCart },
                            { id: 'reviews', label: 'Reviews', icon: FiStar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === tab.id
                                    ? 'border-amazon-orange text-[#C7511F]'
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 max-w-7xl mx-auto mt-4 rounded">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Revenue', value: formatCurrency(analytics.totalRevenue), icon: FiDollarSign, color: 'blue' },
                                { label: 'Total Orders', value: analytics.totalOrders, icon: FiShoppingCart, color: 'green' },
                                { label: 'Pending Orders', value: analytics.pendingOrders, icon: FiClock, color: 'yellow' },
                                { label: 'Total Products', value: analytics.totalProducts, icon: FiPackage, color: 'purple' }
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
                                            <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">{card.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-500">Analytics visualization coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {user?.role !== 'seller' ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="max-w-xl mx-auto text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Become a Seller</h2>
                                    <p className="text-gray-600">You need to complete your seller registration before you can manage inventory and list products for sale.</p>
                                </div>
                                <SellerRegistrationForm onComplete={fetchSellerData} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
                                            <p className="text-sm text-gray-600">View and manage your product listings</p>
                                        </div>
                                        <button onClick={() => setShowAddProduct(true)} className="amazon-button flex items-center">
                                            <FiPlus className="w-5 h-5 mr-2" /> Add Product
                                        </button>
                                    </div>

                                    {/* Product Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Product</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Price</th>
                                                    <th className="px-4 py-3">Stock</th>
                                                    <th className="px-4 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {products.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No products found. Start by adding your first product!</td>
                                                    </tr>
                                                ) : (
                                                    products.map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="px-4 py-4 font-medium text-gray-900">{p.name}</td>
                                                            <td className="px-4 py-4">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                                                            </td>
                                                            <td className="px-4 py-4">{formatCurrency(p.price)}</td>
                                                            <td className="px-4 py-4">{p.stock}</td>
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    onClick={() => handleEditProduct(p)}
                                                                    className="text-blue-600 hover:text-blue-800 font-medium mr-4 flex items-center inline-flex"
                                                                >
                                                                    <FiEdit2 className="w-3 h-3 mr-1" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProduct(p.id)}
                                                                    className="text-red-600 hover:text-red-800 font-medium flex items-center inline-flex"
                                                                >
                                                                    <FiTrash2 className="w-3 h-3 mr-1" /> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {user?.role !== 'seller' ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Access Required</h2>
                                <p className="text-gray-600">Complete your seller registration to manage orders.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Order Fulfillment</h2>
                                            <p className="text-sm text-gray-600">Manage and ship your customer orders</p>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {orders.length} item{orders.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No orders to fulfill yet. They'll appear here once a buyer purchases your products.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((item) => (
                                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-sm font-bold text-gray-900">Order Item #{item.id}</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Product:</span>
                                                                    <span className="ml-1 font-medium text-gray-900">{item.product?.name || `Product #${item.product_id}`}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Qty:</span>
                                                                    <span className="ml-1 font-medium text-gray-900">{item.quantity}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Revenue:</span>
                                                                    <span className="ml-1 font-medium text-green-700">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                                                                </div>
                                                            </div>
                                                            {item.order && (
                                                                <div className="mt-2 text-sm">
                                                                    <div className="flex items-center gap-1 text-gray-500">
                                                                        <FiMapPin className="w-3 h-3" />
                                                                        <span>Ship to: {item.order.shipping_address || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                                                                        <FiClock className="w-3 h-3" />
                                                                        <span>Ordered: {formatDate(item.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {item.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateOrderStatus(item.id, 'processing')}
                                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                                >
                                                                    <FiPackage className="w-3 h-3 mr-1" /> Start Processing
                                                                </button>
                                                            )}
                                                            {item.status === 'processing' && (
                                                                <button
                                                                    onClick={() => handleUpdateOrderStatus(item.id, 'shipped')}
                                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                                                                >
                                                                    <FiTruck className="w-3 h-3 mr-1" /> Mark Shipped
                                                                </button>
                                                            )}
                                                            {item.status === 'shipped' && (
                                                                <button
                                                                    onClick={() => handleUpdateOrderStatus(item.id, 'delivered')}
                                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                                                >
                                                                    <FiCheckCircle className="w-3 h-3 mr-1" /> Mark Delivered
                                                                </button>
                                                            )}
                                                            {['pending', 'processing'].includes(item.status) && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('Are you sure you want to cancel this order item?')) {
                                                                            handleUpdateOrderStatus(item.id, 'cancelled');
                                                                        }
                                                                    }}
                                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                                                >
                                                                    <FiX className="w-3 h-3 mr-1" /> Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {user?.role !== 'seller' ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Access Required</h2>
                                <p className="text-gray-600">Complete your seller registration to view and respond to reviews.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
                                            <p className="text-sm text-gray-600">View and respond to feedback on your products</p>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {reviews.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No reviews yet. Reviews will appear here once customers start providing feedback.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="flex">{renderStars(review.rating)}</div>
                                                                <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <FiUser className="w-3 h-3" />
                                                                <span>{review.user?.name || 'Anonymous Buyer'}</span>
                                                                <span>&middot;</span>
                                                                <span>{formatDate(review.created_at)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Product: <span className="font-medium text-gray-700">{review.product?.name || `#${review.product_id}`}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-700 my-3">{review.comment}</p>

                                                    {/* Existing seller response */}
                                                    {review.response ? (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <FiMessageSquare className="w-3 h-3 text-blue-600" />
                                                                <span className="text-xs font-semibold text-blue-700">Your Response</span>
                                                            </div>
                                                            <p className="text-sm text-blue-800">{review.response.response}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3">
                                                            {replyingTo === review.id ? (
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={replyText[review.id] || ''}
                                                                        onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                                        placeholder="Write your response..."
                                                                        className="amazon-input flex-1 text-sm"
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleReplyToReview(review.id); }}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleReplyToReview(review.id)}
                                                                        disabled={!replyText[review.id]?.trim()}
                                                                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-amazon-orange text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <FiSend className="w-3 h-3 mr-1" /> Send
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setReplyingTo(null); setReplyText(prev => ({ ...prev, [review.id]: '' })); }}
                                                                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setReplyingTo(review.id)}
                                                                    className="inline-flex items-center text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
                                                                >
                                                                    <FiMessageSquare className="w-3 h-3 mr-1" /> Reply to this review
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="amazon-input"
                                                value={productForm.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                            <textarea
                                                name="description"
                                                rows="3"
                                                className="amazon-input"
                                                value={productForm.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="price"
                                                required
                                                className="amazon-input"
                                                value={productForm.price}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                required
                                                className="amazon-input"
                                                value={productForm.stock}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                            <select
                                                name="category_id"
                                                className="amazon-input"
                                                value={productForm.category_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="1">Electronics</option>
                                                <option value="2">Fashion</option>
                                                <option value="3">Home & Kitchen</option>
                                                <option value="4">Beauty</option>
                                                <option value="5">Toys & Games</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                className="amazon-input"
                                                value={productForm.brand}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Product Images</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-amazon-orange transition-colors">
                                                <div className="space-y-1 text-center">
                                                    <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-amazon-blue hover:text-indigo-500 focus-within:outline-none">
                                                            <span>Upload images</span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                className="sr-only"
                                                                onChange={handleFileChange}
                                                                accept="image/*"
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                                    {productForm.images.length > 0 && (
                                                        <p className="text-sm text-green-600 font-bold">{productForm.images.length} files selected</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="amazon-button min-w-[120px]"
                                        >
                                            {loading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
