import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SellerRegistrationForm from '../../components/SellerRegistrationForm';
import api from '../../services/api';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';

const SellerRegistration = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [existingApplication, setExistingApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'seller') {
            navigate('/seller/dashboard');
            return;
        }
        checkExistingApplication();
    }, [user, navigate]);

    const checkExistingApplication = async () => {
        try {
            const response = await api.get('/seller/application/status');
            if (response.data.application) {
                setExistingApplication(response.data.application);
            }
        } catch (error) {
            // No existing application
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
            </div>
        );
    }

    if (existingApplication) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center text-amazon-dark">
                    <FiShoppingBag className="w-16 h-16 text-amazon-orange mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900">Application Submitted</h2>
                    <div className="mb-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${existingApplication.status === 'approved' ? 'bg-green-100 text-[#007600] border-green-200' :
                            existingApplication.status === 'rejected' ? 'bg-red-100 text-[#B12704] border-red-200' :
                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                            {existingApplication.status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-6 font-medium">
                        {existingApplication.status === 'approved'
                            ? 'Your application is approved! You can now access your seller dashboard.'
                            : existingApplication.status === 'rejected'
                                ? 'Your application was rejected. Please contact support.'
                                : 'Your application is under review. We\'ll notify you once a decision has been made.'}
                    </p>
                    <button onClick={() => navigate('/')} className="amazon-button w-full">Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED] py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Become an Amazon Clone Seller</h1>
                    <p className="text-gray-600 mt-2 font-medium">Join thousands of businesses and start selling today.</p>
                </div>
                <SellerRegistrationForm onComplete={() => {
                    // Success is handled inside the form
                }} />
            </div>
        </div>
    );
};

export default SellerRegistration;
