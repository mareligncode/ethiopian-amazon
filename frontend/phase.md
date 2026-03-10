# Full Amazon Clone Frontend Development Phases
**(React + Vite + TailwindCSS + Axios)**

This document details the comprehensive phases required to build and fix our pixel-perfect Amazon clone frontend, precisely aligned with the completed Go-Gin backend API architecture.

## Phase 1: Global Setup, Routing, & Core Architecture
**Status:** Needs Fixes (Folder Structure & Routing Crashes)
**Modifications Needed:**
*   **Folder Restructuring Strategy:** Instead of dumping everything into `src/pages`, structure by domain:
    *   `/src/pages/auth/` (Login, Register, DriverLogin, SellerRegistration)
    *   `/src/pages/shop/` (Home, PLP, PDP, Cart, Checkout, Wishlist)
    *   `/src/pages/user/` (OrderHistory, OrderTracking, Notifications)
    *   `/src/pages/seller/` (SellerDashboard)
    *   `/src/pages/admin/` (AdminDashboard)
    *   `/src/pages/driver/` (DriverDashboard, DeliveryCompletion)
*   **Routing Fixes:** The current `App.jsx` layout needs to cleanly wrap these new paths using React Router v6 `<Outlet />`.
*   **State Management Check:** Verify Context API (`AuthContext`, `CartContext`) properly hydrates from `localStorage` without crashing on page reloads.
*   **Axios Interceptors:** Ensure `api.js` explicitly gracefully handles `401 Unauthorized` by logging the user out globally.

## Phase 2: Identity & Authentication (Multi-Role)
**Status:** Needs Verification
**Backend API Mapping:** `POST /api/auth/login`, `POST /api/auth/register`
**Modifications Needed:**
*   **User Profiles Context:** Ensure the downloaded User token contains the `.Role` (admin, buyer, seller, delivery).
*   **Role-Based Access Control (RBAC):** Fix the `<ProtectedLayout requireRole="role">` wrapper to correctly bounce unauthorized users instead of rendering white screens.
*   **Forms Styling:** Validate all inputs have the Amazon orange focus ring (`focus:ring-amazon-orange`) and Tailwind UI.

## Phase 3: The Shopping Experience (Product Catalog)
**Status:** In Progress
**Backend API Mapping:** `GET /api/items`, `GET /api/items/:id`, `GET /api/products/:id/reviews`
**Modifications Needed:**
*   **Homepage Data Fetch:** Connect the Home page grids to the public `/api/items` endpoint.
*   **Product Details (PDP):** Create logic to fetch individual item details.
*   **Error Boundaries:** Add fallbacks so if the catalog API is unreachable, the UI shows a friendly "We're experiencing technical difficulties" message rather than a raw JS crash.

## Phase 4: Advanced Cart & Session Management
**Status:** Mostly Complete Structurally, Needs Wiring
**Backend API Mapping:** `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:id`, `DELETE /api/cart/:id`, `PUT /api/cart/:id/save-for-later`
**Modifications Needed:**
*   **API Wiring:** Hook the "Add to Cart" button directly to the backend rather than just local state.
*   **Save for Later Logic:** Implement the physical UI split for items in the cart vs items saved for later using the new `ToggleSaveForLater` endpoint.
*   **Cart Drawer:** Ensure the sliding cart drawer polls the latest quantities from `CartContext`.

## Phase 5: The Checkout Flow & Chapa Payment Gateway
**Status:** Implemented but Needs Flow Testing
**Backend API Mapping:** `POST /api/orders/checkout`, `POST /api/orders/:id/pay`, `GET /api/payments/chapa/return`
**Modifications Needed:**
*   **Checkout Validation:** Ensure the shipping address form blocks submission if empty.
*   **Payment Redirection:** Validate the handoff from React to the external Chapa URL (`InitChapaPayment`), and ensure the `PaymentReturnPage.jsx` correctly parses the `tx_ref` URL parameter.

## Phase 6: Buyer Logistics & Order Tracking
**Status:** UI Built, Needs Real Data
**Backend API Mapping:** `GET /api/orders`, `GET /api/orders/:id/tracking`, `POST /api/products/:id/reviews`
**Modifications Needed:**
*   **Order History:** Map the `GET /api/orders` array to the UI cards.
*   **Dynamic Tracking Bar:** Connect the visual dots (Pending -> Processing -> Shipped -> Delivered) mathematically to the backend string status.
*   **Review Submission:** Wire the review form on delivered items to `POST /api/products/:id/reviews`.

## Phase 7: The Seller Sandbox
**Status:** Critical Bugs (White Screen of Death on Inventory Tab)
**Backend API Mapping:** `GET /api/seller/products`, `POST /api/seller/products`, `PUT /api/seller/orders/:id/status`, `GET /api/seller/dashboard/stats`
**Modifications Needed:**
*   **CRASH FIX:** The `SellerDashboard.jsx` crashes when mapping `.products` from the API if the array is `undefined` or null. Must wrap all array maps with optional chaining (`products?.map(...)`) and provide default empty arrays on the `Promise.allSettled` block.
*   **Multi-Part Forms:** Ensure the "Add Product" form perfectly constructs a `FormData` object with images to match the backend `CreateProduct` handler.
*   **Dashboard Stats:** Wire the 4 top analytics cards to `GetSellerDashboardStats`.

## Phase 8: Amazon Logistics (AMZL) Driver Portal
**Status:** UI Pending
**Backend API Mapping:** `GET /api/delivery/available-orders`, `POST /api/delivery/accept/:itemId`, `PUT /api/delivery/assignment/:id/status`
**Modifications Needed:**
*   **Available Routes Feed:** Create a live-updating map or list of packages in the "Pending" state.
*   **Delivery Execution:** UI button to trigger the `UpdateAssignmentStatus` endpoint to "Delivered".

## Phase 9: Global Support & Notification Inbox
**Status:** Basic UI built
**Backend API Mapping:** `GET /api/notifications`, `PUT /api/notifications/:id/read`
**Modifications Needed:**
*   **Polling:** Make the `NotificationHub.jsx` ping `GET /api/notifications` every 30 seconds to update the unread count badge.
*   **Mark as Read:** Clicking a notification must immediately hit the `PUT` endpoint and visually dim the notification card.

## Phase 10: Master Administrative Command Center
**Status:** UI Pending
**Backend API Mapping:** `GET /api/admin/stats`, `GET /api/admin/users`, `PUT /api/admin/users/:id/role`, `PUT /api/admin/sellers/:id/verify`
**Modifications Needed:**
*   **Stat Integration:** Build the top-level God Mode overview calling `/stats`.
*   **User DataGrid:** Build a table displaying all buyers, sellers, and drivers with toggle switches that trigger `AdminVerifySeller` or `AdminChangeUserRole`.
