import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const Cart = () => {
    const {
        cartItems,
        savedItems,
        loading,
        updateQuantity,
        removeFromCart,
        toggleSaveForLater,
        getCartTotal,
        getCartCount
    } = useContext(CartContext);

    const navigate = useNavigate();

    if (loading) {
        return <div className="min-h-screen bg-gray-100 p-8 text-center text-xl">Loading your cart...</div>;
    }

    const activeCount = getCartCount();
    const subtotal = getCartTotal();

    return (
        <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column: Active Shopping Cart Items */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 shadow-sm">
                        <h1 className="text-3xl font-normal mb-1">Shopping Cart</h1>
                        {activeCount > 0 && <p className="text-right text-gray-500 text-sm border-b pb-2">Price</p>}

                        {activeCount === 0 ? (
                            <div className="py-8 border-t">
                                <h2 className="text-xl font-bold mb-2">Your Amazon Cart is empty.</h2>
                                <p className="text-sm">Check your Saved for later items below or <Link to="/" className="text-[#007185] hover:text-[#C7511F] hover:underline">continue shopping.</Link></p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 border-t">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="py-4 flex flex-col sm:flex-row gap-4">
                                        {/* Checkbox placeholder mimicking Amazon */}
                                        <div className="pt-2 hidden sm:block">
                                            <input type="checkbox" className="w-4 h-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 rounded" defaultChecked />
                                        </div>

                                        <div className="w-[150px] sm:w-[180px] h-[180px] flex-shrink-0 bg-white">
                                            <Link to={`/product/${item.Product.id}`}>
                                                <img
                                                    src={item.Product.image_url || `https://picsum.photos/seed/${item.Product.id}/200/200`}
                                                    alt={item.Product.name}
                                                    className="w-full h-full object-contain cursor-pointer"
                                                />
                                            </Link>
                                        </div>

                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <Link to={`/product/${item.Product.id}`} className="text-lg font-medium text-[#0f1111] hover:text-[#C7511F] hover:underline line-clamp-2 pr-4">
                                                        {item.Product.name}
                                                    </Link>
                                                    <p className="text-lg font-bold text-black sm:hidden">${item.Product.price.toFixed(2)}</p>
                                                </div>
                                                <p className="text-xs text-[#007600] mt-1 font-medium">In Stock</p>
                                                <p className="text-xs text-gray-500 mt-1">Eligible for FREE Shipping & FREE Returns</p>

                                                {/* Simulation of Variations/Options */}
                                                {item.gift_options && (
                                                    <div className="mt-1 flex items-center text-xs text-gray-700">
                                                        <input type="checkbox" className="mr-1" defaultChecked={item.is_gift} /> This is a gift
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-3 mt-4 text-xs font-medium text-[#007185]">
                                                <div className="bg-[#F0F2F2] border border-gray-300 rounded shadow-sm overflow-hidden flex text-black">
                                                    <span className="px-2 py-1 bg-gray-100 border-r border-gray-300 text-gray-600 block  select-none">Qty:</span>
                                                    <select
                                                        className="bg-transparent pl-2 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-amazon-orange appearance-none relative z-10 font-bold"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                                    >
                                                        <option value="0">0 (Delete)</option>
                                                        {[...Array(10).keys()].map(i => (
                                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <span className="text-gray-300">|</span>
                                                <button onClick={() => removeFromCart(item.id)} className="hover:underline cursor-pointer">Delete</button>
                                                <span className="text-gray-300">|</span>
                                                <button onClick={() => toggleSaveForLater(item.id)} className="hover:underline cursor-pointer">Save for later</button>
                                                <span className="text-gray-300">|</span>
                                                <button className="hover:underline cursor-pointer">Compare with similar items</button>
                                            </div>
                                        </div>

                                        <div className="w-[100px] text-right font-bold text-lg hidden sm:block">
                                            ${item.Product.price.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeCount > 0 && (
                            <div className="text-right pt-4 border-t text-lg">
                                Subtotal ({activeCount} items): <span className="font-bold">${subtotal.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Saved for Later Section */}
                    <div className="bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Saved for later ({savedItems.length} items)</h2>

                        {savedItems.length === 0 ? (
                            <p className="text-sm">Your list is currently empty.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 border-t pt-4">
                                {savedItems.map((item) => (
                                    <div key={item.id} className="flex flex-col border p-3 rounded hover:shadow-md transition-shadow">
                                        <Link to={`/product/${item.Product.id}`} className="h-[150px] flex justify-center items-center mb-2 bg-gray-50 p-2">
                                            <img
                                                src={item.Product.image_url || `https://picsum.photos/seed/${item.Product.id}/150/150`}
                                                alt={item.Product.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </Link>
                                        <Link to={`/product/${item.Product.id}`} className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium line-clamp-2 mb-1">
                                            {item.Product.name}
                                        </Link>
                                        <p className="text-sm font-bold text-[#B12704]">${item.Product.price.toFixed(2)}</p>
                                        <p className="text-xs text-[#007600] mt-1 mb-2">In Stock</p>

                                        <div className="mt-auto space-y-2">
                                            <button
                                                onClick={() => toggleSaveForLater(item.id)}
                                                className="w-full text-sm border border-gray-300 rounded shadow-sm py-1 font-medium bg-white hover:bg-gray-50"
                                            >
                                                Move to cart
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-full text-sm text-[#007185] hover:underline text-left mt-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Empty Space filler similar to Amazon */}
                    <div className="text-xs text-gray-500 leading-relaxed max-w-2xl px-2">
                        The price and availability of items at Amazon.com are subject to change. The Cart is a temporary place to store a list of your items and reflects each item's most recent price.
                        <br /><br />
                        Do you have a gift card or promotional code? We'll ask you to enter your claim code when it's time to pay.
                    </div>
                </div>

                {/* Right Column: Order Summary / Checkout Action */}
                <div className="lg:col-span-1">
                    {activeCount > 0 ? (
                        <div className="bg-white p-5 shadow-sm space-y-4 sticky top-5 rounded-md border border-gray-200">
                            <div>
                                <div className="flex items-center text-[#007600] font-bold text-sm mb-1">
                                    <span className="w-5 h-5 bg-[#007600] text-white rounded-full flex items-center justify-center mr-1 text-xs">✓</span>
                                    Your order qualifies for FREE Shipping.
                                </div>
                                <span className="text-xs text-gray-500">Choose this option at checkout. <span className="text-[#007185] hover:underline cursor-pointer">See details</span></span>
                            </div>

                            <div className="text-xl pb-2">
                                Subtotal ({activeCount} items): <span className="font-bold">${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center text-sm mb-4">
                                <input type="checkbox" className="mr-2" /> This order contains a gift
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg shadow-sm py-2 font-medium focus:ring-2 focus:ring-amazon-orange active:bg-[#f0b800]"
                            >
                                Proceed to checkout
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-5 shadow-sm rounded-md border border-gray-200">
                            <h3 className="font-bold mb-2">Checkout</h3>
                            <p className="text-sm text-gray-600 block mb-3">You have {savedItems.length} items saved for later.</p>
                            <button
                                disabled
                                className="w-full bg-gray-200 text-gray-500 border border-gray-300 rounded-lg shadow-none py-2 font-medium cursor-not-allowed"
                            >
                                Proceed to checkout
                            </button>
                        </div>
                    )}

                    <div className="mt-4 bg-white p-5 shadow-sm rounded-md border border-gray-200">
                        <h3 className="font-bold mb-2 text-sm">Customers who bought items in your cart also bought</h3>
                        <p className="text-xs text-gray-500 italic">Sponsored recommendations loading...</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;
