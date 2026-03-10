package models

import (
	"amazon-clone/config"
	"fmt"
)

func GetAllSettings() ([]SystemSetting, error) {
	var settings []SystemSetting
	err := config.DB.Find(&settings).Error
	return settings, err
}

func GetSetting(key string) (SystemSetting, error) {
	var setting SystemSetting
	err := config.DB.Where("key = ?", key).First(&setting).Error
	return setting, err
}

func UpdateSetting(key string, value string) error {
	return config.DB.Model(&SystemSetting{}).Where("key = ?", key).Update("value", value).Error
}

func InitializeSettings() {
	defaultSettings := []SystemSetting{
		{Key: "commission_rate", Value: "10", Description: "Platform commission percentage on sales", Type: "float"},
		{Key: "maintenance_mode", Value: "false", Description: "Enable/Disable platform wide maintenance mode", Type: "bool"},
		{Key: "email_notifications", Value: "true", Description: "System-wide email dispatch", Type: "bool"},
		{Key: "platform_version", Value: "1.0.0", Description: "Current system version", Type: "string"},
	}

	for _, s := range defaultSettings {
		var existing SystemSetting
		if err := config.DB.Where("key = ?", s.Key).First(&existing).Error; err != nil {
			fmt.Printf("Initializing setting: %s\n", s.Key)
			config.DB.Create(&s)
		}
	}
}
