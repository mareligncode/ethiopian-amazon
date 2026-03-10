import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiImage } from 'react-icons/fi';

const ProductCard = ({ product }) => {
    const imageUrl = product.images?.[0]?.image_url || product.image_url || `https://picsum.photos/seed/${product.id}/200/200`;

    // Calculate actual rating if reviews are available
    const hasReviews = product.reviews && product.reviews.length > 0;
    const averageRating = hasReviews
        ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length
        : 0;
    const reviewCount = product.reviews ? product.reviews.length : 0;

    // Use toFixed(2) to ensure price always has two decimal places like Amazon
    const priceFormatted = parseFloat(product.price || 0).toFixed(2);
    const [whole, decimal] = priceFormatted.split('.');

    return (
        <div className="bg-white flex flex-col h-full border border-gray-100 hover:border-gray-200 hover:shadow-[0_2px_5px_rgba(213,217,217,0.5)] transition-all duration-200 rounded-sm overflow-hidden group cursor-pointer">
            {/* Image Container */}
            <Link to={`/product/${product.id}`} className="relative h-48 w-full p-4 flex items-center justify-center bg-[#f7f7f7] group-hover:bg-white transition-colors">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/200/200`; }}
                    />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <FiImage className="w-8 h-8 mb-2" />
                        <span className="text-xs">No Image</span>
                    </div>
                )}
            </Link>

            {/* Content Container */}
            <div className="p-3 flex flex-col flex-grow">
                {/* Title */}
                <Link to={`/product/${product.id}`} className="text-[14px] leading-[20px] text-[#0F1111] font-medium line-clamp-2 hover:text-amazon-orange mb-1">
                    {product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center mb-1">
                    <div className="flex text-[#FFA41C] text-[13px]">
                        {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={i < Math.round(averageRating || 0) ? "fill-current" : "text-gray-200"} />
                        ))}
                    </div>
                    {reviewCount > 0 && (
                        <span className="text-[12px] text-amazon-blue ml-1 hover:text-[#c45500] cursor-pointer font-medium">
                            {reviewCount.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Price */}
                <div className="mt-auto pt-2">
                    <div className="flex items-start text-[#0F1111]">
                        <span className="text-[13px] mt-1 font-semibold">$</span>
                        <span className="text-[24px] font-bold leading-none">{whole}</span>
                        <span className="text-[13px] mt-1 font-semibold">{decimal}</span>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center text-[12px] text-[#565959] mt-2">
                        <span className="bg-[#00A8E1] text-white px-1.5 rounded-[2px] font-bold text-[10px] mr-1.5">prime</span>
                        <span>FREE delivery <span className="font-bold">Tomorrow</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
