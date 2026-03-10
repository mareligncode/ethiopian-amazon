import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

const DealsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await api.get('/catalog');
                // Filter only products that have a discount price
                const dealProducts = (response.data.products || []).filter(p => p.discount_price && p.discount_price > 0);
                setProducts(dealProducts);
            } catch (error) {
                console.error("Failed to fetch deals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    return (
        <div className="bg-[#eaeded] min-h-screen pb-10">
            <div className="max-w-[1500px] mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
                    <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Today's Deals</h1>
                    <p className="text-gray-600 text-sm">New deals. Every day. Shop our selection of limited-time deals.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e47911]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealsPage;
