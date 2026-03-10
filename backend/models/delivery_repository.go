package models

import (
	"amazon-clone/config"
	"errors"
	"fmt"
	"time"
)

// CreateOrUpdateDeliveryProfile updates delivery personnel location and basic info
func CreateOrUpdateDeliveryProfile(userID uint, updates map[string]interface{}) (*DeliveryProfile, error) {
	var profile DeliveryProfile
	if err := config.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		// Create new if not exists mapping UserID
		profile = DeliveryProfile{
			UserID: userID,
		}
		if err := config.DB.Create(&profile).Error; err != nil {
			return nil, err
		}
	}

	if err := config.DB.Model(&profile).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &profile, nil
}

// GetAvailableDeliveries pulls OrderItems that are processed but not yet assigned
func GetAvailableDeliveries() ([]OrderItem, error) {
	var items []OrderItem
	// Fetch processing items that do NOT have a DeliveryAssignment yet
	err := config.DB.
		Joins("LEFT JOIN delivery_assignments on delivery_assignments.order_item_id = order_items.id").
		Where("order_items.status = ? AND delivery_assignments.id IS NULL", "processing").
		Preload("Product").
		Preload("Order"). // To get shipping address
		Find(&items).Error
	return items, err
}

// AcceptDelivery links an OrderItem to a DeliveryProfile
func AcceptDelivery(deliveryUserID uint, orderItemID uint) (*DeliveryAssignment, error) {
	var profile DeliveryProfile
	if err := config.DB.Where("user_id = ?", deliveryUserID).First(&profile).Error; err != nil {
		return nil, errors.New("delivery profile not found")
	}

	var item OrderItem
	if err := config.DB.First(&item, orderItemID).Error; err != nil || item.Status != "processing" {
		return nil, errors.New("order item not available for delivery")
	}

	var existingAssignment DeliveryAssignment
	if err := config.DB.Where("order_item_id = ?", orderItemID).First(&existingAssignment).Error; err == nil {
		return nil, errors.New("order item is already assigned to a delivery person")
	}

	assignment := DeliveryAssignment{
		OrderItemID:    orderItemID,
		DeliveryID:     profile.ID,
		Status:         "assigned",
		TrackingNumber: fmt.Sprintf("TBA%d%d", orderItemID, time.Now().Unix()),
		AssignedAt:     time.Now(),
	}

	if err := config.DB.Create(&assignment).Error; err != nil {
		return nil, errors.New("failed to accept delivery")
	}

	return &assignment, nil
}

// UpdateDeliveryStatus manages the real-time shipping lifecycle
func UpdateDeliveryStatus(deliveryUserID uint, assignmentID uint, newStatus string, notes string, proofOption string, recipientPhoto string) (*DeliveryAssignment, error) {
	var assignment DeliveryAssignment
	if err := config.DB.Preload("Delivery").Preload("OrderItem").First(&assignment, assignmentID).Error; err != nil {
		return nil, errors.New("assignment not found")
	}

	if assignment.Delivery.UserID != deliveryUserID {
		return nil, errors.New("unauthorized: assigned to another driver")
	}

	tx := config.DB.Begin()

	assignment.Status = newStatus
	if notes != "" {
		assignment.DeliveryNotes = notes
	}

	now := time.Now()
	// Sync global order tracking based on delivery updates

	// Manually fetch the master order to get the Buyer's UserID for notifications
	var order Order
	if err := config.DB.First(&order, assignment.OrderItem.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("failed to locate master order for notifications")
	}

	if newStatus == "picked" {
		assignment.PickedAt = &now
		assignment.OrderItem.Status = "shipped" // Tell the buyer it's on the way

		// Phase 9: Alert Buyer
		DispatchNotification(
			order.UserID,
			"delivery",
			"Your item has shipped!",
			fmt.Sprintf("Good news! Your order containing %s has left the facility.", assignment.OrderItem.Product.Name),
			fmt.Sprintf("/orders/%d/tracking", assignment.OrderItem.OrderID),
			map[string]interface{}{"tracking_number": assignment.TrackingNumber},
		)

	} else if newStatus == "delivered" {
		// Enforce Amazon Logistics proof standards
		if proofOption == "" && recipientPhoto == "" {
			tx.Rollback()
			return nil, errors.New("proof_option or recipient_photo is explicitly required to mark as delivered")
		}

		assignment.DeliveredAt = &now
		assignment.ProofOption = proofOption
		if recipientPhoto != "" {
			assignment.RecipientPhoto = recipientPhoto
		}
		assignment.OrderItem.Status = "delivered" // Tell the buyer it arrived

		// Phase 9: Alert Buyer
		DispatchNotification(
			order.UserID,
			"delivery",
			"Delivered",
			fmt.Sprintf("Your package has been delivered: %s", proofOption),
			fmt.Sprintf("/orders/%d/tracking", assignment.OrderItem.OrderID),
			map[string]interface{}{"tracking_number": assignment.TrackingNumber},
		)

		// Phase 9: Alert Seller
		DispatchNotification(
			assignment.OrderItem.SellerID,
			"seller",
			"Item Successfully Delivered",
			fmt.Sprintf("Your product %s has successfully reached the buyer.", assignment.OrderItem.Product.Name),
			"/seller/orders",
			map[string]interface{}{"order_item_id": assignment.OrderItem.ID},
		)

	} else if newStatus == "failed" {
		// Driver failed to deliver; could optionally revert order item to processing to be picked up again
		// But let's leave order item in whatever state to require manual review or keep it shipped
	}

	if err := tx.Save(&assignment).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Save(&assignment.OrderItem).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return &assignment, nil
}

// GetMyDeliveries retrieves active assignments for the driver
func GetMyDeliveries(userID uint) ([]DeliveryAssignment, error) {
	var profile DeliveryProfile
	if err := config.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		return nil, errors.New("delivery profile not found")
	}

	var assignments []DeliveryAssignment
	err := config.DB.Where("delivery_id = ?", profile.ID).
		Preload("OrderItem.Product").
		Preload("OrderItem.Order").
		Order("created_at desc").
		Find(&assignments).Error
	return assignments, err
}

// GetBuyerTracking gets assignment tracking for an Order
func GetBuyerTracking(userID uint, orderID string) ([]DeliveryAssignment, error) {
	// Let's first verify the order belongs to the buyer
	var order Order
	if err := config.DB.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		return nil, errors.New("order not found or unauthorized")
	}

	var assignments []DeliveryAssignment
	// We want all DeliveryAssignments attached to the order's items
	err := config.DB.Joins("JOIN order_items on order_items.id = delivery_assignments.order_item_id").
		Where("order_items.order_id = ?", order.ID).
		Preload("OrderItem.Product").
		Preload("Delivery.User"). // To perhaps show driver name
		Find(&assignments).Error

	return assignments, err
}
