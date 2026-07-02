import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/shop/Home';
import ProductDetails from './pages/shop/ProductDetails';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerRegistration from './pages/auth/SellerRegistration';
import DriverLogin from './pages/auth/DriverLogin';
import DriverDashboard from './pages/driver/DriverDashboard';
import DeliveryCompletion from './pages/driver/DeliveryCompletion';
import AdminDashboard from './pages/admin/AdminDashboard';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import PaymentReturnPage from './pages/shop/PaymentReturnPage';
import OrderHistory from './pages/user/OrderHistory';
import OrderTicket from './pages/user/OrderTicket';
import OrderTracking from './pages/user/OrderTracking';
import ReviewSubmission from './pages/user/ReviewSubmission';
import NotificationsPage from './pages/user/NotificationsPage';
import Wishlist from './pages/shop/Wishlist';
import ProductComparison from './pages/shop/ProductComparison';
import DealsPage from './pages/shop/DealsPage';
import CustomerServicePage from './pages/shop/CustomerServicePage';
import RegistryPage from './pages/shop/RegistryPage';
import GiftCardsPage from './pages/shop/GiftCardsPage';
import SearchResults from './pages/shop/SearchResults';
import SellerStorefront from './pages/shop/SellerStorefront';
import BuyerDashboard from './pages/user/BuyerDashboard';
import CartDrawer from './components/CartDrawer';



function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <CartDrawer />
          <Routes>
            {/* Purely standalone auth routes preventing header/footer injection */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/driver/login" element={<DriverLogin />} />

            {/* Public/Unauthenticated Routes (uses standard Amazon Header/Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payments/chapa/return" element={<PaymentReturnPage />} />
              <Route path="/seller/register" element={<SellerRegistration />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/compare" element={<ProductComparison />} />
              <Route path="/todays-deals" element={<DealsPage />} />
              <Route path="/customer-service" element={<CustomerServicePage />} />
              <Route path="/registry" element={<RegistryPage />} />
              <Route path="/gift-cards" element={<GiftCardsPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/seller/:id" element={<SellerStorefront />} />
            </Route>

            {/* General Authenticated Group (Any role can access) */}
            <Route element={<ProtectedLayout />}>
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/orders/:id" element={<OrderTracking />} />
              <Route path="/orders/:id/ticket" element={<OrderTicket />} />
              <Route path="/orders/:orderId/review/:productId" element={<ReviewSubmission />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/delivery/:deliveryId/complete" element={<DeliveryCompletion />} />
              <Route path="/account" element={<BuyerDashboard />} />
            </Route>

            {/* Buyer Only Group */}
            <Route element={<ProtectedLayout requireRole="buyer" />}>
              <Route path="/buyer/profile" element={<BuyerDashboard />} />
            </Route>

            {/* Admin Only Group */}
            <Route element={<ProtectedLayout requireRole="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
