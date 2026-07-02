package controllers

import (
	"net/http"
	"strconv"

	"amazon-clone/models"
	"amazon-clone/utils"

	"github.com/gin-gonic/gin"
)

func AdminGetUsers(c *gin.Context) {
	role := c.Query("role")

	users, err := models.GetUsers(role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func AdminCreateUser(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role" binding:"required,oneof=buyer seller delivery admin"`
		Phone    string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  hashedPassword,
		Role:      input.Role,
		Phone:     input.Phone,
		IsActive:  true,
		IsDeleted: false,
	}

	if err := models.CreateUserWithRole(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	}})
}

func AdminChangeUserRole(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Role string `json:"role" binding:"required,oneof=buyer seller delivery admin"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.UpdateUserRole(id, input.Role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

func AdminActivateUser(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		IsActive *bool `json:"is_active" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.UpdateUserStatus(id, *input.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	status := "deactivated"
	if *input.IsActive {
		status = "activated"
	}

	c.JSON(http.StatusOK, gin.H{"message": "User " + status + " successfully"})
}

func AdminDeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := models.DeleteUser(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func AdminVerifySeller(c *gin.Context) {
	sellerID := c.Param("id")

	var input struct {
		IsVerified *bool `json:"is_verified" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := models.GetSellerProfileByID(sellerID)
	if err != nil {
		// Fallback: search by user ID
		if uID, parseErr := strconv.ParseUint(sellerID, 10, 32); parseErr == nil {
			profile, err = models.GetSellerProfileByUserID(uint(uID))
		}
	}
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Seller profile not found"})
		return
	}

	profile.IsVerified = *input.IsVerified
	if *input.IsVerified {
		profile.Status = "approved"
	} else {
		profile.Status = "rejected"
	}

	if err := models.UpdateSellerProfile(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update seller verification status"})
		return
	}

	status := "unverified"
	if *input.IsVerified {
		status = "verified"
	}

	c.JSON(http.StatusOK, gin.H{"message": "Seller " + status + " successfully"})
}
