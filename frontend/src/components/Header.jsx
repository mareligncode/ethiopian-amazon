import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FiSearch, FiShoppingCart, FiMenu, FiMapPin, FiHeart, FiPackage, FiX, FiChevronRight, FiUser } from 'react-icons/fi';
import logo from '../assets/images/logo.png';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { getCartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const cartCount = getCartCount();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('q', searchQuery.trim());
        if (searchCategory && searchCategory !== 'All Departments') params.append('category', searchCategory);

        if (params.toString()) {
            navigate(`/search?${params.toString()}`);
        } else {
            navigate('/search');
        }
    };

    return (
        <header className="flex flex-col w-full text-white font-sans">
            {/* Top Nav - Amazon Dark Blue (#131921) */}
            <div className="bg-[#131921] h-[60px] flex items-center px-4 gap-2">

                {/* 1. Logo */}
                <Link to="/" className="flex items-center p-1 border border-transparent hover:border-white rounded cursor-pointer mt-1">
                    <img src={logo} alt="Logo" className="h-[50px] w-[50px] rounded-full object-cover border-2 border-white bg-white shadow-sm" />
                </Link>

                {/* 2. Deliver To */}
                <div className="hidden lg:flex items-center p-2 border border-transparent hover:border-white rounded cursor-pointer ml-1">
                    <FiMapPin className="text-lg mt-2 mr-1" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-[12px] text-[#ccc] font-normal">Deliver to</span>
                        <span className="text-[14px] font-bold">Global Area</span>
                    </div>
                </div>

                {/* 3. Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-1 h-[40px] ml-2 items-center rounded-[4px] overflow-hidden focus-within:ring-[3px] ring-[#febd69] bg-white text-black">
                    <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="bg-[#f3f3f3] h-full px-2 text-[12px] text-gray-700 border-r border-gray-300 rounded-l-[4px] cursor-pointer hover:bg-gray-200 focus:outline-none"
                    >
                        <option value="">All Departments</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Beauty">Beauty</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search Amazon"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 text-[15px] focus:outline-none h-full"
                    />
                    <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] h-full w-[45px] flex items-center justify-center cursor-pointer transition-colors">
                        <FiSearch className="text-black text-xl stroke-[3]" />
                    </button>
                </form>

                {/* 4. Language/Region (Mock) */}
                <div className="hidden xl:flex items-center p-2 pt-3 border border-transparent hover:border-white rounded cursor-pointer ml-2">
                    <span className="text-[14px] font-bold flex items-center">
                        <span className="text-lg mr-1 rotate-0">🇺🇸</span> EN <span className="text-[8px] ml-1 text-gray-400">▼</span>
                    </span>
                </div>

                {/* 5. Account & Lists */}
                {user ? (
                    <div className="flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer group relative leading-tight min-w-[130px]">
                        <span className="text-[12px] font-normal">Hello, {user.name.split(' ')[0]}</span>
                        <span className="text-[14px] font-bold flex items-center">Account & Lists <span className="text-[8px] ml-1 text-gray-400">▼</span></span>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-1 w-64 hidden group-hover:block z-[100]">
                            <div className="bg-white border border-gray-200 text-black shadow-xl rounded-sm py-4 px-5">
                                <div className="flex justify-between border-b pb-3 mb-3">
                                    <div className="flex flex-col gap-1 w-1/2">
                                        <h4 className="font-bold text-sm mb-1">Your Lists</h4>
                                        <Link to="/wishlist" className="hover:text-amazon-orange hover:underline text-[13px]">Create a List</Link>
                                        <Link to="/wishlist" className="hover:text-amazon-orange hover:underline text-[13px]">Find a List or Registry</Link>
                                    </div>
                                    <div className="flex flex-col gap-1 w-1/2 border-l pl-4">
                                        <h4 className="font-bold text-sm mb-1">Your Account</h4>
                                        <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'seller' ? 'seller/dashboard' : 'buyer'}/profile`} className="hover:text-amazon-orange hover:underline text-[13px]">Account Details</Link>
                                        <Link to="/orders" className="hover:text-amazon-orange hover:underline text-[13px]">Orders</Link>
                                        <Link to="/notifications" className="hover:text-amazon-orange hover:underline text-[13px]">Notifications</Link>
                                        <Link to="/compare" className="hover:text-amazon-orange hover:underline text-[13px]">Compare Products</Link>
                                        <div className="border-t mt-2 pt-2">
                                            <button onClick={logout} className="hover:text-amazon-orange hover:underline text-[13px] text-left w-full">Sign Out</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight min-w-[130px]">
                        <span className="text-[12px] font-normal text-[#ccc]">Hello, sign in</span>
                        <span className="text-[14px] font-bold flex items-center">Account & Lists <span className="text-[8px] ml-1 text-gray-400">▼</span></span>
                    </Link>
                )}

                {/* 6. Returns & Orders */}
                <Link to="/orders" className="hidden sm:flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight">
                    <span className="text-[12px] font-normal">Returns</span>
                    <span className="text-[14px] font-bold">& Orders</span>
                </Link>

                {/* 7. Cart */}
                <Link to="/cart" className="flex items-end p-2 border border-transparent hover:border-white rounded cursor-pointer relative group h-[50px] mb-1">
                    <div className="relative">
                        <span className="absolute -top-1 left-1/2 -translateX-1/2 text-[#f08804] font-bold text-[16px]">
                            {cartCount}
                        </span>
                        <FiShoppingCart className="text-[32px] text-white" />
                    </div>
                    <span className="text-[14px] font-bold mb-1 ml-1 self-end hidden md:inline">Cart</span>
                </Link>

            </div>

            {/* Sub Nav - Amazon Blue (#232f3e) */}
            <div className="bg-[#232f3e] h-[39px] flex items-center px-3 text-[14px] font-medium text-white relative">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex items-center hover:border-white border border-transparent px-2 py-1 h-full rounded cursor-pointer mr-2"
                >
                    <FiMenu className="text-xl mr-1" />
                    <span className="font-bold">All</span>
                </button>
                <div className="flex items-center space-x-1 overflow-x-hidden h-full">
                    {["Today's Deals", "Customer Service", "Registry", "Gift Cards", "Sell"].map((link) => {
                        let to = `/${link.toLowerCase().replace("'", "").replace(' ', '-')}`;
                        if (link === 'Sell') {
                            to = user?.role === 'seller' ? '/seller/dashboard' : '/seller/register';
                        }

                        return (
                            <Link
                                key={link}
                                to={to}
                                className="hover:border-white border border-transparent px-2 py-1 h-full rounded flex items-center whitespace-nowrap"
                            >
                                {link}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar / Drawer Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[200] flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    {/* Sidebar Content */}
                    <div className="relative w-[365px] bg-white h-full flex flex-col shadow-2xl animate-slide-in-left overflow-y-auto">
                        {/* Sidebar Header */}
                        <div className="bg-[#232f3e] text-white p-4 flex items-center shrink-0">
                            <FiUser className="text-2xl mr-3" />
                            <span className="text-lg font-bold">Hello, {user ? user.name.split(' ')[0] : 'Sign in'}</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="ml-auto text-white text-3xl font-light hover:text-gray-300"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Sidebar Sections */}
                        <div className="flex-1 text-[#111]">
                            <div className="py-4 border-b">
                                <h3 className="px-8 text-[18px] font-bold mb-2">Trending</h3>
                                <Link to="/todays-deals" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 flex items-center justify-between hover:bg-gray-100 mt-1">
                                    <span>Today's Deals</span>
                                </Link>
                                <Link to="/search?q=New Releases" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 flex items-center justify-between hover:bg-gray-100">
                                    <span>New Releases</span>
                                </Link>
                            </div>

                            <div className="py-4 border-b text-[14px]">
                                <h3 className="px-8 text-[18px] font-bold mb-2">Shop By Department</h3>
                                <div className="space-y-1">
                                    {['Electronics', 'Books', 'Home & Kitchen', 'Beauty'].map(dept => (
                                        <button
                                            key={dept}
                                            className="w-full px-8 py-3 flex items-center justify-between hover:bg-gray-100"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate(`/search?category=${encodeURIComponent(dept)}`);
                                            }}
                                        >
                                            <span>{dept}</span>
                                            <FiChevronRight className="text-gray-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="py-4 border-b text-[14px]">
                                <h3 className="px-8 text-[18px] font-bold mb-2">Help & Settings</h3>
                                <Link to="/buyer/profile" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 block hover:bg-gray-100">Your Account</Link>
                                <Link to="/customer-service" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 block hover:bg-gray-100">Customer Service</Link>
                                {user ? (
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left px-8 py-3 block hover:bg-gray-100">Sign Out</button>
                                ) : (
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 block hover:bg-gray-100">Sign In</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
