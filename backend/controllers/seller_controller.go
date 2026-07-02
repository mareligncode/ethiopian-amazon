package controllers

import (
	"net/http"

	"amazon-clone/config"
	"amazon-clone/models"
	"amazon-clone/utils"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func RegisterSeller(c *gin.Context) {
	// Re-route to SubmitSellerApplication for consolidated logic
	SubmitSellerApplication(c)
}

func SubmitSellerApplication(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uint(userIDVal.(float64))

	// Parse multipart form (max 10MB)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	// Verify user is not already a seller
	user, err := models.GetUserByID(fmt.Sprint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	if user.Role == "seller" {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already a seller"})
		return
	}

	// Build address from individual fields or single field
	address := c.PostForm("address")
	if address == "" {
		street := c.PostForm("street")
		city := c.PostForm("city")
		state := c.PostForm("state")
		zip := c.PostForm("zip")
		country := c.PostForm("country")
		if street != "" {
			address = fmt.Sprintf("%s, %s, %s, %s, %s", street, city, state, zip, country)
		}
	}

	// Handle Document Uploads
	uploadDoc := func(fieldName string) string {
		file, _, err := c.Request.FormFile(fieldName)
		if err == nil {
			defer file.Close()
			filename := fmt.Sprintf("%s_%d_%d", fieldName, userID, time.Now().Unix())
			url, uploadErr := utils.UploadImage(file, filename)
			if uploadErr == nil {
				return url
			}
		}
		return ""
	}

	// Create seller profile
	profile := models.SellerProfile{
		UserID:          userID,
		StoreName:       c.PostForm("business_name"),
		BusinessType:    c.PostForm("business_type"),
		Description:     c.PostForm("description"),
		Address:         address,
		TaxID:           c.PostForm("tax_id"),
		Phone:           c.PostForm("phone"),
		Email:           c.PostForm("email"),
		AccountNumber:   c.PostForm("account_number"),
		RoutingNumber:   c.PostForm("routing_number"),
		AccountHolder:   c.PostForm("account_holder_name"),
		BusinessLicense: uploadDoc("business_license"),
		TaxDocument:     uploadDoc("tax_document"),
		IDDocument:      uploadDoc("id_document"),
		Status:          "pending",
	}

	// Fallback for store_name if business_name is missing
	if profile.StoreName == "" {
		profile.StoreName = c.PostForm("store_name")
	}

	if err := models.CreateSellerProfile(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create seller profile"})
		return
	}

	// Optionally upgrade role immediately or wait for approval?
	// The current logic upgrades immediately.
	if err := models.UpdateUserRole(fmt.Sprint(userID), "seller"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade user role"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Seller application submitted successfully", "profile": profile})
}

func GetSellerApplicationStatus(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uint(userIDVal.(float64))

	profile, err := models.GetSellerProfileByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No application found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"application": profile})
}

func GetMySellerProfile(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	profile, err := models.GetSellerProfileByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Seller profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profile})
}

func UpdateMySellerProfile(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	profile, err := models.GetSellerProfileByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Seller profile not found"})
		return
	}

	// Using MultipartForm to allow partial updates with file uploads
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	if val := c.PostForm("store_name"); val != "" {
		profile.StoreName = val
	}
	if val := c.PostForm("description"); val != "" {
		profile.Description = val
	}
	if val := c.PostForm("address"); val != "" {
		profile.Address = val
	}
	if val := c.PostForm("phone"); val != "" {
		profile.Phone = val
	}
	if val := c.PostForm("email"); val != "" {
		profile.Email = val
	}

	// Handle optional uploads
	file, _, err := c.Request.FormFile("store_logo")
	if err == nil {
		defer file.Close()
		url, uploadErr := utils.UploadImage(file, fmt.Sprintf("logo_%d_%d", userID, time.Now().Unix()))
		if uploadErr == nil {
			profile.StoreLogo = url
		}
	}

	bannerFile, _, err := c.Request.FormFile("store_banner")
	if err == nil {
		defer bannerFile.Close()
		url, uploadErr := utils.UploadImage(bannerFile, fmt.Sprintf("banner_%d_%d", userID, time.Now().Unix()))
		if uploadErr == nil {
			profile.StoreBanner = url
		}
	}

	if err := models.UpdateSellerProfile(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "profile": profile})
}

func GetSellerDashboardStats(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	profile, err := models.GetSellerProfileByUserID(userID)
	if err != nil {
		// Return default empty stats instead of 404 to prevent dashboard crash
		c.JSON(http.StatusOK, gin.H{
			"stats": gin.H{
				"total_sales":           0,
				"rating":                0,
				"is_verified":           false,
				"completion_percentage": 0,
			},
		})
		return
	}

	completionPercentage := 50 // Base points for having registered
	if profile.StoreLogo != "" {
		completionPercentage += 15
	}
	if profile.StoreBanner != "" {
		completionPercentage += 15
	}
	if profile.Description != "" {
		completionPercentage += 20
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_sales":           profile.TotalSales,
			"rating":                profile.Rating,
			"is_verified":           profile.IsVerified,
			"completion_percentage": completionPercentage,
		},
	})
}

func GetPublicSellers(c *gin.Context) {
	sellers, err := models.GetPublicSellers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sellers"})
		return
	}

	// Create a sanitized response list to hide tax_id and license mapping from public view
	var publicResponse []gin.H
	for _, seller := range sellers {
		publicResponse = append(publicResponse, gin.H{
			"id":          seller.ID,
			"store_name":  seller.StoreName,
			"store_logo":  seller.StoreLogo,
			"description": seller.Description,
			"rating":      seller.Rating,
			"total_sales": seller.TotalSales,
			"is_verified": seller.IsVerified,
		})
	}

	c.JSON(http.StatusOK, gin.H{"sellers": publicResponse})
}

func GetSellerProducts(c *gin.Context) {
	sellerProfileID := c.Param("id")

	// Fetch the seller profile
	var profile models.SellerProfile
	if err := config.DB.First(&profile, sellerProfileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Seller not found"})
		return
	}

	// Fetch all active and approved products belonging to this seller
	var products []models.Product
	err := config.DB.Preload("Images").
		Where("seller_id = ? AND is_active = ? AND is_approved = ?", profile.UserID, true, true).
		Order("created_at desc").
		Find(&products).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch seller products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"seller": gin.H{
			"id":           profile.ID,
			"user_id":      profile.UserID,
			"store_name":   profile.StoreName,
			"store_logo":   profile.StoreLogo,
			"store_banner": profile.StoreBanner,
			"description":  profile.Description,
			"rating":       profile.Rating,
			"total_sales":  profile.TotalSales,
			"is_verified":  profile.IsVerified,
		},
		"products": products,
		"count":    len(products),
	})
}

