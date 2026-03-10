import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import banner from '../../assets/images/sofa.webp';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = React.useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'seller') navigate('/seller/dashboard');
            else if (user.role === 'delivery') navigate('/driver/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await api.get('/catalog');
                setProducts(response.data.products || []);
            } catch (err) {
                console.error("Failed to fetch catalog:", err);
                setError(`Failed to fetch catalog: ${err.message}`);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const ProductStrip = ({ title, products, link }) => (
        <div className="bg-white p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[21px] font-bold text-[#0F1111]">{title}</h2>
                {link && (
                    <Link to={link} className="text-[14px] text-amazon-blue hover:text-[#c45500] hover:underline font-medium">
                        See more
                    </Link>
                )}
            </div>
            <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                {products.map((item) => (
                    <div key={item.id} className="min-w-[180px] sm:min-w-[210px] h-full">
                        <ProductCard product={item} />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-[#eaeded] min-h-screen">
            <div className="max-w-[1500px] mx-auto relative">
                {/* Amazon Hero Banner */}
                <div className="relative">
                    <img
                        className="w-full h-[600px] object-cover"
                        src={banner}
                        alt="Amazon Hero"
                        onError={(e) => { e.target.src = 'https://picsum.photos/seed/hero/1500/600'; }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[350px] bg-gradient-to-t from-[#eaeded] to-transparent"></div>
                </div>

                {/* Top Fold Grid Overlay */}
                <div className="absolute top-[280px] w-full px-4 sm:px-6 z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Box 1: Multi-item Choice */}
                        <div className="bg-white p-5 flex flex-col shadow-sm">
                            <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Great deals on items you love</h2>
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                {products.slice(0, 4).map(p => (
                                    <Link key={p.id} to={`/product/${p.id}`} className="flex flex-col group">
                                        <div className="h-24 sm:h-28 overflow-hidden bg-[#f7f7f7] mb-1 flex items-center justify-center p-2">
                                            <img
                                                src={p.image_url || `https://picsum.photos/seed/${p.id}/150/150`}
                                                alt={p.name}
                                                className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <span className="text-[12px] text-[#0F1111] line-clamp-1 font-medium group-hover:text-[#c45500]">{p.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link to="/catalog" className="text-amazon-blue hover:text-[#c45500] hover:underline text-[13px] font-medium mt-4 inline-block">Shop all deals</Link>
                        </div>

                        {/* Box 2: Single item focus */}
                        <div className="bg-white p-5 flex flex-col shadow-sm">
                            <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Hot Trending Item</h2>
                            {products.length > 4 ? (
                                <Link to={`/product/${products[4].id}`} className="group flex flex-col flex-grow">
                                    <div className="h-60 bg-[#f7f7f7] mb-2 p-4 flex items-center justify-center">
                                        <img
                                            src={products[4].image_url}
                                            alt={products[4].name}
                                            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-[14px] font-medium text-[#0F1111] line-clamp-2">Get {products[4].name} at a great price!</p>
                                </Link>
                            ) : (
                                <div className="h-60 bg-gray-100 flex items-center justify-center">
                                    <p className="text-gray-400 text-sm">Product missing</p>
                                </div>
                            )}
                            <Link to="/catalog" className="text-amazon-blue hover:text-[#c45500] hover:underline text-[13px] font-medium mt-4">See more</Link>
                        </div>

                        {/* Box 3: Sign In (Amazon Classic) */}
                        <div className="bg-white p-5 flex flex-col shadow-sm">
                            <div className="flex-grow">
                                <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Welcome to Amazon Clone</h2>
                                <p className="text-[14px] leading-[20px] text-[#0F1111] mb-5">Sign in for your best experience, including personalized deals and order tracking.</p>
                                {!user ? (
                                    <>
                                        <Link to="/login" className="block w-full text-center py-2 bg-[#FFD814] hover:bg-[#F7CA00] rounded-sm font-medium text-[13px] border border-[#FCD200] mb-3">
                                            Sign in securely
                                        </Link>
                                        <Link to="/register" className="text-amazon-blue hover:underline text-xs">New? Register here</Link>
                                    </>
                                ) : (
                                    <div className="p-4 bg-gray-50 border rounded text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border">
                                            <FiUser className="text-gray-400 w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium">Hello, {user.name}</p>
                                        <Link to="/orders" className="text-amazon-blue text-xs hover:underline mt-1 block">Your Orders</Link>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <p className="text-[#00A8E1] font-bold text-sm mb-1 uppercase tracking-tight">prime</p>
                                <p className="text-[12px] text-gray-500 font-medium">Fast, free delivery on millions of items.</p>
                            </div>
                        </div>

                        {/* Box 4: Category/Service */}
                        <div className="bg-white p-5 flex flex-col shadow-sm">
                            <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Easy Returns & Service</h2>
                            <div className="bg-[#f7f7f7] h-60 flex flex-col items-center justify-center p-4 text-gray-400">
                                <FiShoppingCart className="w-12 h-12 mb-2" />
                                <p className="text-xs font-medium text-center italic">Hassle-free returns on all eligible items</p>
                            </div>
                            <Link to="/customer-service" className="text-amazon-blue hover:text-[#c45500] hover:underline text-[13px] font-medium mt-auto inline-block">Learn more</Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Strips */}
                <div className="mt-[240px] md:mt-[320px] px-4 sm:px-6 relative z-30 pb-20">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <ProductStrip title="Inspired by your wishlist" products={products.slice(0, 10)} link="/catalog" />
                            <ProductStrip title="Trending products you might like" products={[...products].reverse().slice(0, 10)} link="/catalog" />

                            {/* Grid Section midway */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-5 shadow-sm h-[380px]">
                                    <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Shop Deals in Electronics</h2>
                                    <Link to="/catalog">
                                        <img src="https://picsum.photos/seed/elec/300/300" className="w-full h-64 object-cover mb-2" alt="Elec" />
                                        <span className="text-amazon-blue text-xs font-medium hover:underline">Explore now</span>
                                    </Link>
                                </div>
                                <div className="bg-white p-5 shadow-sm h-[380px]">
                                    <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Refresh your Home</h2>
                                    <Link to="/catalog">
                                        <img src="https://picsum.photos/seed/home-ref/300/300" className="w-full h-64 object-cover mb-2" alt="Home" />
                                        <span className="text-amazon-blue text-xs font-medium hover:underline">See categories</span>
                                    </Link>
                                </div>
                                <div className="bg-white p-5 shadow-sm h-[380px]">
                                    <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Health & Beauty</h2>
                                    <Link to="/catalog">
                                        <img src="https://picsum.photos/seed/hb/300/300" className="w-full h-64 object-cover mb-2" alt="Health" />
                                        <span className="text-amazon-blue text-xs font-medium hover:underline">Shop now</span>
                                    </Link>
                                </div>
                                <div className="bg-white p-5 shadow-sm h-[380px]">
                                    <h2 className="text-[21px] font-bold mb-3 text-[#0F1111]">Daily Essentials</h2>
                                    <Link to="/catalog">
                                        <img src="https://picsum.photos/seed/ess/300/300" className="w-full h-64 object-cover mb-2" alt="Ess" />
                                        <span className="text-amazon-blue text-xs font-medium hover:underline">Discover more</span>
                                    </Link>
                                </div>
                            </div>

                            <ProductStrip title="Frequently repurchased items" products={products.slice(0, 10)} />
                        </>
                    ) : (
                        <div className="bg-white p-10 text-center shadow-sm">
                            <h2 className="text-xl font-bold">No products found</h2>
                        </div>
                    )}
                </div>

                {/* Back to Top */}
                <button
                    onClick={scrollToTop}
                    className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-4 text-[13px] font-medium transition-colors"
                >
                    Back to top
                </button>
            </div>
        </div>
    );
};

export default Home;
