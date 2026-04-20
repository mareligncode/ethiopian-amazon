package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in context"})
			c.Abort()
			return
		}

		userRoleStr, ok := role.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid role type"})
			c.Abort()
			return
		}


		for _, allowedRole := range allowedRoles {
			if userRoleStr == allowedRole {
				return
			}
		}

		fmt.Printf("ROLE_DENIED: User Role '%s' not in allowed list %v\n", userRoleStr, allowedRoles)
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		c.Abort()
	}
}

func RequireBuyer() gin.HandlerFunc {
	return RequireRole("buyer", "admin")
}

func RequireSeller() gin.HandlerFunc {
	return RequireRole("seller", "admin")
}

func RequireDelivery() gin.HandlerFunc {
	return RequireRole("delivery")
}

func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin")
}
