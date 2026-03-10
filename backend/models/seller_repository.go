package models

import "amazon-clone/config"

func CreateSellerProfile(profile *SellerProfile) error {
	return config.DB.Create(profile).Error
}

func GetSellerProfileByUserID(userID uint) (SellerProfile, error) {
	var profile SellerProfile
	err := config.DB.Where("user_id = ?", userID).First(&profile).Error
	return profile, err
}

func UpdateSellerProfile(profile *SellerProfile) error {
	return config.DB.Save(profile).Error
}

func GetPublicSellers() ([]SellerProfile, error) {
	var sellers []SellerProfile
	// Only return verified and active sellers?
	// The prompt doesn't explicitly state 'only verified', but it's a good practice.
	// For now we return all sellers.
	err := config.DB.Find(&sellers).Error
	return sellers, err
}

func GetSellerProfileByID(id string) (SellerProfile, error) {
	var profile SellerProfile
	err := config.DB.First(&profile, id).Error
	return profile, err
}
