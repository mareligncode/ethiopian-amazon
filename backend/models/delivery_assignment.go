package models

import "time"

// DeliveryAssignment maps a specific active shipment strictly to a delivery personnel
type DeliveryAssignment struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	OrderItemID    uint       `gorm:"not null;uniqueIndex" json:"order_item_id"` // One delivery per order item
	DeliveryID     uint       `gorm:"not null;index" json:"delivery_id"`
	Status         string     `gorm:"type:varchar(20);default:'assigned';check:status IN ('assigned','picked','in_transit','delivered','failed')" json:"status"`
	AssignedAt     time.Time  `json:"assigned_at"`
	PickedAt       *time.Time `json:"picked_at,omitempty"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	DeliveryNotes  string     `gorm:"type:text" json:"delivery_notes"`
	TrackingNumber string     `gorm:"uniqueIndex;size:50" json:"tracking_number"` // Advanced AMZL: TBA tracking ID
	ProofOption    string     `gorm:"size:100" json:"proof_option"`               // E.g., Handed directly to resident, Front Porch
	RecipientPhoto string     `gorm:"size:500" json:"recipient_photo"`            // Proof of delivery image lookup
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	OrderItem OrderItem       `gorm:"foreignKey:OrderItemID" json:"order_item"`
	Delivery  DeliveryProfile `gorm:"foreignKey:DeliveryID" json:"delivery_profile"`
}
