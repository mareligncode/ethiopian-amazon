package models

import (
	"amazon-clone/config"
	"amazon-clone/utils"
	"encoding/json"
	"log"
)

// DispatchNotification concurrently saves an In-App Notification and fires an Email if the User exists
func DispatchNotification(userID uint, notifType string, title string, message string, actionURL string, dataPayload map[string]interface{}) {

	// 1. Pack the generic JSON data payload
	jsonData, err := json.Marshal(dataPayload)
	if err != nil {
		jsonData = []byte("{}") // Fallback
	}

	// 2. Fetch the User from DB to get their Email Address and Name
	var user User
	if err := config.DB.First(&user, userID).Error; err != nil {
		log.Printf("Failed to find user %d for notification dispatch", userID)
		return
	}

	// 3. Fire the asynchronous Email Service (Phase 9 equivalent to Nodemailer)
	utils.SendEmail(user.Email, utils.EmailData{
		RecipientName: user.Name,
		Title:         title,
		Message:       message,
		ActionURL:     actionURL,
	})

	// 4. Save the structural In-App Notification tracking
	notification := Notification{
		UserID:    userID,
		Type:      notifType,
		Title:     title,
		Message:   message,
		Data:      jsonData,
		IsRead:    false,
		EmailSent: true, // Assuming the async command fired
	}

	if err := config.DB.Create(&notification).Error; err != nil {
		log.Printf("Failed to persist In-App Notification to database: %v", err)
	}
}
