package main

import (
	"log"
	"amazon-clone/config"
	"amazon-clone/models"
	"amazon-clone/routes"
	_ "time/tzdata" // Bundles timezone data directly into the binary
)

func main() {
	config.ConnectDatabase()

	err := config.DB.AutoMigrate(
		&models.Item{},
		&models.User{},
		&models.Category{},
		&models.SellerProfile{},
		&models.Product{},
		&models.ProductImage{},
		&models.Review{},
		&models.ReviewResponse{},
		&models.CartItem{},
		&models.Registry{},
		&models.RegistryItem{},
		&models.GiftCard{},
		&models.Order{},
		&models.OrderItem{},
		&models.DeliveryProfile{},
		&models.DeliveryAssignment{},
		&models.Notification{},
		&models.Commission{},
		&models.SystemSetting{},
		&models.Wishlist{},
		&models.CompareItem{},
	)
	if err != nil {
		log.Fatalf("Could not migrate database: %v", err)
	}

	models.SetupInitialAdmin()
	models.InitializeSettings()

	r := routes.SetupRouter()

	log.Println("Server is running on port 8082...")
	r.Run(":8082")
}
