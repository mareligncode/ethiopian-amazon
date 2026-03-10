package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	SellerID      uint           `gorm:"not null;index" json:"seller_id"`
	Name          string         `gorm:"size:255;not null;index" json:"name"`
	Description   string         `gorm:"type:text" json:"description"`
	Price         float64        `gorm:"type:decimal(10,2);not null" json:"price"`
	DiscountPrice *float64       `gorm:"type:decimal(10,2)" json:"discount_price"`
	Stock         int            `gorm:"default:0" json:"stock"`
	CategoryID    uint           `gorm:"not null;index" json:"category_id"`
	Brand         string         `gorm:"size:255" json:"brand"`
	SKU           string         `gorm:"size:100;index" json:"sku"`
	Weight        string         `gorm:"size:100" json:"weight"`
	Dimensions    string         `gorm:"size:255" json:"dimensions"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	IsApproved    bool           `gorm:"default:false" json:"is_approved"`
	ImageURL      string         `gorm:"-" json:"image_url"` // Virtual field for frontend
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	Category Category       `gorm:"foreignKey:CategoryID" json:"category"`
	Images   []ProductImage `gorm:"foreignKey:ProductID" json:"images"`
	Reviews  []Review       `gorm:"foreignKey:ProductID" json:"reviews"`
	Seller   SellerProfile  `gorm:"foreignKey:SellerID;references:UserID" json:"seller"`
}

// AfterFind hook to populate ImageURL from images slice
func (p *Product) AfterFind(tx *gorm.DB) (err error) {
	if len(p.Images) > 0 {
		p.ImageURL = p.Images[0].ImageURL
	}
	return
}
