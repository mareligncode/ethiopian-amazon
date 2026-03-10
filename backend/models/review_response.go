package models

import "time"

// ReviewResponse is an optional reply by a Seller to a Buyer's Review
type ReviewResponse struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `gorm:"not null;uniqueIndex" json:"review_id"` // 1:1 relationship with a single Review
	SellerID  uint      `gorm:"not null" json:"seller_id"`
	Response  string    `gorm:"type:text;not null" json:"response"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Review Review        `gorm:"foreignKey:ReviewID" json:"-"`
	Seller SellerProfile `gorm:"foreignKey:SellerID;references:UserID" json:"seller"`
}
