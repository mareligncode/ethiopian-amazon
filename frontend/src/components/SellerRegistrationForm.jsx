import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiShoppingBag, FiUser, FiDollarSign, FiMail, FiPhone, FiMapPin, FiFileText, FiCheck, FiAlertCircle, FiCamera, FiX } from 'react-icons/fi';

const SellerRegistrationForm = ({ onComplete }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'individual',
        taxId: '',
        description: '',
        phone: '',
        email: user?.email || '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'United States'
        },
        bankAccount: {
            accountNumber: '',
            routingNumber: '',
            accountHolderName: ''
        },
        documents: {
            businessLicense: null,
            taxDocument: null,
            idDocument: null
        }
    });

    const [imagePreviews, setImagePreviews] = useState({
        businessLicense: null,
        taxDocument: null,
        idDocument: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankAccount: {
                ...prev.bankAccount,
                [name]: value
            }
        }));
    };

    const handleDocumentUpload = (e, documentType) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [documentType]: file
                }
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({
                    ...prev,
                    [documentType]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeDocument = (documentType) => {
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [documentType]: null
            }
        }));
        setImagePreviews(prev => ({
            ...prev,
            [documentType]: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('business_name', formData.businessName);
            formDataToSend.append('business_type', formData.businessType);
            formDataToSend.append('tax_id', formData.taxId);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('street', formData.address.street);
            formDataToSend.append('city', formData.address.city);
            formDataToSend.append('state', formData.address.state);
            formDataToSend.append('zip', formData.address.zip);
            formDataToSend.append('country', formData.address.country);
            formDataToSend.append('account_number', formData.bankAccount.accountNumber);
            formDataToSend.append('routing_number', formData.bankAccount.routingNumber);
            formDataToSend.append('account_holder_name', formData.bankAccount.accountHolderName);

            if (formData.documents.businessLicense) formDataToSend.append('business_license', formData.documents.businessLicense);
            if (formData.documents.taxDocument) formDataToSend.append('tax_document', formData.documents.taxDocument);
            if (formData.documents.idDocument) formDataToSend.append('id_document', formData.documents.idDocument);

            await api.post('/seller/application', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update user role locally so dashboard unlocks
            updateUser({ role: 'seller' });

            setSuccess(true);
            if (onComplete) onComplete();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    if (success) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-[#007600]" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Submitted!</h2>
                <p className="text-sm text-gray-700 mb-6 font-medium">
                    We'll review your application within 3-5 business days. Once approved, your role will be upgraded to Seller automatically.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4].map((i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${step >= i ? 'bg-amazon-orange text-white' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
                                    {i}
                                </div>
                                <span className={`ml-2 text-xs font-semibold hidden md:block ${step >= i ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {i === 1 ? 'Business' : i === 2 ? 'Address' : i === 3 ? 'Bank' : 'Documents'}
                                </span>
                            </div>
                            {i < 4 && <div className={`flex-1 h-0.5 mx-2 md:mx-4 transition-colors ${step > i ? 'bg-amazon-orange' : 'bg-gray-300'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 shadow-sm flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-[#B12704] mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-[#B12704] text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                            <FiShoppingBag className="w-5 h-5 mr-2" /> Business Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Business Name *</label>
                                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Business Type *</label>
                                <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="amazon-input">
                                    <option value="individual">Individual</option>
                                    <option value="company">Company</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tax ID *</label>
                                <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="amazon-input" required />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="amazon-input" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                            <FiMapPin className="w-5 h-5 mr-2" /> Business Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                                <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                                <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                                <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code *</label>
                                <input type="text" name="zip" value={formData.address.zip} onChange={handleAddressChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Country *</label>
                                <select name="country" value={formData.address.country} onChange={handleAddressChange} className="amazon-input">
                                    <option value="United States">United States</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                            <FiDollarSign className="w-5 h-5 mr-2" /> Bank Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name *</label>
                                <input type="text" name="accountHolderName" value={formData.bankAccount.accountHolderName} onChange={handleBankChange} className="amazon-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Account Number *</label>
                                <input type="text" name="accountNumber" value={formData.bankAccount.accountNumber} onChange={handleBankChange} className="amazon-input" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Routing Number *</label>
                                <input type="text" name="routingNumber" value={formData.bankAccount.routingNumber} onChange={handleBankChange} className="amazon-input" required />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                            <FiFileText className="w-5 h-5 mr-2" /> Documents
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {['businessLicense', 'taxDocument', 'idDocument'].map((type) => (
                                <div key={type} className="border p-4 rounded-lg bg-gray-50">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <input type="file" onChange={(e) => handleDocumentUpload(e, type)} className="hidden" id={`upload-${type}`} />
                                            <label htmlFor={`upload-${type}`} className="cursor-pointer block border-2 border-dashed border-gray-400 p-4 text-center hover:bg-gray-100 rounded">
                                                {imagePreviews[type] ? <span className="text-xs text-green-600 font-bold">File Selected ✓</span> : <FiCamera className="mx-auto w-6 h-6 text-gray-400" />}
                                                <p className="text-xs text-gray-500 mt-1">Click to {imagePreviews[type] ? 'change' : 'upload'}</p>
                                            </label>
                                        </div>
                                        {imagePreviews[type] && <button type="button" onClick={() => removeDocument(type)} className="text-red-500 text-xs font-bold">Remove</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-between">
                    <button type="button" onClick={prevStep} disabled={step === 1} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button>
                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="amazon-button w-32">Next</button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading} className="amazon-button w-auto px-8">
                            {loading ? 'Submitting...' : 'Complete Registration'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerRegistrationForm;
