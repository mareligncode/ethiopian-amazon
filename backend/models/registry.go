package models

import (
	"time"

	"gorm.io/gorm"
)

type Registry struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	Title     string         `gorm:"size:255;not null" json:"title"`
	Type      string         `gorm:"size:100;not null" json:"type"` // e.g., 'wedding', 'baby'
	IsPublic  bool           `gorm:"default:true" json:"is_public"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	User  User           `gorm:"foreignKey:UserID" json:"-"`
	Items []RegistryItem `gorm:"foreignKey:RegistryID" json:"items"`
}

type RegistryItem struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	RegistryID uint `gorm:"not null;index" json:"registry_id"`
	ProductID  uint `gorm:"not null;index" json:"product_id"`

	Product Product `gorm:"foreignKey:ProductID" json:"product"`
}
