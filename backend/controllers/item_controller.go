package controllers

import (
	"net/http"

	"amazon-clone/config"
	"amazon-clone/models"

	"github.com/gin-gonic/gin"
)

// GetItems returns all items
func GetItems(c *gin.Context) {
	var items []models.Item
	config.DB.Find(&items)
	c.JSON(http.StatusOK, items)
}

// GetItemByID returns a single item by its ID
func GetItemByID(c *gin.Context) {
	id := c.Param("id")
	var item models.Item

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found!"})
		return
	}

	c.JSON(http.StatusOK, item)
}

// CreateItem adds a new item
func CreateItem(c *gin.Context) {
	var newItem models.Item
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Create(&newItem)
	c.JSON(http.StatusCreated, newItem)
}

// UpdateItem updates an existing item
func UpdateItem(c *gin.Context) {
	id := c.Param("id")
	var item models.Item

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found!"})
		return
	}

	var updatedInput models.Item
	if err := c.ShouldBindJSON(&updatedInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	config.DB.Model(&item).Updates(updatedInput)
	c.JSON(http.StatusOK, item)
}

// DeleteItem removes an item based on ID
func DeleteItem(c *gin.Context) {
	id := c.Param("id")
	var item models.Item

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found!"})
		return
	}

	config.DB.Delete(&item)
	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}
