package models

import (
	"time"

	"gorm.io/gorm"
)

type GiftCard struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Code       string         `gorm:"size:20;uniqueIndex;not null" json:"code"`
	Amount     float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	IsRedeemed bool           `gorm:"default:false" json:"is_redeemed"`
	RedeemedBy *uint          `json:"redeemed_by"` // UserID
	RedeemedAt *time.Time     `json:"redeemed_at"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
