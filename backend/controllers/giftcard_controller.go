package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func RedeemGiftCard(c *gin.Context) {
	var input struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var giftCard models.GiftCard
	if err := config.DB.Where("code = ? AND is_redeemed = ?", input.Code, false).First(&giftCard).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or already redeemed gift card code"})
		return
	}

	tx := config.DB.Begin()
	now := time.Now()
	giftCard.IsRedeemed = true
	giftCard.RedeemedBy = &userID
	giftCard.RedeemedAt = &now
	if err := tx.Save(&giftCard).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to redeem code"})
		return
	}

	var user models.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Balance += giftCard.Amount
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "Gift card redeemed successfully",
		"amount":  giftCard.Amount,
		"balance": user.Balance,
	})
}

func GetUserBalance(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": user.Balance})
}
