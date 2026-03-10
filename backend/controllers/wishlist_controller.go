package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Wishlist Handlers
func GetMyWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var items []models.Wishlist

	if err := config.DB.Preload("Product").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch wishlist"})
		return
	}

	// Transform to match frontend expectation
	products := make([]models.Product, 0)
	for _, item := range items {
		products = append(products, item.Product)
	}

	c.JSON(http.StatusOK, gin.H{"items": products})
}

func AddToWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var input struct {
		ProductID uint `json:"product_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if already exists
	var count int64
	config.DB.Model(&models.Wishlist{}).Where("user_id = ? AND product_id = ?", userID, input.ProductID).Count(&count)
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Already in wishlist"})
		return
	}

	item := models.Wishlist{
		UserID:    userID,
		ProductID: input.ProductID,
	}

	if err := config.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to wishlist"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Added to wishlist"})
}

func RemoveFromWishlist(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	productID := c.Param("id")

	if err := config.DB.Where("user_id = ? AND product_id = ?", userID, productID).Delete(&models.Wishlist{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from wishlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from wishlist"})
}

// Comparison Handlers
func GetMyComparison(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var items []models.CompareItem

	if err := config.DB.Preload("Product").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comparisons"})
		return
	}

	products := make([]models.Product, 0)
	for _, item := range items {
		products = append(products, item.Product)
	}

	c.JSON(http.StatusOK, gin.H{"items": products})
}

func AddToComparison(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var input struct {
		ProductID uint `json:"product_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var count int64
	config.DB.Model(&models.CompareItem{}).Where("user_id = ? AND product_id = ?", userID, input.ProductID).Count(&count)
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Already in comparison list"})
		return
	}

	item := models.CompareItem{
		UserID:    userID,
		ProductID: input.ProductID,
	}

	if err := config.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to comparison"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Added to comparison"})
}
