import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const CartDrawer = () => {
    const {
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
        getCartTotal,
        getCartCount
    } = useContext(CartContext);

    const navigate = useNavigate();

    if (!isCartDrawerOpen) return null;

    const cartSubtotal = getCartTotal();
    const cartCount = getCartCount();

    const closeDrawer = () => setIsCartDrawerOpen(false);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Dark overlay background */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={closeDrawer}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div className="flex items-center text-[#007600] font-bold">
                        <FiCheckCircle className="text-xl mr-2 text-[#007600]" />
                        Added to Cart
                    </div>
                    <button onClick={closeDrawer} className="text-gray-500 hover:text-black">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
                    {/* Last Added Item Visual */}
                    {lastAddedItem && (
                        <div className="flex gap-4 border-b pb-4 mb-2">
                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center p-1 rounded border">
                                <img
                                    src={lastAddedItem.image_url || `https://picsum.photos/seed/${lastAddedItem.id}/80/80`}
                                    className="max-w-full max-h-full object-contain"
                                    alt={lastAddedItem.name}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-black line-clamp-2">{lastAddedItem.name}</p>
                                <p className="text-[#B12704] font-bold text-sm mt-1">${lastAddedItem.price.toFixed(2)}</p>
                                {lastAddedItem.quantity && <p className="text-xs text-gray-500 mt-1">Qty: {lastAddedItem.quantity}</p>}
                            </div>
                        </div>
                    )}

                    {/* Cart Subtotal */}
                    <div className="pt-2">
                        <p className="text-lg">
                            Cart subtotal ({cartCount} items): <br />
                            <span className="text-2xl font-bold text-[#B12704]">${cartSubtotal.toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => {
                                closeDrawer();
                                navigate('/cart');
                            }}
                            className="w-full bg-white border border-gray-300 shadow-sm rounded-lg py-2 font-medium hover:bg-gray-50 text-sm focus:ring-2 focus:ring-amazon-orange text-center"
                        >
                            Cart
                        </button>

                        <button
                            onClick={() => {
                                closeDrawer();
                                navigate('/checkout');
                            }}
                            className="w-full bg-[#FFD814] border border-[#FCD200] shadow-sm rounded-lg py-2 font-medium hover:bg-[#F7CA00] text-sm focus:ring-2 focus:ring-amazon-orange text-center"
                        >
                            Proceed to checkout ({cartCount} items)
                        </button>
                    </div>

                    <div className="mt-8">
                        <p className="text-xs font-bold text-gray-700 mb-2">Frequently bought together</p>
                        <div className="bg-gray-100 h-24 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400 italic">
                            Sponsored recommendations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
