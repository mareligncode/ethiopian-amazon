package models

import (
	"amazon-clone/config"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func SetupInitialAdmin() {
	var admin User
	if err := config.DB.Where("role = ?", "admin").First(&admin).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		newAdmin := User{
			Name:     "Super Admin",
			Email:    "admin@amazon.com",
			Password: string(hash),
			Role:     "admin",
		}
		if err := config.DB.Create(&newAdmin).Error; err != nil {
			log.Printf("Failed to spawn initial Admin: %v", err)
		} else {
			log.Println("Successfully spawned master admin@amazon.com!")
		}
	} else {
		log.Println("Admin account already active.")
	}
}
