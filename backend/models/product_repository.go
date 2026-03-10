package models

import (
	"amazon-clone/config"
	"errors"
)

func CreateProduct(product *Product) error {
	return config.DB.Create(product).Error
}

func CreateProductImage(img *ProductImage) error {
	return config.DB.Create(img).Error
}

func GetProductsBySeller(sellerID uint) ([]Product, error) {
	var products []Product
	err := config.DB.Where("seller_id = ?", sellerID).Preload("Category").Preload("Images").Find(&products).Error
	return products, err
}

// GetProductByID fetches a single product.
// If sellerID is not nil, it enforces that the product must belong to that seller.
func GetProductByID(id string, sellerID *uint) (Product, error) {
	var product Product
	query := config.DB.Preload("Category").Preload("Images")

	if sellerID != nil {
		query = query.Where("seller_id = ?", *sellerID)
	}

	err := query.First(&product, id).Error
	return product, err
}

func UpdateProduct(product *Product) error {
	return config.DB.Save(product).Error
}

func DeleteProduct(id string, sellerID uint) error {
	result := config.DB.Where("seller_id = ?", sellerID).Delete(&Product{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("product not found or unauthorized")
	}
	return nil
}

func UpdateProductStock(id string, sellerID uint, stock int) error {
	result := config.DB.Model(&Product{}).Where("id = ? AND seller_id = ?", id, sellerID).Update("stock", stock)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("product not found or unauthorized")
	}
	return nil
}

func GetAllProducts(onlyActiveAndApproved bool) ([]Product, error) {
	var products []Product
	query := config.DB.Preload("Category").Preload("Images").Preload("Seller")

	if onlyActiveAndApproved {
		query = query.Where("is_active = ? AND is_approved = ?", true, true)
	}

	err := query.Find(&products).Error
	return products, err
}

func ApproveProduct(id string, isApproved bool) error {
	return config.DB.Model(&Product{}).Where("id = ?", id).Update("is_approved", isApproved).Error
}
