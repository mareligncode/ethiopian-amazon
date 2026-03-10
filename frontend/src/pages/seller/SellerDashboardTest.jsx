import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SellerDashboardTest = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory');
    const [products, setProducts] = useState([
        { id: 1, name: 'Test Product 1', price: 29.99, stock: 10, category: 'Electronics' },
        { id: 2, name: 'Test Product 2', price: 49.99, stock: 5, category: 'Books' }
    ]);

    useEffect(() => {
        console.log('SellerDashboardTest mounted');
        console.log('User:', user);
        console.log('Active tab:', activeTab);
    }, [activeTab, user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">Please log in as a seller to access this page.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[#FF9900] hover:bg-[#FF7700] text-black px-4 py-2 rounded-md font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">This page is only available for sellers.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#FF9900] hover:bg-[#FF7700] text-black px-4 py-2 rounded-md font-medium"
                    >
                        Go to Home
                    </button>
                </div>
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
                            <h1 className="text-2xl font-semibold text-gray-900">Seller Central (Test)</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your business on Amazon Clone</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Switch to Buyer View
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8">
                        {[
                            { id: 'dashboard', label: 'Dashboard' },
                            { id: 'inventory', label: 'Inventory' },
                            { id: 'orders', label: 'Orders' },
                            { id: 'reviews', label: 'Reviews' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-[#FF9900] text-[#FF9900]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 m-4">
                <h3 className="font-bold text-yellow-800 mb-2">Debug Info:</h3>
                <p>User: {user ? `${user.name} (${user.role})` : 'Not logged in'}</p>
                <p>Active Tab: {activeTab}</p>
                <p>Products Count: {products.length}</p>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h2>
                            <p className="text-sm text-gray-600 mb-4">You have {products.length} products in your inventory.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-600">{product.category}</p>
                                        <p className="text-lg font-bold text-[#B12704]">${product.price}</p>
                                        <p className="text-sm text-green-600">Stock: {product.stock}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
                        <p className="text-gray-600">Dashboard content goes here.</p>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Fulfillment</h2>
                        <p className="text-gray-600">Order management content goes here.</p>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
                        <p className="text-gray-600">Customer reviews content goes here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboardTest;
