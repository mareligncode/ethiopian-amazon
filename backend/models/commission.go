package models

import "time"

// Commission tracks the platform's revenue cut from successful Amazon sales
type Commission struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	OrderItemID      uint       `gorm:"not null;uniqueIndex" json:"order_item_id"`
	SellerID         uint       `gorm:"not null;index" json:"seller_id"`
	ItemPrice        float64    `gorm:"type:decimal(10,2)" json:"item_price"`
	CommissionRate   float64    `gorm:"type:decimal(5,2)" json:"commission_rate"` // e.g., 10.00 for 10%
	CommissionAmount float64    `gorm:"type:decimal(10,2)" json:"commission_amount"`
	SellerEarnings   float64    `gorm:"type:decimal(10,2)" json:"seller_earnings"`
	Status           string     `gorm:"type:varchar(20);default:'pending';check:status IN ('pending','paid','refunded')" json:"status"`
	PaidAt           *time.Time `json:"paid_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`

	OrderItem OrderItem     `gorm:"foreignKey:OrderItemID" json:"order_item"`
	Seller    SellerProfile `gorm:"foreignKey:SellerID" json:"seller_profile"`
}
