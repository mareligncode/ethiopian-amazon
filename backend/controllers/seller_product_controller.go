package controllers

import (
	"fmt"
	"net/http"

	"amazon-clone/models"
	"amazon-clone/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetMyProducts(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	products, err := models.GetProductsBySeller(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}

func CreateProduct(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	// Handle Multi-part Form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	name := c.PostForm("name")
	description := c.PostForm("description")
	categoryIDStr := c.PostForm("category_id")
	priceStr := c.PostForm("price")

	if name == "" || categoryIDStr == "" || priceStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name, category_id, and price are required"})
		return
	}

	// Safely convert strings to appropriate numeric types
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id format"})
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid price format, must be > 0"})
		return
	}

	var discountPrice *float64
	if dpStr := c.PostForm("discount_price"); dpStr != "" {
		dp, err := strconv.ParseFloat(dpStr, 64)
		if err == nil && dp < price { // Discount must be logical
			discountPrice = &dp
		}
	}

	stock := 0
	if stockStr := c.PostForm("stock"); stockStr != "" {
		if s, err := strconv.Atoi(stockStr); err == nil {
			stock = s
		}
	}

	product := models.Product{
		SellerID:      userID,
		Name:          name,
		Description:   description,
		Price:         price,
		DiscountPrice: discountPrice,
		Stock:         stock,
		CategoryID:    uint(categoryID),
		Brand:         c.PostForm("brand"),
		SKU:           c.PostForm("sku"),
		Weight:        c.PostForm("weight"),
		Dimensions:    c.PostForm("dimensions"),
		IsActive:      true,
		IsApproved:    false,
	}

	if err := models.CreateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	// Handle Image Uploads via Cloudinary
	form := c.Request.MultipartForm
	files := form.File["images"]

	var uploadedImages []models.ProductImage
	for i, file := range files {
		f, err := file.Open()
		if err != nil {
			continue // Skip bad files
		}
		defer f.Close()

		filename := fmt.Sprintf("product_%d_%d_%d", product.ID, time.Now().Unix(), i)
		url, uploadErr := utils.UploadImage(f, filename)
		if uploadErr != nil {
			fmt.Printf("Error uploading image %d for product %d: %v\n", i, product.ID, uploadErr)
			continue
		}

		if uploadErr == nil {
			isPrimary := (i == 0) // Natively tag the very first uploaded file as the primary thumbnail
			img := models.ProductImage{
				ProductID: product.ID,
				ImageURL:  url,
				IsPrimary: isPrimary,
			}
			models.CreateProductImage(&img)
			uploadedImages = append(uploadedImages, img)
		}
	}

	product.Images = uploadedImages
	c.JSON(http.StatusCreated, gin.H{"message": "Product created successfully", "product": product})
}

func UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	// Verify ownership
	product, err := models.GetProductByID(productID, &userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found or unauthorized"})
		return
	}

	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	if val := c.PostForm("name"); val != "" {
		product.Name = val
	}
	if val := c.PostForm("description"); val != "" {
		product.Description = val
	}
	if val := c.PostForm("category_id"); val != "" {
		if catID, err := strconv.ParseUint(val, 10, 32); err == nil {
			product.CategoryID = uint(catID)
		}
	}
	if val := c.PostForm("price"); val != "" {
		if p, err := strconv.ParseFloat(val, 64); err == nil && p > 0 {
			product.Price = p
		}
	}
	if val := c.PostForm("discount_price"); val != "" {
		if dp, err := strconv.ParseFloat(val, 64); err == nil && dp < product.Price {
			product.DiscountPrice = &dp
		}
	}
	if val := c.PostForm("stock"); val != "" {
		if s, err := strconv.Atoi(val); err == nil {
			product.Stock = s
		}
	}
	if val := c.PostForm("brand"); val != "" {
		product.Brand = val
	}
	if val := c.PostForm("sku"); val != "" {
		product.SKU = val
	}
	if val := c.PostForm("weight"); val != "" {
		product.Weight = val
	}
	if val := c.PostForm("dimensions"); val != "" {
		product.Dimensions = val
	}
	if val := c.PostForm("is_active"); val != "" {
		product.IsActive = (val == "true")
	}

	if err := models.UpdateProduct(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product text fields"})
		return
	}

	// Handle Optional Appended Images via Cloudinary
	form := c.Request.MultipartForm
	if files, ok := form.File["images"]; ok {
		for i, file := range files {
			f, _ := file.Open()
			defer f.Close()

			filename := fmt.Sprintf("product_%d_append_%d_%d", product.ID, time.Now().Unix(), i)
			url, uploadErr := utils.UploadImage(f, filename)

			if uploadErr == nil {
				img := models.ProductImage{
					ProductID: product.ID,
					ImageURL:  url,
					IsPrimary: false, // Appended images are not primary by default
				}
				models.CreateProductImage(&img)
			}
		}

		// Refresh product object to safely include newly appended images in the response
		product, _ = models.GetProductByID(productID, &userID)
	} else {
		// Refresh even if no new images to ensure ImageURL virtual field is updated
		product, _ = models.GetProductByID(productID, &userID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully", "product": product})
}

func DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	if err := models.DeleteProduct(productID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete product: %s", err.Error())})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func UpdateProductStock(c *gin.Context) {
	productID := c.Param("id")
	userIDVal, _ := c.Get("user_id")
	userID := uint(userIDVal.(float64))

	var input struct {
		Stock *int `json:"stock" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.UpdateProductStock(productID, userID, *input.Stock); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update stock: %s", err.Error())})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product stock updated successfully"})
}
