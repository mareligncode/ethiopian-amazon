package controllers

import (
	"amazon-clone/config"
	"amazon-clone/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetCatalog returns products with support for search and filters
func GetCatalog(c *gin.Context) {
	var products []models.Product
	query := config.DB.Preload("Images").Preload("Category")

	// 1. Keyword Search
	if q := c.Query("q"); q != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+q+"%", "%"+q+"%")
	}

	// 2. Category Filter
	if cat := c.Query("category"); cat != "" {
		// Try parsing as integer ID first
		if _, err := strconv.Atoi(cat); err == nil {
			query = query.Where("category_id = ?", cat)
		} else {
			// Otherwise match by category name
			query = query.Where("category_id IN (SELECT id FROM categories WHERE name = ?)", cat)
		}
	}

	// 3. Price Filter
	if min := c.Query("minPrice"); min != "" {
		query = query.Where("price >= ?", min)
	}
	if max := c.Query("maxPrice"); max != "" {
		query = query.Where("price <= ?", max)
	}

	// 4. Sorting
	sort := c.DefaultQuery("sort", "created_at desc")
	query = query.Order(sort)

	err := query.Find(&products).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product catalog", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products, "count": len(products)})
}

// GetProductDetails returns a single product with full preloads for the PDP
func GetProductDetails(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	err := config.DB.Preload("Images").Preload("Category").Preload("Seller").Preload("Reviews").First(&product, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

// GetRelatedProducts returns 10 products from the same category as the given product
func GetRelatedProducts(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var related []models.Product
	err := config.DB.Preload("Images").
		Where("category_id = ? AND id != ?", product.CategoryID, product.ID).
		Limit(10).
		Find(&related).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch related products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": related})
}
