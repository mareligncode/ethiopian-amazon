package controllers

import (
	"amazon-clone/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PostReview allows a buyer to rate a product securely
func PostReview(c *gin.Context) {
	productIDVal := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		ProductID uint   `json:"product_id" binding:"required"`
		Rating    int    `json:"rating" binding:"required,min=1,max=5"`
		Comment   string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure the param ID strictly matches payload intent
	if fmt.Sprintf("%d", input.ProductID) != productIDVal {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product ID payload mismatch"})
		return
	}

	review, err := models.AddReview(userID, input.ProductID, input.Rating, input.Comment)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review submitted successfully", "review": review})
}

// EditReview safely lets a buyer modify their rating
func EditReview(c *gin.Context) {
	reviewID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := models.UpdateReview(reviewID, userID, input.Rating, input.Comment)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully", "review": review})
}

// ReplyToReview gives verified sellers the ability to publish one singular response under a buyer's criticism
func ReplyToReview(c *gin.Context) {
	reviewID := c.Param("id")
	sellerIDVal, _ := c.Get("user_id") // RequireSeller middleware validates they intrinsically own a SellerProfile tied to this UserID
	sellerID := uint(sellerIDVal.(float64))

	var input struct {
		Response string `json:"response" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := models.AddReviewResponse(sellerID, reviewID, input.Response)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Seller response published successfully", "seller_response": response})
}

// GetCatalogReviews pulls public product reviews entirely free of auth tokens
func GetCatalogReviews(c *gin.Context) {
	productID := c.Param("id")

	reviews, err := models.GetProductReviews(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve product reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_reviews": len(reviews), "reviews": reviews})
}
