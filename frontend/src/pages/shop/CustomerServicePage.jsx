import React from 'react';
import { FiBox, FiTruck, FiRefreshCcw, FiUser, FiInfo, FiMessageCircle } from 'react-icons/fi';

const CustomerServicePage = () => {
    const helpTopics = [
        { icon: <FiBox />, title: "Your Orders", desc: "Track packages, edit or cancel orders" },
        { icon: <FiRefreshCcw />, title: "Returns & Refunds", desc: "Return or exchange items" },
        { icon: <FiTruck />, title: "Shipping Rates", desc: "Check costs and delivery times" },
        { icon: <FiUser />, title: "Account Settings", desc: "Update your profile or password" },
        { icon: <FiInfo />, title: "Help Library", desc: "Search for specific help topics" },
        { icon: <FiMessageCircle />, title: "Contact Us", desc: "Reach out to our support team" }
    ];

    const [searchQuery, setSearchQuery] = React.useState("");
    const [contactSent, setContactSent] = React.useState(false);

    const filteredTopics = helpTopics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-[1000px] mx-auto px-4 py-12">
                <h1 className="text-3xl font-medium text-[#0F1111] mb-8">Hello. What can we help you with?</h1>

                <div className="mb-12">
                    <div className="flex mb-8">
                        <input
                            type="text"
                            placeholder="Type keywords (e.g., 'orders', 'return')"
                            className="flex-1 p-3 border rounded-l-md outline-none focus:ring-1 focus:ring-amazon-orange text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-amazon-orange text-white px-8 py-3 rounded-r-md font-bold text-lg">Search</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTopics.length > 0 ? filteredTopics.map((topic, i) => (
                            <div key={i} className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer flex items-center space-x-4">
                                <div className="text-3xl text-gray-600">{topic.icon}</div>
                                <div>
                                    <h3 className="font-bold text-[#0F1111]">{topic.title}</h3>
                                    <p className="text-sm text-gray-600">{topic.desc}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="col-span-full text-center py-10 text-gray-500">No help topics matching your search.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#f3f3f3] p-10 rounded-lg">
                    {contactSent ? (
                        <div className="text-center py-4">
                            <h2 className="text-2xl font-bold text-green-600 mb-2">Message Sent!</h2>
                            <p>We'll get back to you within 24 hours.</p>
                            <button onClick={() => setContactSent(false)} className="mt-4 text-amazon-blue hover:underline">Send another message</button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold mb-6 text-center">Still need help? Send us a message</h2>
                            <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }} className="max-w-xl mx-auto space-y-4">
                                <input type="email" placeholder="Your Email" required className="w-full p-2 border rounded" />
                                <textarea placeholder="How can we help?" required className="w-full p-2 border rounded h-32"></textarea>
                                <button type="submit" className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black font-medium py-2 rounded-md transition-colors shadow-sm">Send Message</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerServicePage;
