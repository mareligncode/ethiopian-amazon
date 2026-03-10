import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/images/logo.png';

const ResetPassword = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const userEmail = location.state?.email || '';
    const inputRefs = React.useRef([]);

    const handleOtpChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move focus to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus the last filled box or the next empty one
        const nextIndex = data.length < 6 ? data.length : 5;
        inputRefs.current[nextIndex].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError("Please enter the full 6-digit verification code.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token: otpString,
                new_password: newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired verification code.");
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

            <div className="w-[380px] border border-gray-300 rounded p-7 shadow-sm">
                <h1 className="text-3xl font-normal mb-4">Verification required</h1>
                <p className="text-sm mb-6">
                    To continue, complete this verification step. We've sent a 6-digit code to
                    <span className="font-bold"> {userEmail || "your email"}</span>.
                </p>

                {error && (
                    <div className="mb-4 p-3 border border-[#cc0000] bg-[#fff] rounded text-[#cc0000] flex text-sm">
                        <span className="font-bold mr-2">!</span> {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 border border-[#067D62] bg-[#f7fffb] rounded text-[#067D62] text-sm font-medium">
                        Password updated! Redirecting to sign-in...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="font-bold text-[13px] mb-3">Enter verification code</label>
                    <div className="flex justify-between gap-2 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                className="w-11 h-12 border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none text-center font-bold text-xl shadow-inner"
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                required
                            />
                        ))}
                    </div>

                    <label className="font-bold text-[13px] mb-1">New password</label>
                    <input
                        type="password"
                        placeholder="At least 6 characters"
                        className="border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 mb-3 shadow-inner"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                    />

                    <label className="font-bold text-[13px] mb-1">Confirm new password</label>
                    <input
                        type="password"
                        className="border border-[#a6a6a6] rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none p-1.5 mb-7 shadow-inner"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full bg-[#f0c14b] border border-[#a88734] hover:bg-[#ebd083] rounded-sm py-1.5 shadow-sm text-sm font-medium"
                    >
                        {loading ? 'Verifying...' : 'Set new password'}
                    </button>
                </form>

                <p className="text-[12px] text-gray-600 mt-4 text-center">
                    Didn't receive a code? <Link to="/forgot-password" size="small" className="text-[#0066c0] hover:underline">Resend code</Link>
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

export default ResetPassword;
