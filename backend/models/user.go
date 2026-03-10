package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Name                string         `gorm:"size:100;not null" json:"name"`
	Email               string         `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password            string         `gorm:"size:255;not null" json:"-"`
	Role                string         `gorm:"type:enum('buyer','seller','delivery','admin');default:'buyer'" json:"role"`
	Phone               string         `gorm:"size:20" json:"phone"`
	Balance             float64        `gorm:"type:decimal(10,2);default:0" json:"balance"`
	IsActive            bool           `gorm:"default:true" json:"is_active"`
	IsDeleted           bool           `gorm:"default:false" json:"is_deleted"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
	PasswordResetToken  string         `gorm:"size:255" json:"-"`
	PasswordResetExpiry *time.Time     `json:"-"`
}
