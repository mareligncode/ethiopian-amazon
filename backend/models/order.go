package models

import "time"

// Order represents a Buyer's checkout transaction
type Order struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null;index" json:"user_id"`
	TotalAmount     float64   `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	ShippingAddress string    `gorm:"type:text;not null" json:"shipping_address"`
	PaymentMethod   string    `gorm:"not null;default:'pending'" json:"payment_method"` // Will be upgraded in Phase 7
	TxRef           string    `gorm:"uniqueIndex;size:100" json:"tx_ref"`               // Phase 7: Chapa Transaction Reference (Requires size for MySQL Index)
	Status          string    `gorm:"type:varchar(20);default:'pending';check:status IN ('pending','processing','completed','cancelled')" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Items []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	User  User        `gorm:"foreignKey:UserID" json:"user"`
}

// OrderItem breaks down the Master Order into distinct line-items routed to specific Sellers
type OrderItem struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	OrderID         uint      `gorm:"not null;index" json:"order_id"`
	ProductID       uint      `gorm:"not null;index" json:"product_id"`
	SellerID        uint      `gorm:"not null;index" json:"seller_id"`
	Quantity        int       `gorm:"not null;check:quantity > 0" json:"quantity"`
	PriceAtPurchase float64   `gorm:"type:decimal(10,2);not null" json:"price_at_purchase"` // Lock in the financial record
	Status          string    `gorm:"type:varchar(20);default:'pending';check:status IN ('pending','processing','shipped','delivered','cancelled')" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Product Product `gorm:"foreignKey:ProductID" json:"product"`
	Order   Order   `gorm:"foreignKey:OrderID" json:"order"`
}
