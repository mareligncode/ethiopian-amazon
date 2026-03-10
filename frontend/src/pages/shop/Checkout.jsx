import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { FiLock, FiChevronRight } from 'react-icons/fi';

const Checkout = () => {
    const { cartItems, getCartTotal, refreshCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderCreated, setOrderCreated] = useState(null);

    // Address form fields for Amazon-like realism
    const [form, setForm] = useState({
        fullName: user ? user.name : '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });

    const activeCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = getCartTotal();
    const shippingCost = activeCount > 0 ? 5.99 : 0; // Flat rate shipping simulation
    const tax = subtotal * 0.08; // 8% tax simulation
    const finalTotal = subtotal + shippingCost + tax;

    useEffect(() => {
        if (activeCount === 0 && !orderCreated) {
            // Should not be in checkout without items
            navigate('/cart');
        }
    }, [activeCount, orderCreated, navigate]);

    const handlePlaceOrder = async () => {
        if (!form.addressLine1 || !form.city || !form.zip) {
            setError("Please provide a valid shipping address (Address Line 1, City, and ZIP).");
            return;
        }

        setLoading(true);
        setError('');

        const formattedAddress = `${form.fullName}, ${form.addressLine1} ${form.addressLine2}, ${form.city}, ${form.state} ${form.zip}. Phone: ${form.phone}`;

        try {
            // 1. Create the Order in the Backend from the Cart
            const cartResp = await api.post('/orders/checkout', { shipping_address: formattedAddress });
            const newOrder = cartResp.data.order;

            setOrderCreated(newOrder); // Stop from redirecting back to cart
            refreshCart(); // The backend will have emptied the cart for these items

            // 2. Immediately trigger Chapa Payment Initialization using the new Order ID
            const paymentResp = await api.post(`/orders/${newOrder.id}/pay`);

            // 3. Redirect the browser completely to the secure Chapa Gateway URL 
            const chapaCheckoutUrl = paymentResp.data.checkout_url;
            window.location.href = chapaCheckoutUrl;

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to process checkout. Please try again.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amazon-orange mb-4"></div>
                <h2 className="text-xl font-bold">Securely processing your order...</h2>
                <p className="text-gray-500">Please wait while we transfer you to Chapa for secure payment.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            {/* Checkout Minimal Header */}
            <header className="bg-white border-b border-gray-300 py-4 px-6 flex justify-between items-center text-[#0f1111]">
                <div className="text-2xl font-bold tracking-tighter self-end leading-none cursor-pointer" onClick={() => navigate('/')}>
                    amazon<span className="text-amazon-orange text-xl leading-none">.com</span>
                </div>
                <h1 className="text-2xl font-medium tracking-tight">Checkout (<span className="text-[#007185]">{activeCount} items</span>)</h1>
                <FiLock className="text-2xl text-gray-400" />
            </header>

            <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Checkout Forms */}
                <div className="lg:col-span-2 space-y-4">

                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                            <FiLock className="mt-1 mr-2" />
                            <div>
                                <h3 className="font-bold">There was a problem</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Shipping Address */}
                    <div className="bg-white p-5 border border-gray-200 rounded">
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="text-lg font-bold">1</span>
                            <h2 className="text-xl font-bold flex-1 text-[#C7511F]">Enter a new shipping address</h2>
                        </div>
                        <div className="pl-6 md:pl-8 space-y-3">
                            <p className="text-xl font-bold">Add a new address</p>

                            <div>
                                <label className="block text-sm font-bold mb-1">Country/Region</label>
                                <select className="border border-gray-300 rounded p-2 w-full bg-[#F0F2F2] shadow-sm text-sm">
                                    <option>United States</option>
                                    <option>Ethiopia</option>
                                    <option>Global Territory</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Full name (First and Last name)</label>
                                <input type="text" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Phone number</label>
                                <input type="text" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm pb-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                <p className="text-xs text-gray-500 mt-1">May be used to assist delivery</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Address</label>
                                <input type="text" placeholder="Street address or P.O. Box" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm mb-2" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} />
                                <input type="text" placeholder="Apt, suite, unit, building, floor, etc." className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-1">City</label>
                                    <input type="text" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-sm font-bold mb-1">State</label>
                                    <input type="text" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-sm font-bold mb-1">ZIP Code</label>
                                    <input type="text" className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-amazon-orange outline-none shadow-sm" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Payment Method */}
                    <div className="bg-white p-5 border border-gray-200 rounded text-gray-500 flex justify-between items-center cursor-not-allowed">
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold">2</span>
                            <h2 className="text-xl font-bold">Payment method</h2>
                        </div>
                        <span className="text-sm">Chapa Secure Gateway will load next</span>
                    </div>

                    {/* Step 3: Review items */}
                    <div className="bg-white p-5 border border-gray-200 rounded">
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="text-lg font-bold">3</span>
                            <h2 className="text-xl font-bold">Review items and shipping</h2>
                        </div>

                        <div className="border rounded-md p-4">
                            <p className="font-bold text-green-700 text-lg mb-4">Delivery: Guaranteed processing today</p>
                            <p className="text-sm text-gray-500 mb-4">Items shipped from Amazon.com Global Store</p>

                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex space-x-4 border-b pb-4">
                                        <img src={item.Product.image_url || `https://picsum.photos/seed/${item.Product.id}/100/100`} className="w-24 h-24 object-contain" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{item.Product.name}</h4>
                                            <p className="text-[#B12704] font-bold mt-1">${item.Product.price.toFixed(2)}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <select disabled className="bg-[#F0F2F2] border border-gray-300 rounded shadow-sm py-1 px-2 text-sm font-bold">
                                                    <option>Qty: {item.quantity}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <div className="pl-4">
                                                <h5 className="font-bold text-sm mb-1">Choose a delivery option:</h5>
                                                <div className="flex items-start text-sm mb-2">
                                                    <input type="radio" checked readOnly className="mt-1 mr-2 text-amazon-orange" />
                                                    <div>
                                                        <span className="text-green-700 block font-bold">Sunday, Oct 24</span>
                                                        <span className="text-gray-500">FREE Prime Delivery</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Place Order Bar */}
                    <div className="bg-white p-5 border border-gray-200 rounded flex items-center justify-between mt-6">
                        <button
                            onClick={handlePlaceOrder}
                            className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg shadow-sm py-2 px-6 font-medium focus:ring-2 focus:ring-amazon-orange text-sm w-[250px]"
                        >
                            Place your order
                        </button>
                        <div className="text-right ml-4">
                            <p className="text-[#B12704] text-xl font-bold">Order total: ${finalTotal.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 leading-tight block float-right w-3/4 mt-1">By placing your order, you agree to Amazon's privacy notice and conditions of use.</p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Order Summary Floating Box */}
                <div className="lg:col-span-1 border border-gray-200 rounded bg-white p-4 h-fit sticky top-5 shadow-sm">
                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg shadow-sm py-2 px-6 font-medium focus:ring-2 focus:ring-amazon-orange text-sm mb-2"
                    >
                        Place your order
                    </button>
                    <p className="text-xs text-center text-gray-500 border-b pb-4 mb-4 leading-tight">By placing your order, you agree to Amazon's privacy notice and conditions of use.</p>

                    <h3 className="font-bold text-lg mb-2">Order Summary</h3>

                    <div className="text-sm space-y-1 pb-2 border-b">
                        <div className="flex justify-between">
                            <span>Items ({activeCount}):</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping & handling:</span>
                            <span>${shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-transparent relative">
                            <div className="absolute top-0 right-0 w-8 border-t border-gray-300"></div>
                            <span>Total before tax:</span>
                            <span>${(subtotal + shippingCost).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated tax to be collected:</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-[#B12704] font-bold text-xl pt-3 pb-4">
                        <span>Order total:</span>
                        <span>${finalTotal.toFixed(2)}</span>
                    </div>

                    <div className="bg-gray-100 p-3 rounded text-sm mb-2 border border-gray-200">
                        <p className="text-[#007185] hover:underline cursor-pointer font-bold mb-1">How are shipping costs calculated?</p>
                        <p className="text-xs text-gray-600">Prime shipping benefits have been applied to this order automatically.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
