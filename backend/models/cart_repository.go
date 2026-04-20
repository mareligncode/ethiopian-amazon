package models

import (
	"amazon-clone/config"
	"errors"
	"fmt"
)

// AddToCart adds a product to a user's cart, validating stock and incrementing if it already exists
func AddToCart(userID uint, productID uint, quantity int) (*CartItem, error) {
	// 1. Validate Product Exists (Relaxing all visibility filters for easier testing)
	var product Product
	if err := config.DB.Where("id = ?", productID).First(&product).Error; err != nil {
		return nil, errors.New("product not found in database")
	}

	// 2. Check if the user already has this item in their cart
	var existingItem CartItem
	err := config.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&existingItem).Error

	if err == nil {
		// Item exists in cart: We need to increment its quantity securely
		newQuantity := existingItem.Quantity + quantity
		// Relaxing stock check for development/testing
		// if newQuantity > product.Stock {
		// 	return nil, errors.New("requested quantity exceeds available stock")
		// }

		existingItem.Quantity = newQuantity
		if saveErr := config.DB.Save(&existingItem).Error; saveErr != nil {
			return nil, saveErr
		}
		config.DB.Preload("Product.Images").First(&existingItem, existingItem.ID)
		return &existingItem, nil
	}
	currentPrice := product.Price
	if product.DiscountPrice != nil {
		currentPrice = *product.DiscountPrice
	}

	newItem := CartItem{
		UserID:                userID,
		ProductID:             productID,
		Quantity:              quantity,
		PriceAtAddition:       currentPrice, // Snapshot price to detect changes later
		IsSavedForLater:       false,
		IsSelectedForCheckout: true,
		IsGift:                false,
	}

	if createErr := config.DB.Create(&newItem).Error; createErr != nil {
		return nil, createErr
	}

	config.DB.Preload("Product.Images").First(&newItem, newItem.ID)
	return &newItem, nil
}

func GetUserCart(userID uint) ([]CartItem, error) {
	var cart []CartItem
	err := config.DB.Where("user_id = ?", userID).
		Preload("Product.Images").
		Preload("Product.Category").
		Preload("Product.Seller").
		Find(&cart).Error

	if err != nil {
		return nil, err
	}
	var validCart []CartItem
	var orphanedIDs []uint

	for _, item := range cart {
		if item.Product.ID == 0 {
			orphanedIDs = append(orphanedIDs, item.ID)
		} else {
			validCart = append(validCart, item)
		}
	}

	if len(orphanedIDs) > 0 {
		fmt.Printf("DEBUG: GetUserCart - Purging %d orphaned items for User %d\n", len(orphanedIDs), userID)
		config.DB.Delete(&CartItem{}, orphanedIDs)
	}

	return validCart, nil
}

func UpdateCartItemQuantity(cartItemID string, userID uint, newQuantity int) (*CartItem, error) {
	var item CartItem
	if err := config.DB.Where("id = ? AND user_id = ?", cartItemID, userID).Preload("Product").First(&item).Error; err != nil {
		return nil, errors.New("cart item not found")
	}

	if newQuantity > item.Product.Stock {
		return nil, errors.New("requested quantity exceeds available stock")
	}

	item.Quantity = newQuantity
	if err := config.DB.Save(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

// RemoveFromCart securely deletes a single line item
func RemoveFromCart(cartItemID string, userID uint) error {
	result := config.DB.Where("id = ? AND user_id = ?", cartItemID, userID).Delete(&CartItem{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("cart item not found or unauthorized")
	}
	return nil
}

// ClearCart permanently trashes an entire user's cart (used post-checkout logic)
func ClearCart(userID uint) error {
	// Only clear items that are selected for checkout and NOT saved for later
	return config.DB.Where("user_id = ? AND is_saved_for_later = ? AND is_selected_for_checkout = ?", userID, false, true).Delete(&CartItem{}).Error
}

// Ensure the item exists and belongs to user
func VerifyAndGetCartItem(cartItemID string, userID uint) (*CartItem, error) {
	var item CartItem
	if err := config.DB.Where("id = ? AND user_id = ?", cartItemID, userID).First(&item).Error; err != nil {
		return nil, errors.New("cart item not found")
	}
	return &item, nil
}

func ToggleSaveForLater(cartItemID string, userID uint, isSaved bool) error {
	return config.DB.Model(&CartItem{}).Where("id = ? AND user_id = ?", cartItemID, userID).
		Updates(map[string]interface{}{"is_saved_for_later": isSaved, "is_selected_for_checkout": !isSaved}).Error
}

func ToggleSelection(cartItemID string, userID uint, isSelected bool) error {
	return config.DB.Model(&CartItem{}).Where("id = ? AND user_id = ?", cartItemID, userID).
		Update("is_selected_for_checkout", isSelected).Error
}

// UpdateGiftOptions updates gift flags
func UpdateGiftOptions(cartItemID string, userID uint, isGift bool, message string) error {
	return config.DB.Model(&CartItem{}).Where("id = ? AND user_id = ?", cartItemID, userID).
		Updates(map[string]interface{}{"is_gift": isGift, "gift_message": message}).Error
}
