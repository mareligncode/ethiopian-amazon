import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiCreditCard, FiPlus, FiArrowRight } from 'react-icons/fi';

const GiftCardsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBalance();
        }
    }, [user]);

    const fetchBalance = async () => {
        try {
            const response = await api.get('/user/balance');
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Failed to fetch balance:", error);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const response = await api.post('/giftcards/redeem', { code });
            setMessage({ type: 'success', text: response.data.message });
            setBalance(response.data.balance);
            setCode("");
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || "Failed to redeem code. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                {/* Balance & Redemption Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <div className="bg-[#f0f2f2] p-8 rounded-lg flex flex-col justify-center items-center boreder border-gray-200">
                        <FiCreditCard className="text-5xl text-gray-400 mb-4" />
                        <h2 className="text-xl font-medium mb-2">Your Gift Card Balance</h2>
                        <div className="text-4xl font-bold text-[#b12704]">${balance.toFixed(2)}</div>
                        {!user && <p className="text-sm text-gray-500 mt-2 italic">Sign in to view your balance</p>}
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Redeem a Gift Card</h2>
                        <form onSubmit={handleRedeem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Enter claim code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="e.g. GFT-1234-ABCD"
                                        className="flex-1 p-2 border rounded outline-amazon-orange"
                                        required
                                        disabled={!user}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#ffd814] hover:bg-[#f7ca00] px-6 py-2 rounded-md font-medium shadow-sm active:shadow-inner"
                                        disabled={loading || !user}
                                    >
                                        {loading ? "Redeeming..." : "Redeem"}
                                    </button>
                                </div>
                            </div>
                            {message.text && (
                                <div className={`p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}
                            {!user && <p className="text-sm text-red-500">Please sign in to redeem codes.</p>}
                        </form>
                    </div>
                </div>

                {/* Promotional Hero */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-16 bg-[#232f3e] p-10 rounded-lg text-white">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-6">Give the perfect gift</h1>
                        <p className="text-xl text-gray-300 mb-8">Choose from thousands of designs or upload your own photo.</p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            <button
                                onClick={() => navigate('/search?q=eGift+Cards')}
                                className="bg-amazon-orange text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-[#f3a847]"
                            >
                                Shop eGift Cards
                            </button>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-8">Gift Card Occasions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {['Birthday', 'Thank You', 'Wedding', 'Any Occasion'].map((occ, i) => (
                        <div key={i} className="group cursor-pointer" onClick={() => navigate(`/search?q=${encodeURIComponent(occ + ' Gift Card')}`)}>
                            <div className="h-48 bg-[#f3f3f3] rounded-sm mb-2 overflow-hidden">
                                <img src={`https://picsum.photos/seed/${occ}/300/200`} alt={occ} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <span className="font-medium hover:text-amazon-orange">{occ}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GiftCardsPage;
