import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-amazon-blue text-white mt-10">
            {/* Back to Top */}
            <div
                className="w-full bg-[#37475A] hover:bg-[#485769] text-center text-sm py-4 cursor-pointer transition-colors duration-200"
                onClick={() => window.scrollTo(0, 0)}
            >
                Back to top
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto py-10 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                <div>
                    <h3 className="font-bold mb-4 text-lg">Get to Know Us</h3>
                    <ul className="space-y-2 text-[#DDD]">
                        <li><Link to="/search?q=Careers" className="hover:underline cursor-pointer hover:text-white transition-colors">Careers</Link></li>
                        <li><Link to="/search?q=Blog" className="hover:underline cursor-pointer hover:text-white transition-colors">Blog</Link></li>
                        <li><Link to="/search?q=About+Amazon" className="hover:underline cursor-pointer hover:text-white transition-colors">About Amazon</Link></li>
                        <li><Link to="/search?q=Investor+Relations" className="hover:underline cursor-pointer hover:text-white transition-colors">Investor Relations</Link></li>
                        <li><Link to="/search?q=Amazon+Devices" className="hover:underline cursor-pointer hover:text-white transition-colors">Amazon Devices</Link></li>
                        <li><Link to="/search?q=Amazon+Science" className="hover:underline cursor-pointer hover:text-white transition-colors">Amazon Science</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-4 text-lg">Make Money with Us</h3>
                    <ul className="space-y-2 text-[#DDD]">
                        <li><Link to="/seller/register" className="hover:underline cursor-pointer hover:text-white transition-colors">Sell products on Amazon</Link></li>
                        <li><Link to="/seller/register" className="hover:underline cursor-pointer hover:text-white transition-colors">Sell on Amazon Business</Link></li>
                        <li><Link to="/seller/register" className="hover:underline cursor-pointer hover:text-white transition-colors">Sell apps on Amazon</Link></li>
                        <li><Link to="/search?q=Become+an+Affiliate" className="hover:underline cursor-pointer hover:text-white transition-colors">Become an Affiliate</Link></li>
                        <li><Link to="/seller/register" className="hover:underline cursor-pointer hover:text-white transition-colors">Advertise Your Products</Link></li>
                        <li><Link to="/seller/register" className="hover:underline cursor-pointer hover:text-white transition-colors">Self-Publish with Us</Link></li>
                        <li><Link to="/search?q=Host+an+Amazon+Hub" className="hover:underline cursor-pointer hover:text-white transition-colors">Host an Amazon Hub</Link></li>
                        <li><Link to="/search?q=Make+Money+with+Us" className="hover:underline cursor-pointer hover:text-white transition-colors">See More Make Money with Us</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-4 text-lg">Amazon Payment Products</h3>
                    <ul className="space-y-2 text-[#DDD]">
                        <li><Link to="/search?q=Amazon+Business+Card" className="hover:underline cursor-pointer hover:text-white transition-colors">Amazon Business Card</Link></li>
                        <li><Link to="/search?q=Shop+with+Points" className="hover:underline cursor-pointer hover:text-white transition-colors">Shop with Points</Link></li>
                        <li><Link to="/search?q=Reload+Your+Balance" className="hover:underline cursor-pointer hover:text-white transition-colors">Reload Your Balance</Link></li>
                        <li><Link to="/search?q=Amazon+Currency+Converter" className="hover:underline cursor-pointer hover:text-white transition-colors">Amazon Currency Converter</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-4 text-lg">Let Us Help You</h3>
                    <ul className="space-y-2 text-[#DDD]">
                        <li><Link to="/search?q=Amazon+and+COVID-19" className="hover:underline cursor-pointer hover:text-white transition-colors">Amazon and COVID-19</Link></li>
                        <li><Link to="/buyer/profile" className="hover:underline cursor-pointer hover:text-white transition-colors">Your Account</Link></li>
                        <li><Link to="/orders" className="hover:underline cursor-pointer hover:text-white transition-colors">Your Orders</Link></li>
                        <li><Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Shipping Rates & Policies</Link></li>
                        <li><Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Returns & Replacements</Link></li>
                        <li><Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Manage Your Content and Devices</Link></li>
                        <li><Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Help</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="bg-amazon-dark h-32 flex flex-col justify-center items-center text-[#DDD] text-xs">
                <div className="flex space-x-6 mb-2">
                    <Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Conditions of Use</Link>
                    <Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Privacy Notice</Link>
                    <Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Consumer Health Data Privacy Disclosure</Link>
                    <Link to="/customer-service" className="hover:underline cursor-pointer hover:text-white transition-colors">Your Ads Privacy Choices</Link>
                </div>
                <div className="text-center">
                    © 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates
                </div>
            </div>
        </footer>
    );
};

export default Footer;
