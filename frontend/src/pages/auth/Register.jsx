import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/images/logo.png';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError("Passwords must match.");
            return;
        }

        setLoading(true);

        try {
            // Create user logic bound directly to backend /api/auth/register endpoint 
            await api.post('/auth/register', {
                name,
                email,
                password,
                role: 'buyer' // Base new users are always buyers
            });

            // If registration returns 201 Created successfully, redirect to login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create account. Email may be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-8">
            {/* Amazon Logo Only */}
            <Link to="/" className="mb-6">
                <img
                    src={logo}
                    alt="Logo"
                    className="w-16 h-16 rounded-full border-2 border-[#f0c14b] object-cover shadow-sm bg-white"
                />
            </Link>

            {/* Registration Box */}
            <div className="w-[350px] border border-gray-300 rounded p-6 shadow-sm">
                <h1 className="text-3xl font-normal mb-4">Create account</h1>

                {error && (
                    <div className="mb-4 p-3 border border-[#cc0000] bg-[#fff] rounded text-[#cc0000] flex text-sm">
                        <span className="font-bold mr-2">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">

                    <div>
                        <label className="font-bold text-[13px] block mb-1">Your name</label>
                        <input
                            type="text"
                            className="w-full border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 shadow-inner"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="First and last name"
                            required
                        />
                    </div>

                    <div>
                        <label className="font-bold text-[13px] block mb-1">Mobile number or email</label>
                        <input
                            type="email"
                            className="w-full border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 shadow-inner"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="font-bold text-[13px] block mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 shadow-inner placeholder-gray-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                        <p className="text-xs text-black italic mt-1 font-medium">Passwords must be at least 6 characters.</p>
                    </div>

                    <div>
                        <label className="font-bold text-[13px] block mb-1">Re-enter password</label>
                        <input
                            type="password"
                            className="w-full border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 shadow-inner"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f0c14b] border border-[#a88734] hover:bg-[#ebd083] rounded-sm py-1.5 shadow-sm text-sm mt-2"
                    >
                        {loading ? 'Creating account...' : 'Create your Amazon account'}
                    </button>
                </form>

                <p className="text-[12px] mt-6 leading-relaxed">
                    By creating an account, you agree to Amazon's <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
                </p>

                <div className="mt-8 pt-4 border-t border-gray-100 text-[13px]">
                    <p>Already have an account? <Link to="/login" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Sign in ➔</Link></p>
                    <p className="mt-1">Buying for work? <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Create a free business account ➔</span></p>
                </div>
            </div>

            {/* Footer is disconnected from global layout to mimic Amazon exactly */}
            <div className="mt-12 pt-6 border-t border-gray-100 w-full flex flex-col items-center bg-gray-50 h-[300px] text-xs text-[#0066c0] space-y-4">
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

export default Register;
