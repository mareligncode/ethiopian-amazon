package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// ChapaInitializePayload maps the required fields for the Chapa API
type ChapaInitializePayload struct {
	Amount        string            `json:"amount"`
	Currency      string            `json:"currency"`
	Email         string            `json:"email"`
	FirstName     string            `json:"first_name"`
	LastName      string            `json:"last_name"`
	TxRef         string            `json:"tx_ref"`
	CallbackURL   string            `json:"callback_url"`
	ReturnURL     string            `json:"return_url"`
	Customization map[string]string `json:"customization"`
}

// InitChapaPayment handles Buyer request to pay for an existing 'pending' Order
func InitChapaPayment(c *gin.Context) {
	orderID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var order models.Order
	if err := config.DB.Preload("Items").Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order is not in a pending state"})
		return
	}

	// Generate a unique Transaction Reference
	txRef := fmt.Sprintf("txn-%d-%d", order.ID, time.Now().Unix())
	order.TxRef = txRef
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate transaction reference"})
		return
	}

	// In a real application, you'd pull the User's email from the DB here. Assuming a placeholder or using standard mapping.
	var buyer models.User
	config.DB.First(&buyer, userID)

	chapaSecret := os.Getenv("CHAPA_SECRET_KEY")
	if chapaSecret == "" {
		chapaSecret = os.Getenv("CHAPA_TEST_SECRET_KEY") // Fallback to test key
	}

	if chapaSecret == "" {
		// Provide a fallback error message that is extremely obvious to the user testing the API
		c.JSON(http.StatusInternalServerError, gin.H{"error": "FATAL: CHAPA_SECRET_KEY is missing from your .env file. Please add your secret key from your Chapa Dashboard."})
		return
	}

	// Simple split for first/last name to satisfy strict Chapa validation rules
	firstName := buyer.Name
	lastName := "Buyer"
	if len(buyer.Name) > 3 {
		lastName = "User" // Prevents empty last names since Amazon-clone user just has "Name" string
	}

	// Payload construction natively without using an external package
	// Chapa Constraints: title <= 16 chars, description only Alphanumeric + hyphens/underscores/dots/spaces
	payload := ChapaInitializePayload{
		Amount:      fmt.Sprintf("%.2f", order.TotalAmount),
		Currency:    "ETB",
		Email:       buyer.Email,
		FirstName:   firstName,
		LastName:    lastName,
		TxRef:       txRef,
		CallbackURL: "http://localhost:8082/api/payments/chapa/callback",               // Webhook destination
		ReturnURL:   "http://localhost:8082/api/payments/chapa/return?tx_ref=" + txRef, // Browser redirect
		Customization: map[string]string{
			"title":       "Amazon Clone",                            // 12 chars (Max 16)
			"description": fmt.Sprintf("Order %d Payment", order.ID), // Removed '#' (Illegal char)
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode payment payload"})
		return
	}

	// Native net/http request execution
	req, err := http.NewRequest("POST", "https://api.chapa.co/v1/transaction/initialize", bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment request"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+chapaSecret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Chapa gateway timeout"})
		return
	}
	defer resp.Body.Close()

	bodyText, _ := io.ReadAll(resp.Body)

	var chapaResp map[string]interface{}
	json.Unmarshal(bodyText, &chapaResp)

	fmt.Printf("DEBUG: Chapa Initialization payload: %s\n", string(jsonData))
	fmt.Printf("DEBUG: Chapa Response Status: %d\n", resp.StatusCode)
	fmt.Printf("DEBUG: Chapa Response Body: %s\n", string(bodyText))

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": "Chapa rejected payload", "details": chapaResp})
		return
	}

	dataBody, ok := chapaResp["data"].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response from Chapa", "details": chapaResp})
		return
	}
	checkoutURL := dataBody["checkout_url"].(string)

	c.JSON(http.StatusOK, gin.H{
		"message":      "Payment initialized",
		"checkout_url": checkoutURL,
		"tx_ref":       txRef,
	})
}

