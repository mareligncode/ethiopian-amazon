package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateRegistry(c *gin.Context) {
	var input struct {
		Title    string `json:"title" binding:"required"`
		Type     string `json:"type" binding:"required"`
		IsPublic bool   `json:"is_public"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	registry := models.Registry{
		UserID:   userID,
		Title:    input.Title,
		Type:     input.Type,
		IsPublic: input.IsPublic,
	}

	if err := config.DB.Create(&registry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create registry"})
		return
	}

	c.JSON(http.StatusCreated, registry)
}

func GetUserRegistries(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))
	var registries []models.Registry
	config.DB.Where("user_id = ?", userID).Preload("Items.Product").Find(&registries)
	c.JSON(http.StatusOK, registries)
}

func AddToRegistry(c *gin.Context) {
	var input struct {
		RegistryID uint `json:"registry_id" binding:"required"`
		ProductID  uint `json:"product_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	// Verify ownership
	var registry models.Registry
	if err := config.DB.Where("id = ? AND user_id = ?", input.RegistryID, userID).First(&registry).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	item := models.RegistryItem{
		RegistryID: input.RegistryID,
		ProductID:  input.ProductID,
	}

	if err := config.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to registry"})
}

func DeleteRegistry(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Registry{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete registry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registry deleted"})
}
