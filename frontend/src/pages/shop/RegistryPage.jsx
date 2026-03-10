import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiPlus, FiTrash2, FiExternalLink, FiSearch, FiGift, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const RegistryPage = () => {
    const { user } = useContext(AuthContext);
    const [registries, setRegistries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'wedding', is_public: true });

    useEffect(() => {
        if (user) {
            fetchRegistries();
        }
    }, [user]);

    const fetchRegistries = async () => {
        try {
            const response = await api.get('/registries');
            setRegistries(response.data);
        } catch (error) {
            console.error("Failed to fetch registries:", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/registries', formData);
            await fetchRegistries();
            setIsModalOpen(false);
            setFormData({ title: '', type: 'wedding', is_public: true });
        } catch (error) {
            alert("Failed to create registry");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this registry?")) return;
        try {
            await api.delete(`/registries/${id}`);
            setRegistries(registries.filter(r => r.id !== id));
        } catch (error) {
            alert("Failed to delete registry");
        }
    };

    return (
        <div className="bg-[#eaeded] min-h-screen pb-20">
            <div className="max-w-[1200px] mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="bg-white p-10 text-center rounded-sm shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FiGift size={150} />
                    </div>
                    <h1 className="text-4xl font-bold text-[#0F1111] mb-4">Registry & Gifting</h1>
                    <p className="text-xl text-gray-600 mb-8">Celebrate life's big moments by sharing your wishlist with friends and family.</p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => user ? setIsModalOpen(true) : window.location.href = '/login'}
                            className="bg-[#ffd814] hover:bg-[#f7ca00] px-8 py-3 rounded-full font-bold shadow-sm"
                        >
                            Create a Registry
                        </button>
                        <button
                            onClick={() => window.location.href = '/search'}
                            className="bg-white border hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-sm"
                        >
                            Find a Registry
                        </button>
                    </div>
                </div>

                {/* User's Registries */}
                {user && (
                    <div className="bg-white p-8 rounded-sm shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <FiGift className="mr-2 text-amazon-orange" /> Your Registries
                        </h2>
                        {registries.length > 0 ? (
                            <div className="space-y-4">
                                {registries.map(reg => (
                                    <div key={reg.id} className="flex items-center justify-between p-6 border rounded-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#0F1111]">{reg.title}</h3>
                                            <p className="text-gray-500 text-sm capitalize">{reg.type} • {reg.items?.length || 0} items</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="text-amazon-blue hover:underline flex items-center font-medium">
                                                Share <FiExternalLink className="ml-1" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reg.id)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed rounded-sm">
                                <p className="text-gray-500 mb-4">You haven't created any registries yet.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-amazon-blue hover:underline font-bold"
                                >
                                    Start your first list now
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Registry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 animate-slide-in-up">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Create New Registry</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black"><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Registry Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-amazon-orange outline-none"
                                    placeholder="e.g. John & Jane's Wedding"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Occasion Type</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-amazon-orange outline-none"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="wedding">Wedding</option>
                                    <option value="baby">Baby Shower</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isPersonal"
                                    checked={formData.is_public}
                                    onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                                />
                                <label htmlFor="isPersonal" className="text-sm">Make registry public</label>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] font-bold py-3 rounded-md shadow-sm mt-4"
                            >
                                {loading ? "Creating..." : "Create Registry"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistryPage;
