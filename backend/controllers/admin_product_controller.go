package controllers

import (
	"fmt"
	"net/http"

	"amazon-clone/models"

	"github.com/gin-gonic/gin"
)

func AdminGetAllProducts(c *gin.Context) {
	products, err := models.GetAllProducts(false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}

func AdminApproveProduct(c *gin.Context) {
	productID := c.Param("id")

	var input struct {
		IsApproved *bool `json:"is_approved" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.ApproveProduct(productID, *input.IsApproved); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update product approval status: %s", err.Error())})
		return
	}

	status := "flagged/unapproved"
	if *input.IsApproved {
		status = "approved"
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product " + status + " successfully"})
}
