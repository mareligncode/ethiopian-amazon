import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiStar, FiCamera, FiX, FiCheck, FiChevronLeft, FiSend } from 'react-icons/fi';

const ReviewSubmission = () => {
    const { orderId, productId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [review, setReview] = useState({
        rating: 0,
        title: '',
        content: '',
        images: [],
        pros: '',
        cons: '',
        wouldRecommend: true
    });

    const [hoveredStar, setHoveredStar] = useState(0);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (orderId && productId) {
            fetchProductAndOrder();
        }
    }, [orderId, productId]);

    const fetchProductAndOrder = async () => {
        try {
            const [productRes, orderRes] = await Promise.all([
                api.get(`/items/${productId}`),
                api.get(`/orders/${orderId}`)
            ]);

            setProduct(productRes.data.item);
            setOrder(orderRes.data.order);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (rating) => {
        setReview({ ...review, rating });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + review.images.length > 5) {
            alert('You can upload up to 5 images');
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setReview({ ...review, images: [...review.images, ...newImages] });
        setImagePreviews([...imagePreviews, ...newImages.map(img => img.preview)]);
    };

    const removeImage = (index) => {
        const newImages = review.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setReview({ ...review, images: newImages });
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (review.rating === 0 || !review.title.trim() || !review.content.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('rating', review.rating);
            formData.append('title', review.title);
            formData.append('content', review.content);
            formData.append('pros', review.pros);
            formData.append('cons', review.cons);
            formData.append('would_recommend', review.wouldRecommend);

            review.images.forEach((img, index) => {
                formData.append(`images[${index}]`, img.file);
            });

            await api.post(`/items/${productId}/reviews`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(true);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your feedback. Your review will be visible after moderation.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/orders/${orderId}`)}
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 font-medium"
                        >
                            Back to Order
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full text-orange-600 hover:text-orange-700 font-medium"
                        >
                            View All Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(`/orders/${orderId}`)}
                            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
                        >
                            <FiChevronLeft className="w-5 h-5 mr-1" />
                            Back to Order
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Write a Product Review</h1>
                            <p className="text-sm text-gray-600 mt-1">Share your experience with this product</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex space-x-4">
                            <img
                                src={product?.image_url || `https://picsum.photos/seed/${productId}/100/100`}
                                alt={product?.name}
                                className="w-24 h-24 object-contain bg-gray-50 rounded border border-gray-200"
                            />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{product?.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {product?.category || 'Product'} • Ordered on {new Date(order?.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-2">
                                    ${product?.price?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Rating</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="p-1"
                                    >
                                        <FiStar
                                            className={`w-8 h-8 transition-colors ${star <= (hoveredStar || review.rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-lg font-medium text-gray-900">
                                {review.rating > 0 ? ratingLabels[review.rating] : 'Select a rating'}
                            </span>
                        </div>
                    </div>

                    {/* Review Title */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                            Review Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={review.title}
                            onChange={(e) => setReview({ ...review, title: e.target.value })}
                            placeholder="Summarize your experience"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            maxLength={100}
                        />
                        <p className="text-sm text-gray-500 mt-1">{review.title.length}/100 characters</p>
                    </div>

                    {/* Review Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                            Detailed Review <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={review.content}
                            onChange={(e) => setReview({ ...review, content: e.target.value })}
                            placeholder="Tell us about your experience with this product. What did you like or dislike?"
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            maxLength={1000}
                        />
                        <p className="text-sm text-gray-500 mt-1">{review.content.length}/1000 characters</p>
                    </div>

                    {/* Pros and Cons */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-900 mb-2">
                                    Pros (Optional)
                                </label>
                                <textarea
                                    value={review.pros}
                                    onChange={(e) => setReview({ ...review, pros: e.target.value })}
                                    placeholder="What did you like about this product?"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    maxLength={300}
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-900 mb-2">
                                    Cons (Optional)
                                </label>
                                <textarea
                                    value={review.cons}
                                    onChange={(e) => setReview({ ...review, cons: e.target.value })}
                                    placeholder="What could be improved?"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    maxLength={300}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <label className="block text-lg font-medium text-gray-900 mb-4">
                            Add Photos (Optional)
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {review.images.length < 5 && (
                                <label className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                    <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Add Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        multiple
                                    />
                                </label>
                            )}
                        </div>

                        <p className="text-sm text-gray-500">
                            You can upload up to 5 photos. JPG, PNG, GIF up to 5MB each.
                        </p>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <label className="block text-lg font-medium text-gray-900 mb-4">
                            Would you recommend this product?
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    checked={review.wouldRecommend === true}
                                    onChange={() => setReview({ ...review, wouldRecommend: true })}
                                    className="mr-2 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-gray-900">Yes</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    checked={review.wouldRecommend === false}
                                    onChange={() => setReview({ ...review, wouldRecommend: false })}
                                    className="mr-2 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-gray-900">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/orders/${orderId}`)}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium flex items-center disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FiSend className="w-4 h-4 mr-2" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewSubmission;