// VerifyChapaPayment acts as the callback/return verify switch
func VerifyChapaPayment(c *gin.Context) {
	txRef := c.Query("tx_ref")
	if txRef == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tx_ref is required"})
		return
	}

	chapaSecret := os.Getenv("CHAPA_SECRET_KEY")
	if chapaSecret == "" {
		chapaSecret = os.Getenv("CHAPA_TEST_SECRET_KEY")
	}
	req, err := http.NewRequest("GET", "https://api.chapa.co/v1/transaction/verify/"+txRef, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to formulate verification request"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+chapaSecret)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Chapa gateway timeout"})
		return
	}
	defer resp.Body.Close()

	bodyText, _ := io.ReadAll(resp.Body)

	var verifyResp map[string]interface{}
	json.Unmarshal(bodyText, &verifyResp)

	status, ok := verifyResp["status"].(string)
	if !ok || status != "success" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment verification failed", "details": verifyResp})
		return
	}

	// Find the associated order
	var order models.Order
	if err := config.DB.Where("tx_ref = ?", txRef).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found for valid transaction"})
		return
	}

	// Update the Order status indicating successful financial clearance
	order.Status = "processing"
	order.PaymentMethod = "chapa"

	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	// Phase 9: Alert Buyer that Payment Cleared
	models.DispatchNotification(
		order.UserID,
		"payment",
		"Payment Confirmation",
		fmt.Sprintf("Your payment of ETB %.2f for Order #%d has been successfully processed.", order.TotalAmount, order.ID),
		fmt.Sprintf("/orders/%d", order.ID),
		map[string]interface{}{"order_id": order.ID, "tx_ref": txRef},
	)

	// Fetch OrderItems to alert Sellers and calculate Platform Commissions
	var orderItems []models.OrderItem
	config.DB.Where("order_id = ?", order.ID).Find(&orderItems)
	for i := range orderItems {
		orderItems[i].Status = "processing"
		config.DB.Save(&orderItems[i])

		models.DispatchNotification(
			orderItems[i].SellerID,
			"seller",
			"Payment Cleared - Ready for Fulfillment",
			fmt.Sprintf("Payment secured for Order Item #%d. Please prepare for shipping.", orderItems[i].ID),
			"/seller/orders",
			map[string]interface{}{"order_item_id": orderItems[i].ID},
		)

		// Phase 10: Amazon Revenue Generation (Platform deducts 10% Commission)
		commissionRate := 10.00
		totalItemRevenue := orderItems[i].PriceAtPurchase * float64(orderItems[i].Quantity)
		platformCut := totalItemRevenue * (commissionRate / 100.0)
		sellerEarns := totalItemRevenue - platformCut

		commission := models.Commission{
			OrderItemID:      orderItems[i].ID,
			SellerID:         orderItems[i].SellerID,
			ItemPrice:        totalItemRevenue,
			CommissionRate:   commissionRate,
			CommissionAmount: platformCut,
			SellerEarnings:   sellerEarns,
			Status:           "pending", // Becomes "paid" when Admin cashes out the Seller
		}

		if err := config.DB.Create(&commission).Error; err != nil {
			fmt.Printf("Critical Platform Error: Failed to generate Commission for Item %d\n", orderItems[i].ID)
		}
	}

	// If this was a browser return (ReturnURL), redirect directly to the Digital Ticket
	// Otherwise (CallbackURL), return JSON
	if c.Request.URL.Path == "/api/payments/chapa/return" {
		targetURL := fmt.Sprintf("http://localhost:5173/orders/%d/ticket?payment=success", order.ID)
		fmt.Printf("DEBUG: Redirecting to ticket: %s\n", targetURL)
		c.Redirect(http.StatusFound, targetURL)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment confirmed and Order is now processing!", "order_id": order.ID})
}
