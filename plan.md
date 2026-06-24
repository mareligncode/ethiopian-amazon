# 20-Phase Project Plan: Ethiopian Amazon E-Commerce Platform

---

### Backend Restructuring & Optimization
1. **Phase 1: Separation of Models & Repositories** - Move database access logic out of `models/` into a dedicated `repositories/` folder.
2. **Phase 2: Modularize Routing** - Split the massive `routes.go` into domain-specific files (`admin_routes.go`, `buyer_routes.go`, etc.).
3. **Phase 3: Enhance Authentication & Middleware** - Add Refresh Tokens and strict Role-Based Access Control (RBAC).
4. **Phase 4: Structured Logging & Error Handling** - Replace standard log prints with a global error handler and a structured logger (like Zap).
5. **Phase 5: Database Optimization** - Add database indexes, optimize GORM `Preload` queries, and handle cascading deletes.

### Frontend Foundation & Stabilization
6. **Phase 6: Domain-Based Folder Restructuring** - Organize `src/pages` by domain (`/auth`, `/shop`, `/user`, `/seller`, `/admin`, `/driver`).
7. **Phase 7: State Management & Hydration** - Ensure React Contexts (Auth, Cart) hydrate from `localStorage` without crashing.
8. **Phase 8: Strict Role-Based Routing (RBAC)** - Build robust layout wrappers to handle 401/403 redirects cleanly.
9. **Phase 9: Global API Integration Layer** - Add Axios interceptors to automatically attach JWTs and handle global logouts.
10. **Phase 10: UI/UX Component Standardization** - Create reusable Tailwind components (Buttons, Modals, Inputs) for pixel-perfect design.

### Full-Stack Feature Wiring
11. **Phase 11: Public Catalog & Shopping Cart** - Wire the Home and Product Details Pages. Hook up the sliding Cart drawer to the backend API.
12. **Phase 12: Checkout & Payment Gateway Integration** - Finish the Chapa payment handoff and shipping address validation logic.
13. **Phase 13: Buyer Dashboard & Order Tracking** - Connect the dynamic order tracking timeline and review submission forms.
14. **Phase 14: Seller Dashboard & Inventory Management** - Fix the Seller UI crashes. Implement multi-part `FormData` logic for product image uploads.
15. **Phase 15: Delivery Portal & Admin God Mode** - Build the Driver delivery-acceptance UI and the Admin statistics dashboard.

### Quality Assurance, Polish & Deployment
16. **Phase 16: Backend Unit & Integration Testing** - Write automated tests for core logic (Cart checkout, Commission calculations).
17. **Phase 17: Frontend End-to-End (E2E) Testing** - Setup automated browser testing (e.g., Cypress) for critical purchase flows.
18. **Phase 18: Full-Stack Performance Optimization** - Implement image lazy-loading, frontend code splitting, and backend query caching.
19. **Phase 19: Notifications & Real-Time Sync** - Finalize the global Notification Inbox with background polling or WebSockets.
20. **Phase 20: CI/CD & Production Deployment** - Dockerize the application and set up an automated staging/production deployment pipeline.
