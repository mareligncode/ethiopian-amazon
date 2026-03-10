import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiTruck, FiUser, FiLock, FiEye, FiEyeOff, FiMapPin, FiClock, FiDollarSign, FiSmartphone } from 'react-icons/fi';

const DriverLogin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        employeeId: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Login with driver role
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
                role: 'delivery'
            });

            const { user, token } = response.data;

            // Verify user has delivery role
            if (user.role !== 'delivery') {
                setError('This account is not authorized for driver access');
                return;
            }

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update context
            login(user, token);

            // Navigate to driver dashboard
            navigate('/driver/dashboard');
        } catch (error) {
            console.error('Driver login failed:', error);
            setError(error.response?.data?.error || 'Invalid credentials or insufficient permissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            {/* Mobile-first container */}
            <div className="w-full max-w-md">
                {/* Amazon Logistics Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <FiTruck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Amazon Logistics</h1>
                    <p className="text-sm text-gray-600 mt-1">Driver Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white">Driver Sign In</h2>
                        <p className="text-blue-100 text-sm mt-1">Access your delivery routes</p>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Employee ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        placeholder="Enter your employee ID"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSmartphone className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="driver@amazon.com"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <FiEye className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Help Links */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Need help?{' '}
                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                    Contact Support
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Driver App Features */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Driver App Features</h3>
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            <span>View available delivery routes in your area</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <FiTruck className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            <span>Track active deliveries in real-time</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            <span>Flexible scheduling and route optimization</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <FiDollarSign className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            <span>Track earnings and payment history</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Amazon Logistics. All rights reserved.
                    </p>
                    <div className="mt-2 space-x-4">
                        <button className="text-xs text-blue-600 hover:text-blue-700">Privacy Policy</button>
                        <button className="text-xs text-blue-600 hover:text-blue-700">Terms of Service</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverLogin;
