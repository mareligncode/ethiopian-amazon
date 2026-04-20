package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UpdateDeliveryProfile(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		VehicleType   string  `json:"vehicle_type"`
		VehicleNumber string  `json:"vehicle_number"`
		LicenseNumber string  `json:"license_number"`
		ServiceArea   string  `json:"service_area"`
		IsAvailable   *bool   `json:"is_available"`
		Status        string  `json:"status"` // mapped to currentStatus in frontend
		CurrentLat    float64 `json:"current_lat"`
		CurrentLng    float64 `json:"current_lng"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if input.VehicleType != "" {
		updates["vehicle_type"] = input.VehicleType
	}
	if input.Status != "" {
		updates["is_available"] = (input.Status == "available")
	}
	if input.CurrentLat != 0 {
		updates["current_lat"] = input.CurrentLat
	}
	if input.CurrentLng != 0 {
		updates["current_lng"] = input.CurrentLng
	}

	profile, err := models.CreateOrUpdateDeliveryProfile(userID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update delivery profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "profile": profile})
}

func GetAvailableOrders(c *gin.Context) {
	items, err := models.GetAvailableDeliveries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch available deliveries"})
		return
	}

	routes := make([]map[string]interface{}, 0)
	for _, item := range items {
		routes = append(routes, map[string]interface{}{
			"id":                 item.ID,
			"start_location":     "Main Warehouse",
			"end_location":       item.Order.ShippingAddress,
			"estimated_duration": "45 mins",
			"payment":            15.50, // Mocked for demo
			"deliveries": []map[string]interface{}{
				{
					"id":      item.ID,
					"address": item.Order.ShippingAddress,
				},
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{"routes": routes})
}

func AcceptDelivery(c *gin.Context) {
	orderItemIDStr := c.Param("itemId")
	orderItemID, err := strconv.ParseUint(orderItemIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order item ID format"})
		return
	}

	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	assignment, err := models.AcceptDelivery(deliveryUserID, uint(orderItemID))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Delivery successfully assigned!", "assignment": assignment})
}

func GetActiveAssignment(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	var profile models.DeliveryProfile
	if err := config.DB.Where("user_id = ?", deliveryUserID).First(&profile).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"assignment": nil})
		return
	}

	var assignment models.DeliveryAssignment
	err := config.DB.Where("delivery_id = ? AND status NOT IN ('delivered', 'failed')", profile.ID).
		Preload("OrderItem.Product").
		Preload("OrderItem.Order.User").
		First(&assignment).Error

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"assignment": nil})
		return
	}

	resp := map[string]interface{}{
		"id":                   assignment.ID,
		"route_id":             assignment.ID,
		"status":               assignment.Status, // assigned -> pending in UI
		"start_time":           assignment.AssignedAt,
		"completed_deliveries": 0,
		"total_deliveries":     1,
		"deliveries": []map[string]interface{}{
			{
				"id":             assignment.ID,
				"order_id":       assignment.OrderItem.OrderID,
				"customer_name":  assignment.OrderItem.Order.User.Name,
				"customer_phone": assignment.OrderItem.Order.User.Phone,
				"address":        assignment.OrderItem.Order.ShippingAddress,
				"status":         assignment.Status,
			},
		},
	}

	if assignment.Status == "assigned" {
		resp["status"] = "pending"
	} else if assignment.Status == "picked" || assignment.Status == "in_transit" {
		resp["status"] = "active"
	}

	c.JSON(http.StatusOK, gin.H{"assignment": resp})
}

func StartAssignment(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	var assignment models.DeliveryAssignment
	err := config.DB.Joins("JOIN delivery_profiles on delivery_profiles.id = delivery_assignments.delivery_id").
		Where("delivery_profiles.user_id = ? AND delivery_assignments.status = ?", deliveryUserID, "assigned").
		First(&assignment).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No pending assignment found"})
		return
	}

	updated, err := models.UpdateDeliveryStatus(deliveryUserID, assignment.ID, "picked", "Starting route", "", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assignment": updated})
}

func CompleteAssignment(c *gin.Context) {
	assignmentID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	notes := c.PostForm("delivery_notes")
	proof := c.PostForm("delivery_location") // Used for ProofOption

	imageName := ""
	file, err := c.FormFile("proof_images[0]")
	if err == nil {
		imageName = file.Filename
	}

	id, _ := strconv.ParseUint(assignmentID, 10, 32)
	updated, err := models.UpdateDeliveryStatus(deliveryUserID, uint(id), "delivered", notes, proof, imageName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "delivered", "assignment": updated})
}

func GetDriverStats(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	var profile models.DeliveryProfile
	config.DB.Where("user_id = ?", deliveryUserID).First(&profile)

	status := "available"
	if !profile.IsAvailable {
		status = "offline"
	}

	c.JSON(http.StatusOK, gin.H{
		"todayDeliveries": profile.TotalDeliveries, // Simplified
		"todayEarnings":   float64(profile.TotalDeliveries) * 15.50,
		"totalDeliveries": profile.TotalDeliveries,
		"averageRating":   profile.Rating,
		"currentStatus":   status,
	})
}

func GetMyDeliveries(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	deliveryUserID := uint(userIDVal.(float64))

	assignments, err := models.GetMyDeliveries(deliveryUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch your deliveries"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assignment_count": len(assignments), "assignments": assignments})
}
