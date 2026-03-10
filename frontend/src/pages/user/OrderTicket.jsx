import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';
import { FiDownload, FiPrinter, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';

const OrderTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const ticketRef = useRef();

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = ticketRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Ticket_Order_${id}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Ticket not found</h2>
                    <button onClick={() => navigate('/orders')} className="text-amazon-orange font-medium hover:underline">
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const qrData = JSON.stringify({
        order_id: order.id,
        user_id: order.user_id,
        total: order.total_amount,
        status: order.status,
        date: order.created_at
    });

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Actions Toolbar */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center text-gray-600 hover:text-black font-medium"
                    >
                        <FiChevronLeft className="mr-1" /> Back to Orders
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium hover:bg-gray-50"
                        >
                            <FiPrinter className="mr-2" /> Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center px-4 py-2 bg-amazon-orange text-black rounded shadow-sm text-sm font-medium hover:bg-[#F7CA00]"
                        >
                            <FiDownload className="mr-2" /> Download Ticket
                        </button>
                    </div>
                </div>

                {/* The Ticket Itself */}
                <div
                    ref={ticketRef}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    {/* Header */}
                    <div className="bg-[#131921] text-white p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">E-TICKET</h1>
                                <p className="text-gray-400 mt-1 uppercase text-sm tracking-widest font-semibold text-amazon-orange">Official Confirmation</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">Amazon Clone</p>
                                <p className="text-gray-400 text-sm">Order #{order.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-10">
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Details */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Name</label>
                                    <p className="text-lg font-semibold text-gray-900">{order.user?.name || 'Valued Customer'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchase Date</label>
                                        <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</label>
                                        <div className="flex items-center text-green-600 font-bold">
                                            <FiCheckCircle className="mr-1" /> PAID
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</label>
                                    <p className="text-sm text-gray-700 leading-relaxed">{order.shipping_address}</p>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <QRCodeSVG
                                    value={qrData}
                                    size={160}
                                    level="H"
                                    includeMargin={true}
                                />
                                <p className="mt-4 text-[10px] text-gray-400 font-mono tracking-tighter uppercase">Security Token: {order.tx_ref?.substring(0, 16)}...</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mt-10 pt-10 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Order Summary</h3>
                            <div className="space-y-4">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center">
                                            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-3">{item.quantity}x</span>
                                            <span className="font-medium text-gray-800">{item.product?.name}</span>
                                        </div>
                                        <span className="font-bold">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <div className="bg-gray-50 p-6 rounded-xl w-full sm:w-64">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Subtotal</span>
                                        <span>${order.total_amount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
                                        <span>TOTAL</span>
                                        <span>${order.total_amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-10 py-6 border-t border-gray-100 italic text-[10px] text-gray-400 text-center">
                        This is a digital receipt and proof of purchase. Please present this QR code during pickup or delivery if requested.
                        Generated on {new Date().toLocaleString()} • Amazon Clone Inc.
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        .min-h-screen { padding: 0 !important; }
                        .shadow-lg { shadow: none !important; border: 1px solid #eee !important; }
                    }
                `}} />
            </div>
        </div>
    );
};

export default OrderTicket;
