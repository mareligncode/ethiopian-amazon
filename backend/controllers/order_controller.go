package controllers

import (
	"amazon-clone/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Checkout creates an immutable Order out of the actively selected CartItems
func Checkout(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	fmt.Printf("DEBUG: Checkout Request - Raw UserID from context: %v (type: %T)\n", userIDVal, userIDVal)
	userID := uint(userIDVal.(float64))

	var input struct {
		ShippingAddress string `json:"shipping_address" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := models.ProcessCheckout(userID, input.ShippingAddress)
	if err != nil {
		// Return 422 (Unprocessable Entity) for business logic/validation failures
		// like "cart empty" or "items no longer available"
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Checkout successful! Order originated.", "order": order})
}

// GetMyOrders fetches all past purchases mimicking Amazon's 'Returns & Orders' tab
func GetMyOrders(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	fmt.Printf("DEBUG: GetMyOrders Request - Raw UserID from context: %v (type: %T)\n", userIDVal, userIDVal)
	userID := uint(userIDVal.(float64))

	orders, err := models.GetBuyerOrders(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_orders": len(orders), "orders": orders})
}

// GetOrderTracking fetches the delivery telemetry for all items within a single master order (Phase 8 integration)
func GetOrderTracking(c *gin.Context) {
	orderID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	tracking, err := models.GetBuyerTracking(userID, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tracked_items": len(tracking), "tracking_assignments": tracking})
}

// GetOrderDetails handles the specialized request for a single receipt/ticket
func GetOrderDetails(c *gin.Context) {
	orderID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	order, err := models.GetOrderDetails(userID, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

// GetMySellerOrders fetches distinct OrderItems strictly belonging to the merchant's products
func GetMySellerOrders(c *gin.Context) {
	sellerIDVal, _ := c.Get("user_id") // Sourced safely via RequireSeller middleware
	sellerID := uint(sellerIDVal.(float64))

	items, err := models.GetSellerOrders(sellerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending seller shipments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pending_items": len(items), "items": items})
}

// UpdateOrderShippingStatus flags the line item securely as dispatched
func UpdateOrderShippingStatus(c *gin.Context) {
	orderItemID := c.Param("id")
	sellerIDVal, _ := c.Get("user_id")
	sellerID := uint(sellerIDVal.(float64))

	var input struct {
		Status string `json:"status" binding:"required,oneof=processing shipped delivered cancelled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedItem, err := models.UpdateOrderItemStatus(sellerID, orderItemID, input.Status)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order Item status updated dynamically", "order_item": updatedItem})
}
