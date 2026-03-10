package models

import (
	"time"
)

// CartItem represents a single product line item inside a user's persistent shopping cart
type CartItem struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	UserID                uint      `gorm:"not null;index" json:"user_id"`
	ProductID             uint      `gorm:"not null;index" json:"product_id"`
	Quantity              int       `gorm:"not null;default:1;check:quantity > 0" json:"quantity"`
	IsSavedForLater       bool      `gorm:"default:false" json:"is_saved_for_later"`
	IsSelectedForCheckout bool      `gorm:"default:true" json:"is_selected"` // Renamed for frontend getCartTotal
	IsGift                bool      `gorm:"default:false" json:"is_gift"`
	GiftMessage           string    `gorm:"size:255" json:"gift_message"`
	PriceAtAddition       float64   `gorm:"type:decimal(10,2);not null" json:"price_at_addition"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`

	Product Product `gorm:"foreignKey:ProductID" json:"Product"` // Preloads rich product data
}
