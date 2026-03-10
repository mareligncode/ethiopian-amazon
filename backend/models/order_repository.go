package models

import (
	"amazon-clone/config"
	"errors"
	"fmt"
)

// ProcessCheckout executes a safe transaction converting active cart items into a concrete order
func ProcessCheckout(userID uint, shippingAddress string) (*Order, error) {
	var cartItems []CartItem
	// Only fetch items explicitly selected for checkout by the Amazon-grade toggle
	// FETCH EVERYTHING for debugging to see what's actually there
	fmt.Printf("DEBUG: ProcessCheckout started for User %d\n", userID)
	if err := config.DB.Preload("Product").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		fmt.Printf("DEBUG: Failed to fetch cart: %v\n", err)
		return nil, errors.New("failed to retrieve cart items")
	}

	fmt.Printf("DEBUG: Found %d total items in user cart record\n", len(cartItems))
	var selectedItems []CartItem
	for _, item := range cartItems {
		fmt.Printf("DEBUG: ItemID %d | ProductID %d | Selected: %v | Saved: %v\n", item.ID, item.ProductID, item.IsSelectedForCheckout, item.IsSavedForLater)
		if item.IsSelectedForCheckout && !item.IsSavedForLater {
			selectedItems = append(selectedItems, item)
		}
	}
	cartItems = selectedItems

	if len(cartItems) == 0 {
		return nil, errors.New("Your cart is empty. Please add items and ensure they are selected for checkout.")
	}

	// --- PHASE 6.1: BULK RESILIENCE CHECK ---
	// Before starting any transaction, identify products that have been deleted/purged
	var productIDs []uint
	for _, item := range cartItems {
		productIDs = append(productIDs, item.ProductID)
	}

	var existingProductIDs []uint
	if err := config.DB.Model(&Product{}).Where("id IN ?", productIDs).Pluck("id", &existingProductIDs).Error; err != nil {
		fmt.Printf("DEBUG: Failed to bulk check products: %v\n", err)
		return nil, errors.New("system error during product availability check")
	}

	// Create a map for O(1) existence check
	existsMap := make(map[uint]bool)
	for _, id := range existingProductIDs {
		existsMap[id] = true
	}

	var orphanedCartItemIDs []uint
	for _, item := range cartItems {
		if !existsMap[item.ProductID] {
			orphanedCartItemIDs = append(orphanedCartItemIDs, item.ID)
		}
	}

	// If we found orphaned items, purge them and abort with a clear message
	if len(orphanedCartItemIDs) > 0 {
		fmt.Printf("DEBUG: Found %d orphaned cart items. Purging.\n", len(orphanedCartItemIDs))
		config.DB.Delete(&CartItem{}, orphanedCartItemIDs)
		return nil, errors.New("Some items in your cart are no longer available and have been removed. Please review your updated cart and try again.")
	}

	// Begin GORM Transaction
	tx := config.DB.Begin()

	var totalAmount float64
	var orderItems []OrderItem

	// Pre-validate stock and build the line items
	for _, cartItem := range cartItems {
		var product Product
		// Re-fetch product aggressively inside the transaction applying a row lock
		if err := tx.Where("id = ?", cartItem.ProductID).First(&product).Error; err != nil {
			// This should be rare now given the bulk check above, but keep it for safety
			tx.Rollback()
			return nil, errors.New("one or more items are no longer available")
		}

		if cartItem.Quantity > product.Stock {
			tx.Rollback()
			return nil, errors.New("stock validation failed for product: " + product.Name)
		}

		// Calculate precise checkout price
		lockedPrice := product.Price
		if product.DiscountPrice != nil {
			lockedPrice = *product.DiscountPrice
		}

		totalAmount += lockedPrice * float64(cartItem.Quantity)

		// Decrement global stock inventory immediately
		product.Stock -= cartItem.Quantity
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		orderItems = append(orderItems, OrderItem{
			ProductID:       product.ID,
			SellerID:        product.SellerID,
			Quantity:        cartItem.Quantity,
			PriceAtPurchase: lockedPrice,
			Status:          "pending",
		})
	}

	// Create the Master Order
	order := Order{
		UserID:          userID,
		TotalAmount:     totalAmount,
		ShippingAddress: shippingAddress,
		Status:          "pending",
		PaymentMethod:   "pending", // Wait for Phase 7
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("failed to generate master order")
	}

	// Attach the generated Master Order ID to the line items and save them
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("failed to generate line items")
	}

	// Wipe the selected items from the user's cart now that they are processed
	if err := tx.Where("user_id = ? AND is_selected_for_checkout = ? AND is_saved_for_later = ?", userID, true, false).Delete(&CartItem{}).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("failed to clear shopping cart")
	}

	// Commit Transaction
	tx.Commit()

	// Fetch full order to return
	tx.Preload("Items.Product").First(&order, order.ID)

	// Phase 9: Trigger Dual Notification to the Buyer
	DispatchNotification(
		userID,
		"order",
		"Order Confirmed!",
		"Your order has been successfully placed and is pending payment.",
		"/orders",
		map[string]interface{}{"order_id": order.ID, "total": order.TotalAmount},
	)

	// Phase 9: Trigger Dual Notifications to the respective Sellers
	for _, item := range order.Items {
		DispatchNotification(
			item.SellerID,
			"seller",
			"New Order Request",
			"A buyer has purchased your product. Please check your pending orders.",
			"/seller/orders",
			map[string]interface{}{"order_item_id": item.ID, "product_id": item.ProductID},
		)
	}

	return &order, nil
}

// GetBuyerOrders fetches a user's master purchase history
func GetBuyerOrders(userID uint) ([]Order, error) {
	var orders []Order
	err := config.DB.Where("user_id = ?", userID).
		Preload("Items.Product.Seller"). // Reveal who shipped what inside the receipt
		Order("created_at desc").
		Find(&orders).Error
	return orders, err
}

// GetOrderDetails fetches a single order after verifying ownership
func GetOrderDetails(userID uint, orderID string) (*Order, error) {
	fmt.Printf("DEBUG: GetOrderDetails - Searching for OrderID %s for UserID %d\n", orderID, userID)
	var order Order
	err := config.DB.Where("id = ? AND user_id = ?", orderID, userID).
		Preload("Items.Product.Seller").
		Preload("User").
		First(&order).Error
	if err != nil {
		fmt.Printf("DEBUG: GetOrderDetails - Failed: %v\n", err)
	}
	return &order, err
}

// GetSellerOrders fetches only the line items a specific merchant is responsible for
func GetSellerOrders(sellerID uint) ([]OrderItem, error) {
	var items []OrderItem
	// Intelligently preloading the master order details so the seller knows where to ship it
	err := config.DB.Where("seller_id = ?", sellerID).
		Preload("Product").
		Preload("Order").
		Order("created_at desc").
		Find(&items).Error
	return items, err
}

func UpdateOrderItemStatus(sellerID uint, orderItemID string, newStatus string) (*OrderItem, error) {
	var item OrderItem
	if err := config.DB.Where("id = ? AND seller_id = ?", orderItemID, sellerID).First(&item).Error; err != nil {
		return nil, errors.New("unauthorized: order item not found or doesn't belong to your store")
	}

	item.Status = newStatus
	if err := config.DB.Save(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}
