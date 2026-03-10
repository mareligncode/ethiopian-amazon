package models

import "time"

// DeliveryProfile tracks vehicles, location, and rating for delivery personnel
type DeliveryProfile struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null;uniqueIndex" json:"user_id"`
	VehicleType     string    `gorm:"size:50" json:"vehicle_type"` // Bike, Car, Van
	VehicleNumber   string    `gorm:"size:50" json:"vehicle_number"`
	LicenseNumber   string    `gorm:"size:100" json:"license_number"`
	ServiceArea     string    `gorm:"size:500" json:"service_area"` // JSON or text
	IsAvailable     bool      `gorm:"default:true" json:"is_available"`
	CurrentLat      float64   `gorm:"type:decimal(10,8)" json:"current_lat"`
	CurrentLng      float64   `gorm:"type:decimal(11,8)" json:"current_lng"`
	Rating          float64   `gorm:"type:decimal(2,1);default:0" json:"rating"`
	TotalDeliveries int       `gorm:"default:0" json:"total_deliveries"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	User User `gorm:"foreignKey:UserID" json:"user"`
}
