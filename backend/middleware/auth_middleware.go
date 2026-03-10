package middleware

import (
	"net/http"
	"strings"

	"amazon-clone/models"
	"amazon-clone/utils"
	"fmt"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims["user_id"])

		// DYNAMIC ROLE VALIDATION: Fetch current role from DB to handle updates without re-login
		userIDStr := fmt.Sprintf("%v", claims["user_id"])
		user, err := models.GetUserByID(userIDStr)
		if err != nil {
			fmt.Printf("AUTH_DEBUG: User %s not found in DB but has valid token\n", userIDStr)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User no longer exists"})
			c.Abort()
			return
		}

		tokenRole := claims["role"].(string)
		dbRole := user.Role

		if tokenRole != dbRole {
			fmt.Printf("AUTH_DEBUG: Role Mismatch for User %s! Token: %s, DB: %s. Using DB role.\n", userIDStr, tokenRole, dbRole)
		}

		c.Set("role", dbRole)
		c.Next()
	}
}
