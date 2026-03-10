import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            // Store token & user payload internally within standard React Context wrapper
            login({
                id: response.data.user.id,
                name: response.data.user.name,
                email: response.data.user.email,
                role: response.data.user.role
            }, response.data.token);

            // Handle role-based redirects out of Auth system
            const role = response.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'seller') navigate('/seller/dashboard');
            else if (role === 'delivery') navigate('/driver/dashboard');
            else navigate('/'); // Buyer defaults to amazon.com homepage

        } catch (err) {
            setError(err.response?.data?.error || "We cannot find an account with that email address");
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

            {/* Login Box */}
            <div className="w-[350px] border border-gray-300 rounded p-6 shadow-sm">
                <h1 className="text-3xl font-normal mb-4">Sign in</h1>

                {error && (
                    <div className="mb-4 p-3 border border-[#cc0000] bg-[#fff] rounded text-[#cc0000] flex text-sm">
                        <span className="font-bold mr-2">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="font-bold text-[13px] mb-1">Email or mobile phone number</label>
                    <input
                        type="email"
                        className="border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 mb-3 shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="flex justify-between items-baseline mb-1">
                        <label className="font-bold text-[13px]">Password</label>
                        <Link to="/forgot-password" title="Forgot your password?" className="text-xs text-[#0066c0] hover:underline hover:text-[#c45500] cursor-pointer">
                            Forgot your password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        className="border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 mb-4 shadow-inner"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f0c14b] border border-[#a88734] hover:bg-[#ebd083] rounded-sm py-1.5 shadow-sm text-sm"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-[12px] mt-4 leading-relaxed">
                    By continuing, you agree to Amazon's <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
                </p>

                <div className="mt-8 border-b text-center relative pointer-events-none">
                    <span className="bg-white px-2 text-xs text-gray-500 absolute -bottom-2.5 left-1/2 -translate-x-1/2">
                        New to Amazon?
                    </span>
                </div>

                <Link to="/register" className="mt-6 w-full block">
                    <button className="w-full bg-[#e7e9ec] border border-[#adb1b8] hover:bg-[#d5d9d9] rounded-sm py-1.5 shadow-sm text-sm font-medium">
                        Create your Amazon account
                    </button>
                </Link>
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

export default Login;
