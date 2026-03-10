package models

import "time"

type SellerProfile struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null;uniqueIndex" json:"user_id"`
	StoreName       string    `gorm:"size:200;not null" json:"store_name"`
	BusinessType    string    `gorm:"size:100" json:"business_type"`
	Status          string    `gorm:"size:50;default:'pending'" json:"status"`
	StoreLogo       string    `gorm:"size:500" json:"store_logo"`
	StoreBanner     string    `gorm:"size:500" json:"store_banner"`
	Description     string    `gorm:"type:text" json:"description"`
	Address         string    `gorm:"size:500" json:"address"`
	BusinessLicense string    `gorm:"size:500" json:"business_license"` // Document URL
	TaxDocument     string    `gorm:"size:500" json:"tax_document"`
	IDDocument      string    `gorm:"size:500" json:"id_document"`
	TaxID           string    `gorm:"size:100" json:"tax_id"`
	Phone           string    `gorm:"size:20" json:"phone"`
	Email           string    `gorm:"size:100" json:"email"`
	AccountNumber   string    `gorm:"size:100" json:"account_number"`
	RoutingNumber   string    `gorm:"size:100" json:"routing_number"`
	AccountHolder   string    `gorm:"size:200" json:"account_holder"`
	Rating          float64   `gorm:"type:decimal(2,1);default:0" json:"rating"`
	TotalSales      int       `gorm:"default:0" json:"total_sales"`
	IsVerified      bool      `gorm:"default:false" json:"is_verified"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	User User `gorm:"foreignKey:UserID" json:"-"`
}
