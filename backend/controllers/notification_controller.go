package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMyNotifications(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var notifications []models.Notification
	err := config.DB.Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&notifications).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	var unreadCount int64
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"unread_count":  unreadCount,
		"notifications": notifications,
	})
}

func MarkNotificationRead(c *gin.Context) {
	notifID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notifID, userID).First(&notification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found or unauthorized"})
		return
	}

	notification.IsRead = true
	if err := config.DB.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read", "notification": notification})
}
