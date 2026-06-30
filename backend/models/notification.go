package models

import (
	"encoding/json"
	"time"
)

// Notification represents an in-app message and tracking trigger
type Notification struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	UserID    uint            `gorm:"not null;index" json:"user_id"`
	Type      string          `gorm:"type:varchar(20);not null;check:type IN ('order','payment','delivery','promotion','system','seller')" json:"type"`
	Title     string          `gorm:"size:255;not null" json:"title"`
	Message   string          `gorm:"type:text;not null" json:"message"`
	Data      json.RawMessage `gorm:"type:json" json:"data"` // Order ID, Item ID, etc.
	IsRead    bool            `gorm:"default:false" json:"is_read"`
	EmailSent bool            `gorm:"default:false" json:"email_sent"`
	CreatedAt time.Time       `json:"created_at"`

	User User `gorm:"foreignKey:UserID" json:"-"`
}
