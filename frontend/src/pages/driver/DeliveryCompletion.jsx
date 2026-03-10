import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FiPackage, FiMapPin, FiUser, FiPhone, FiCamera, FiCheckCircle, FiMessageSquare, FiHome, FiCircle, FiMail, FiClock, FiNavigation, FiAlertCircle, FiX } from 'react-icons/fi';

const DeliveryCompletion = () => {
    const { user } = useContext(AuthContext);
    const { deliveryId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [delivery, setDelivery] = useState(null);
    const [completionData, setCompletionData] = useState({
        delivery_location: '',
        delivery_notes: '',
        proof_images: [],
        recipient_name: '',
        signature: null
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        fetchDeliveryDetails();
        getCurrentLocation();
    }, [deliveryId]);

    const fetchDeliveryDetails = async () => {
        try {
            // Re-using assignment endpoint for details
            const response = await api.get('/driver/assignment');
            const data = response.data.assignment;

            // Find the specific delivery in the assignment
            const specificDelivery = data.deliveries.find(d => d.id === parseInt(deliveryId));

            if (specificDelivery) {
                setDelivery(specificDelivery);
            } else {
                setError('Delivery not found in current route');
            }
        } catch (error) {
            console.error('Failed to fetch delivery details:', error);
            setError('Failed to load delivery details');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    setLocationError('Unable to get your location');
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser');
        }
    };

    const handleLocationCapture = () => {
        if (currentLocation) {
            setCompletionData(prev => ({
                ...prev,
                delivery_location: `Lat: ${currentLocation.latitude}, Lng: ${currentLocation.longitude}`
            }));
        } else {
            getCurrentLocation();
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + completionData.proof_images.length > 3) {
            setError('You can upload up to 3 images');
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setCompletionData(prev => ({
            ...prev,
            proof_images: [...prev.proof_images, ...newImages]
        }));
        setImagePreviews(prev => [...prev, ...newImages.map(img => img.preview)]);
    };

    const removeImage = (index) => {
        const newImages = completionData.proof_images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setCompletionData(prev => ({ ...prev, proof_images: newImages }));
        setImagePreviews(newPreviews);
    };

    const handleDeliveryLocationSelect = (location) => {
        setCompletionData(prev => ({
            ...prev,
            delivery_location: location
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!completionData.delivery_location) {
            setError('Please select or confirm the delivery location');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('delivery_location', completionData.delivery_location);
            formData.append('delivery_notes', completionData.delivery_notes);
            formData.append('recipient_name', completionData.recipient_name);

            if (completionData.signature) {
                formData.append('signature', completionData.signature);
            }

            completionData.proof_images.forEach((img, index) => {
                formData.append(`proof_images[${index}]`, img.file);
            });

            await api.post(`/driver/deliveries/${deliveryId}/complete`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(true);
        } catch (error) {
            console.error('Failed to complete delivery:', error);
            setError(error.response?.data?.error || 'Failed to complete delivery');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Completed!</h2>
                    <p className="text-gray-600 mb-6">
                        Package #{delivery?.order_id} has been successfully delivered.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/driver/dashboard')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white">
                <div className="px-4 py-3">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/driver/dashboard')}
                            className="mr-3 text-blue-100"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">Complete Delivery</h1>
                            <p className="text-xs text-blue-100">Order #{delivery?.order_id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="px-4 py-2">
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="px-4 py-4">
                {/* Delivery Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <h2 className="font-medium text-gray-900 mb-3">Delivery Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                            <FiUser className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <p className="font-medium">{delivery?.customer_name}</p>
                                <p className="text-gray-500">{delivery?.customer_phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FiMapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <p className="font-medium">{delivery?.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FiPackage className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <p className="font-medium">1 package</p>
                                <p className="text-gray-500 text-xs">Standard delivery</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Delivery Location */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Delivery Location</h3>

                        {locationError && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                                <p className="text-yellow-800 text-sm">{locationError}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleLocationCapture}
                                className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100 font-medium text-sm flex items-center justify-center"
                            >
                                <FiNavigation className="w-4 h-4 mr-2" />
                                Use Current Location
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Front Porch')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Front Porch'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiHome className="w-4 h-4 mr-1 inline" />
                                    Front Porch
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Handed to Resident')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Handed to Resident'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiUser className="w-4 h-4 mr-1 inline" />
                                    Hand to Person
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Back Door')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Back Door'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiCircle className="w-4 h-4 mr-1 inline" />
                                    Back Door
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Mailbox')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Mailbox'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiMail className="w-4 h-4 mr-1 inline" />
                                    Mailbox
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Apartment Office')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Apartment Office'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiHome className="w-4 h-4 mr-1 inline" />
                                    Leasing Office
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeliveryLocationSelect('Other')}
                                    className={`py-2 px-3 rounded-md text-sm font-medium border ${completionData.delivery_location === 'Other'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Other Location
                                </button>
                            </div>

                            {completionData.delivery_location && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Selected:</strong> {completionData.delivery_location}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Photo Evidence */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Photo Evidence (Optional)</h3>

                        <div className="space-y-3">
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Proof ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {imagePreviews.length < 3 && (
                                <label className="block">
                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400">
                                        <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-sm text-gray-600">Add Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            multiple
                                        />
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !completionData.delivery_location}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Completing...
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="w-5 h-5 mr-2" />
                                Complete Delivery
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeliveryCompletion;
