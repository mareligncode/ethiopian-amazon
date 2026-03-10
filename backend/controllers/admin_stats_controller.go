package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetSystemStats returns a high-level overview of the Amazon Clone platform
func GetSystemStats(c *gin.Context) {
	var totalUsers int64
	var totalSellers int64
	var totalOrders int64
	var totalRevenue float64
	var totalCommission float64

	// Count Roles
	config.DB.Model(&models.User{}).Count(&totalUsers)
	config.DB.Model(&models.User{}).Where("role = ?", "seller").Count(&totalSellers)

	// Count Orders
	config.DB.Model(&models.Order{}).Count(&totalOrders)

	// Sum Revenue
	var sumResult struct {
		Total sql.NullFloat64
	}
	config.DB.Model(&models.Order{}).Where("status != ?", "pending").Select("sum(total_amount) as total").Scan(&sumResult)
	if sumResult.Total.Valid {
		totalRevenue = sumResult.Total.Float64
	}

	// Sum Platform Commission Earnings
	var commResult struct {
		Total sql.NullFloat64
	}
	config.DB.Model(&models.Commission{}).Select("sum(commission_amount) as total").Scan(&commResult)
	if commResult.Total.Valid {
		totalCommission = commResult.Total.Float64
	}

	c.JSON(http.StatusOK, gin.H{
		"totalRevenue":       totalRevenue,
		"platformCommission": totalCommission,
		"totalTransactions":  totalOrders,
		"activeUsers":        totalUsers,
		"monthlyRevenue":     []float64{}, // Placeholder to prevent frontend undefined errors
		"topSellers":         []string{},  // Placeholder
		"recentTransactions": []string{},  // Placeholder
	})
}

// GetGlobalOrders allows Admins to oversee all platform transactions
func GetGlobalOrders(c *gin.Context) {
	var orders []models.Order
	statusFilter := c.Query("status")

	query := config.DB.Preload("Items").Preload("Items.Product").Preload("User")

	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	if err := query.Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch platform orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}
