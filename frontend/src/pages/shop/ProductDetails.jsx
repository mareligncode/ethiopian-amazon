import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { FiStar, FiHeart, FiShare2, FiTruck, FiPackage, FiCheckCircle, FiAlertTriangle, FiShoppingCart, FiPlus, FiMinus, FiLock, FiMapPin, FiImage, FiZoomIn, FiChevronLeft, FiChevronRight, FiFacebook, FiTwitter, FiMail, FiX } from 'react-icons/fi';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isInCompare, setIsInCompare] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { addToCart } = useContext(CartContext);
    const [showAddToCartAnimation, setShowAddToCartAnimation] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/catalog/${id}`);
                setProduct(response.data.product || response.data);

                // Fetch reviews for this product
                try {
                    const reviewsResponse = await api.get(`/products/${id}/reviews`);
                    const reviewsData = reviewsResponse.data.reviews || [];
                    setReviews(reviewsData);

                    if (reviewsData.length > 0) {
                        const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
                        setAverageRating(avgRating);
                        setTotalReviews(reviewsData.length);
                    }
                } catch (err) {
                    console.error("Failed to fetch reviews:", err);
                }

                // Fetch related products
                try {
                    const relatedResponse = await api.get(`/items/related/${id}`);
                    setRelatedProducts(relatedResponse.data.items || []);
                } catch (err) {
                    console.error("Failed to fetch related products:", err);
                }
            } catch (err) {
                console.error("Failed to load product details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (addToCart) {
            addToCart(product, quantity);
            setShowAddToCartAnimation(true);
            setTimeout(() => setShowAddToCartAnimation(false), 1000);
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity < 1) return;
        if (newQuantity > (product.stock || 999)) return;
        setQuantity(newQuantity);
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        // TODO: Implement wishlist API call
    };

    const handleCompare = () => {
        setIsInCompare(!isInCompare);
        // TODO: Implement compare feature
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return time.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const renderStars = (rating, size = 'text-sm') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FiStar key={`star-${i}`} className={`${size} text-yellow-400 fill-current`} />);
        }
        if (hasHalfStar) {
            stars.push(<FiStar key="half" className={`${size} text-yellow-400 opacity-50`} />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FiStar key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9900]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <div className="text-center p-8">
                    <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600">The product you're looking for is not available.</p>
                    <Link
                        to="/"
                        className="text-[#FF9900] hover:text-[#FF7700] font-medium mt-4 inline-block"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <nav className="flex items-center text-sm">
                        <Link to="/" className="text-blue-600 hover:text-blue-800">
                            Amazon
                        </Link>
                        {product.category && (
                            <>
                                <span className="text-gray-400 mx-2">/</span>
                                <Link to={`/catalog?category=${product.category.id}`} className="text-blue-600 hover:text-blue-800">
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <span className="text-gray-400 mx-2">/</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            {/* Main Product Image */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                {product.images && product.images.length > 0 || product.image_url ? (
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[selectedImage % product.images.length].image_url : product.image_url}
                                        alt={product.name}
                                        className="w-full h-[500px] object-contain cursor-pointer"
                                        onClick={() => setSelectedImage(0)}
                                    />
                                ) : (
                                    <div className="w-full h-[500px] flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <FiImage className="w-16 h-16 mb-2" />
                                        <span>No image available</span>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-1 mt-2">
                                    {product.images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className={`border border-gray-300 rounded cursor-pointer overflow-hidden ${selectedImage === index ? 'ring-2 ring-[#FF9900]' : ''
                                                }`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img
                                                src={img.image_url}
                                                alt={`${product.name} - Image ${index + 1}`}
                                                className="w-full h-20 object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={handleWishlist}
                                    className={`flex-1 flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${isWishlisted
                                        ? 'bg-[#FF9900] text-black'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''} mr-1`} />
                                    {isWishlisted ? 'Wishlisted' : 'Add to List'}
                                </button>
                                <button
                                    onClick={handleCompare}
                                    className={`flex-1 flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${isInCompare
                                        ? 'bg-[#FF9900] text-black'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiPackage className="w-4 h-4 mr-1" />
                                    {isInCompare ? 'In Compare' : 'Compare'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FiShare2 className="w-4 h-4 mr-1" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Center Column - Product Info */}
                    <div className="lg:col-span-2">
                        {/* Product Title and Rating */}
                        <div className="mb-4">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center space-x-4 mb-2">
                                <div className="flex items-center">
                                    {renderStars(averageRating)}
                                    <span className="ml-2 text-sm text-gray-600">
                                        {averageRating.toFixed(1)} ({totalReviews.toLocaleString()})
                                    </span>
                                </div>
                                <Link
                                    to={`/reviews/product/${id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    See all {totalReviews.toLocaleString()} customer reviews
                                </Link>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline space-x-2 mb-4">
                                <span className="text-3xl font-bold text-[#B12704]">
                                    {formatPrice(product.price)}
                                </span>
                                {product.original_price && product.original_price > product.price && (
                                    <span className="text-xl text-gray-500 line-through">
                                        {formatPrice(product.original_price)}
                                    </span>
                                )}
                                {product.discount_percentage && (
                                    <span className="text-sm text-red-600 font-medium">
                                        {product.discount_percentage}% off
                                    </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 font-medium">In Stock</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Currently Unavailable</span>
                                )}
                                {product.stock > 0 && product.stock < 10 && (
                                    <span className="text-orange-600 font-medium">Only {product.stock} left in stock</span>
                                )}
                            </div>

                            {/* Amazon Prime Badge */}
                            <div className="mb-4">
                                <div className="inline-flex items-center px-3 py-1 bg-[#FFD814] rounded-md">
                                    <span className="text-black text-xs font-bold">FREE delivery with Prime</span>
                                </div>
                            </div>

                            {/* Product Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this item</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description || 'No description available for this product.'}
                                </p>
                            </div>

                            {/* Product Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product information</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {product.brand && <li><span className="font-medium">Brand:</span> {product.brand}</li>}
                                    {product.model && <li><span className="font-medium">Model:</span> {product.model}</li>}
                                    {product.sku && <li><span className="font-medium">SKU:</span> {product.sku}</li>}
                                    {product.dimensions && <li><span className="font-medium">Dimensions:</span> {product.dimensions}</li>}
                                    {product.weight && <li><span className="font-medium">Weight:</span> {product.weight}</li>}
                                    {!product.brand && !product.model && !product.sku && !product.dimensions && !product.weight && (
                                        <li>No additional information available for this product.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Quantity and Add to Cart */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="p-2 text-gray-600 hover:bg-gray-100"
                                    >
                                        <FiMinus className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                        min="1"
                                        max={product.stock || 999}
                                        className="w-16 text-center border-0 text-center focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="p-2 text-gray-600 hover:bg-gray-100"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`px-6 py-3 rounded-md font-medium transition-colors ${product.stock <= 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#FFD814] hover:bg-[#F7CA00] text-black'
                                        } ${showAddToCartAnimation ? 'animate-pulse' : ''}`}
                                >
                                    {showAddToCartAnimation ? (
                                        <FiShoppingCart className="w-4 h-4 mr-2" />
                                    ) : (
                                        <FiShoppingCart className="w-4 h-4 mr-2" />
                                    )}
                                    Add to Cart
                                </button>
                            </div>

                            {/* Buy Box */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg font-semibold text-gray-900">Buy Now</span>
                                    <span className="text-sm text-gray-500">or</span>
                                    <Link
                                        to="/cart"
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Add to Cart
                                    </Link>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-md transition-colors ${product.stock <= 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    {product.stock <= 0 ? 'Out of Stock' : `Buy Now - ${formatPrice(product.price)}`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Related Products */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            {/* Sponsored Products (only if real related products exist) */}
                            {relatedProducts.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Products</h3>
                                    <div className="space-y-4">
                                        {relatedProducts.slice(0, 3).map((relatedProduct) => (
                                            <div key={relatedProduct.id} className="flex space-x-3">
                                                <div className="w-20 h-20 flex-shrink-0">
                                                    {relatedProduct.image_url ? (
                                                        <img
                                                            src={relatedProduct.image_url}
                                                            alt={relatedProduct.name}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                                                            <FiImage className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{relatedProduct.name}</h4>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{relatedProduct.description}</p>
                                                    <p className="text-lg font-bold text-[#B12704]">{formatPrice(relatedProduct.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Customer Reviews Preview */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                                    <Link
                                        to={`/reviews/product/${id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        See all reviews
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {reviews.slice(0, 2).map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{review.title}</p>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        By {review.reviewer_name} • {formatTime(review.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={(e) => {
                                    navigator.clipboard.writeText(window.location.href);
                                    e.currentTarget.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 inline" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';
                                }}
                                className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <FiShare2 className="w-4 h-4 mr-2 inline" />
                                Copy Link
                            </button>
                            <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                <FiFacebook className="w-4 h-4 mr-2 inline" />
                                Facebook
                            </button>
                            <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                <FiTwitter className="w-4 h-4 mr-2 inline" />
                                Twitter
                            </button>
                            <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                <FiMail className="w-4 h-4 mr-2 inline" />
                                Email
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Compare Products</h3>
                            <button
                                onClick={() => setShowCompareModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            Compare {product.name} with other products to make the best choice.
                        </div>
                        {/* Compare functionality would go here */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
