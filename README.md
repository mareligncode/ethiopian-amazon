# Ethiopian Amazon (Multi-Vendor E-Commerce Platform)
cd d:\go-gin
docker compose up --build
Email: admin@hotel.com
Password: admin_password123

##  What Problem It Solves
It bridges the gap between local vendors and buyers by providing a centralized online marketplace. It simplifies product discovery, order management, secure payments, and delivery logistics in a unified platform tailored for the local market.

##  How It Works (Business Rule Stack)
The system operates on a multi-tier structure connecting Buyers, Sellers, Admin, and Delivery personnel:
1. **Sellers** register to manage inventory, product listings, pricing, and view reviews.
2. **Buyers** browse categories, add items to carts or wishlists, use gift cards, and checkout securely.
3. **Admin/Platform** oversees global settings, commissions on sales, and system moderation.
4. **Delivery Partners** receive automated delivery assignments and update delivery statuses.

##  Key Functionality
- **Multi-Role Ecosystem**: Distinct profiles for Admins, Buyers, Sellers, and Delivery Drivers.
- **Product Management**: Comprehensive item tracking, categories, image handling, and inventory validation.
- **Order & Cart Lifecycle**: Robust cart repository, secure checkout, order persistence, and tracking.
- **Delivery Management**: Automated delivery assignments to active delivery profiles.
- **Platform Monetization**: Built-in commission calculations for multi-vendor payouts.
- **Engagement & Support**: Customer reviews, seller responses, wishlists, and a notification dispatcher.

##  Technical Foundation
- **Backend Architecture**: Go (Golang) using the Gin HTTP web framework.
- **Frontend Stack**: Modern JavaScript/React components for robust UI interfaces.
- **Design Pattern**: Controller-Repository pattern to enforce strict business rules data integrity.
