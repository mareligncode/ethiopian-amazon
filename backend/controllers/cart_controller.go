package controllers

import (
	"fmt"
	"net/http"

	"amazon-clone/models"

	"github.com/gin-gonic/gin"
)

func AddItemToCart(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Printf("DEBUG: Cart addition bind error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("DEBUG: Cart addition requested. User: %d, Product: %d, Quantity: %d\n", userID, input.ProductID, input.Quantity)

	cartItem, err := models.AddToCart(userID, input.ProductID, input.Quantity)
	if err != nil {
		fmt.Printf("DEBUG: Cart addition failed: %v\n", err)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart", "cart_item": cartItem})
}

// GetMyCart fetches the entire active cart and returns them in the format expected by the frontend context
func GetMyCart(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	cartItems, err := models.GetUserCart(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	// Permissive return: The frontend does its own filtering for saved_for_later
	// and we skip IsActive/IsApproved checks here to ensure the user sees what they added.
	c.JSON(http.StatusOK, gin.H{
		"cart": cartItems,
	})
}

// UpdateCartItem changes the quantity sequentially checking against max available stock thresholds
func UpdateCartItem(c *gin.Context) {
	cartItemID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedItem, err := models.UpdateCartItemQuantity(cartItemID, userID, input.Quantity)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart quantity updated", "cart_item": updatedItem})
}

// RemoveCartItem securely deletes a single item line directly tied to the buyer
func RemoveCartItem(c *gin.Context) {
	cartItemID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	if err := models.RemoveFromCart(cartItemID, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}

// ClearMyCart trashes the entire cart, typically triggered after payment confirmation
func ClearMyCart(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	if err := models.ClearCart(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}

// ToggleSaveForLater moves an item between the active cart and the saved-for-later queue
func ToggleSaveForLater(c *gin.Context) {
	cartItemID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		IsSaved bool `json:"is_saved"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.ToggleSaveForLater(cartItemID, userID, input.IsSaved); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item state"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item moved successfully"})
}

// ToggleSelection toggles if an item in the active cart is queued for the current checkout action
func ToggleSelection(c *gin.Context) {
	cartItemID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		IsSelected bool `json:"is_selected"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.ToggleSelection(cartItemID, userID, input.IsSelected); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle selection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item selection updated"})
}

// UpdateGiftOptions flags an item as a gift with an optional message
func UpdateGiftOptions(c *gin.Context) {
	cartItemID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		IsGift      bool   `json:"is_gift"`
		GiftMessage string `json:"gift_message"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.UpdateGiftOptions(cartItemID, userID, input.IsGift, input.GiftMessage); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update gift options"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Gift options updated"})
}

// Helper utility to safely grab the `IsPrimary` target URL avoiding slice panics
func getPrimaryImage(images []models.ProductImage) string {
	if len(images) == 0 {
		return ""
	}
	for _, img := range images {
		if img.IsPrimary {
			return img.ImageURL
		}
	}
	return images[0].ImageURL
}
