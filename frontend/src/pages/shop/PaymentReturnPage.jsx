import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const txRef = searchParams.get('tx_ref');

    const [status, setStatus] = useState('loading'); // loading, success, failed
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        if (!txRef) {
            setStatus('failed');
            return;
        }

        const verifyPayment = async () => {
            try {
                // The Golang backend handles hitting the Chapa /v1/transaction/verify/ API 
                // and internally updating the Order status from 'pending' to 'processing'
                const response = await api.get(`/payments/chapa/return?tx_ref=${txRef}`);

                if (response.data.order_id) {
                    setOrderDetails(response.data);
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error("Verification failed:", error);
                setStatus('failed');
            }
        };

        verifyPayment();
    }, [txRef]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-amazon-orange mb-4"></div>
                <h1 className="text-2xl font-bold">Verifying Secure Payment...</h1>
                <p className="text-gray-500">Contacting Chapa Gateway. Do not refresh this page.</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col justify-center items-center py-20 bg-gray-50 min-h-screen">
                <FiXCircle className="text-red-600 text-[100px] mb-6" />
                <h1 className="text-3xl font-bold mb-4">Payment Failed or Declined</h1>
                <p className="text-gray-600 mb-8 max-w-md text-center">We could not process your transaction through Chapa. Your order has been placed on hold. Please try another payment method or contact your bank.</p>

                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded px-6 py-2 shadow-sm focus:ring-2 focus:ring-amazon-orange text-sm font-medium"
                    >
                        Return to Cart
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-6 py-2 shadow-sm text-sm font-medium"
                    >
                        View Pending Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pt-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded border shadow-sm flex flex-col items-center text-center">
                    <FiCheckCircle className="text-green-600 text-[80px] mb-4" />
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#C7511F]">Thank you, your order has been placed.</h1>

                    <p className="text-lg text-[#0f1111] font-medium mb-1">
                        An email confirmation has been sent to you.
                    </p>
                    <p className="text-md text-[#0f1111] font-medium mb-8">
                        Order Number: <span className="text-[#007185] hover:underline cursor-pointer">{orderDetails?.order_id || 'Generating...'}</span>
                    </p>

                    <div className="bg-green-50 w-full p-4 rounded text-left border border-green-200 mb-8">
                        <h3 className="font-bold text-green-800 mb-1">Payment Successfully Verified via Chapa</h3>
                        <p className="text-sm text-green-700 font-mono text-xs">Transaction Ref: {txRef}</p>
                    </div>

                    <div className="w-full border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div>
                            <h4 className="font-bold text-sm mb-2">Delivery expectation</h4>
                            <p className="text-sm">Guaranteed delivery before <span className="font-bold text-green-700">next Tuesday</span></p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-2">Track your package</h4>
                            <p className="text-sm">You can review the status or modify this order from the details section of your account.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded px-8 py-2 shadow-sm focus:ring-2 focus:ring-amazon-orange text-sm font-bold shadow-md"
                    >
                        Review or edit your recent orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-6 py-2 shadow-sm text-sm font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReturnPage;
