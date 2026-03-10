package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	ProductID uint           `gorm:"not null;index" json:"product_id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	Rating    int            `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string         `gorm:"type:text" json:"comment"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	User     User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product  Product         `gorm:"foreignKey:ProductID" json:"-"`
	Response *ReviewResponse `gorm:"foreignKey:ReviewID" json:"seller_response,omitempty"` // Added for 1:1 nesting
}
