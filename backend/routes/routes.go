package routes

import (
	"amazon-clone/controllers"
	"amazon-clone/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // Use AllowAllOrigins for smoother local dev
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/auth/register", controllers.Register)
		api.POST("/auth/login", controllers.Login)
		api.POST("/auth/forgot-password", controllers.ForgotPassword)
		api.POST("/auth/reset-password", controllers.ResetPassword)
		api.GET("/items", controllers.GetItems)
		api.GET("/items/:id", controllers.GetItemByID)

		// Phase 3 & 4: Public Catalog
		api.GET("/catalog", controllers.GetCatalog)
		api.GET("/catalog/:id", controllers.GetProductDetails)
		api.GET("/items/related/:id", controllers.GetRelatedProducts) // PDP recommendation widget

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.POST("/items", controllers.CreateItem)
			protected.PUT("/items/:id", controllers.UpdateItem)
			protected.DELETE("/items/:id", controllers.DeleteItem)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
		{
			// Phase 10: Overview & Analytics
			admin.GET("/stats", controllers.GetSystemStats)
			admin.GET("/global-orders", controllers.GetGlobalOrders)

			admin.GET("/users", controllers.AdminGetUsers)
			admin.POST("/users", controllers.AdminCreateUser)
			admin.PUT("/users/:id/role", controllers.AdminChangeUserRole)
			admin.PUT("/users/:id/activate", controllers.AdminActivateUser)
			admin.DELETE("/users/:id", controllers.AdminDeleteUser)
			admin.PUT("/sellers/:id/verify", controllers.AdminVerifySeller)

			admin.GET("/products", controllers.AdminGetAllProducts)
			admin.PUT("/products/:id/approve", controllers.AdminApproveProduct)

			// Admin category management
			admin.POST("/categories", controllers.AdminCreateCategory)
			admin.PUT("/categories/:id", controllers.AdminUpdateCategory)
			admin.DELETE("/categories/:id", controllers.AdminDeleteCategory)

			// System Settings
			admin.GET("/settings", controllers.AdminGetSettings)
			admin.PUT("/settings", controllers.AdminUpdateSetting)
		}

		// Public Review Listings
		api.GET("/products/:id/reviews", controllers.GetCatalogReviews)

		// Buyer-only protected product reviewing
		buyerRoutes := api.Group("/")
		buyerRoutes.Use(middleware.AuthMiddleware(), middleware.RequireBuyer())
		{
			buyerRoutes.POST("/products/:id/reviews", controllers.PostReview)
			buyerRoutes.PUT("/reviews/:id", controllers.EditReview)
		}

		// Seller setup routes
		seller := api.Group("/seller")
		seller.Use(middleware.AuthMiddleware())
		{
			seller.POST("/register", controllers.RegisterSeller) // Buyer upgrading
			seller.POST("/application", controllers.SubmitSellerApplication)
			seller.GET("/application/status", controllers.GetSellerApplicationStatus)

			sellerProtected := seller.Group("/")
			sellerProtected.Use(middleware.RequireSeller())
			{
				sellerProtected.GET("/profile", controllers.GetMySellerProfile)
				sellerProtected.PUT("/profile", controllers.UpdateMySellerProfile)
				sellerProtected.GET("/dashboard/stats", controllers.GetSellerDashboardStats)

				// Seller product management
				sellerProtected.GET("/products", controllers.GetMyProducts)
				sellerProtected.POST("/products", controllers.CreateProduct)
				sellerProtected.PUT("/products/:id", controllers.UpdateProduct)
				sellerProtected.DELETE("/products/:id", controllers.DeleteProduct)
				sellerProtected.PATCH("/products/:id/stock", controllers.UpdateProductStock)

				// Seller Review Responses
				sellerProtected.GET("/reviews", controllers.GetMySellerReviews)
				sellerProtected.POST("/reviews/:id/response", controllers.ReplyToReview)

				// Seller Order Tracking (Phase 6)
				sellerProtected.GET("/orders", controllers.GetMySellerOrders)
				sellerProtected.PUT("/orders/:id/status", controllers.UpdateOrderShippingStatus)
			}
		}

		// Buyer persistent shopping cart
		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware())
		{
			cart.POST("/", controllers.AddItemToCart)
			cart.GET("/", controllers.GetMyCart)
			cart.PUT("/:id", controllers.UpdateCartItem)
			cart.DELETE("/:id", controllers.RemoveCartItem)
			cart.DELETE("/", controllers.ClearMyCart)

			// Amazon-specific granular cart actions
			cart.PUT("/:id/save-for-later", controllers.ToggleSaveForLater)
			cart.PUT("/:id/select", controllers.ToggleSelection)
			cart.PUT("/:id/gift", controllers.UpdateGiftOptions)
		}

		// Buyer Order generation and Tracking
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware()) // Any authenticated user can view their own orders
		{
			orders.POST("/checkout", controllers.Checkout)
			orders.GET("", controllers.GetMyOrders)
			orders.GET("/", controllers.GetMyOrders)
			orders.GET("/:id", controllers.GetOrderDetails)
			orders.POST("/:id/pay", controllers.InitChapaPayment)     // Phase 7
			orders.GET("/:id/tracking", controllers.GetOrderTracking) // Phase 8
		}

		// Driver / Delivery personnel routes (Standardized for DriverDashboard)
		driver := api.Group("/driver")
		driver.Use(middleware.AuthMiddleware(), middleware.RequireDelivery())
		{
			driver.GET("/routes", controllers.GetAvailableOrders)
			driver.POST("/routes/:itemId/accept", controllers.AcceptDelivery)
			driver.GET("/assignment", controllers.GetActiveAssignment)
			driver.POST("/assignment/start", controllers.StartAssignment)
			driver.POST("/deliveries/:id/complete", controllers.CompleteAssignment)
			driver.GET("/my-deliveries", controllers.GetMyDeliveries)
			driver.GET("/stats", controllers.GetDriverStats)
			driver.PUT("/status", controllers.UpdateDeliveryProfile) // Heartbeat/Status
		}

		// Phase 9: Global In-App Notification Hub for all authenticated actors
		notifications := api.Group("/notifications")
		notifications.Use(middleware.AuthMiddleware())
		{
			notifications.GET("/", controllers.GetMyNotifications)
			notifications.PUT("/:id/read", controllers.MarkNotificationRead)
		}

		// Payment Gateway Callbacks (Public)
		payments := api.Group("/payments")
		{
			// Both return and callback can hit the same verification logic for simplicity
			payments.GET("/chapa/return", controllers.VerifyChapaPayment)
			payments.GET("/chapa/callback", controllers.VerifyChapaPayment)
		}

		// Public seller routes
		api.GET("/sellers", controllers.GetPublicSellers)
		api.GET("/sellers/:id/products", controllers.GetSellerProducts)
		// Gift Cards
		protected.POST("/giftcards/redeem", controllers.RedeemGiftCard)
		protected.GET("/user/balance", controllers.GetUserBalance)

		// Registries
		protected.POST("/registries", controllers.CreateRegistry)
		protected.GET("/registries", controllers.GetUserRegistries)
		protected.POST("/registries/items", controllers.AddToRegistry)
		protected.DELETE("/registries/:id", controllers.DeleteRegistry)

		// Wishlist
		protected.GET("/wishlist", controllers.GetMyWishlist)
		protected.POST("/wishlist", controllers.AddToWishlist)
		protected.DELETE("/wishlist/:id", controllers.RemoveFromWishlist)

		// Comparison
		protected.GET("/compare", controllers.GetMyComparison)
		protected.POST("/compare", controllers.AddToComparison)
	}

	return r
}
