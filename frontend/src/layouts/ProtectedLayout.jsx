import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProtectedLayout = ({ requireRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#EAEDED]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF9900]"></div>
            </div>
        );
    }

    // If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required and user does not have it, deflect them
    // Admin bypasses limits. Seller cannot access delivery, etc.
    if (requireRole && user.role !== requireRole && user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#EAEDED]">
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p>You do not have the required permissions '{requireRole}' to view this page.</p>
            </div>
        );
    }

    // Wrap authenticated layouts with the standard Header/Footer
    return (
        <div className="flex flex-col min-h-screen bg-[#EAEDED]">
            <Header />
            <main className="flex-grow w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ProtectedLayout;
