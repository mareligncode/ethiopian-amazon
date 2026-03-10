import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/images/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            // Redirect to reset page with email as state or just tell them to check email
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send reset code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-8">
            <Link to="/" className="mb-6">
                <img
                    src={logo}
                    alt="Logo"
                    className="w-16 h-16 rounded-full border-2 border-[#f0c14b] object-cover shadow-sm bg-white"
                />
            </Link>

            <div className="w-[350px] border border-gray-300 rounded p-6 shadow-sm">
                <h1 className="text-3xl font-normal mb-4">Password assistance</h1>
                <p className="text-sm mb-4">Enter the email address associated with your Amazon account. We will send you a 6-digit verification code.</p>

                {error && (
                    <div className="mb-4 p-3 border border-[#cc0000] bg-[#fff] rounded text-[#cc0000] flex text-sm">
                        <span className="font-bold mr-2">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="font-bold text-[13px] mb-1">Email</label>
                    <input
                        type="email"
                        className="border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 mb-4 shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f0c14b] border border-[#a88734] hover:bg-[#ebd083] rounded-sm py-1.5 shadow-sm text-sm"
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t font-bold text-[13px]">
                    Has your email address changed?
                </div>
                <p className="text-[13px] mt-1 italic">
                    If you no longer have access to the email address associated with your Amazon account, contact <span className="text-[#0066c0] hover:underline cursor-pointer">Customer Service</span> for help restoring access to your account.
                </p>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-100 w-full flex flex-col items-center bg-gray-50 h-full flex-grow text-xs text-[#0066c0] space-y-4">
                <div className="flex space-x-8">
                    <span className="hover:underline cursor-pointer">Conditions of Use</span>
                    <span className="hover:underline cursor-pointer">Privacy Notice</span>
                    <span className="hover:underline cursor-pointer">Help</span>
                </div>
                <div className="text-gray-500">© 1996-2026, Amazon.com, Inc. or its affiliates</div>
            </div>
        </div>
    );
};

export default ForgotPassword;
