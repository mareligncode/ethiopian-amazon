package models

import "amazon-clone/config"

func GetUsers(role string) ([]User, error) {
	var users []User
	query := config.DB.Model(&User{})
	if role != "" {
		query = query.Where("role = ?", role)
	}
	// Ensuring we explicitly ignore is_deleted users although GORM deletedAt helps
	query = query.Where("is_deleted = ?", false)
	err := query.Find(&users).Error
	return users, err
}

func GetUserByID(id string) (User, error) {
	var user User
	err := config.DB.First(&user, id).Error
	return user, err
}

func UpdateUserRole(id string, role string) error {
	return config.DB.Model(&User{}).Where("id = ?", id).Update("role", role).Error
}

func UpdateUserStatus(id string, isActive bool) error {
	return config.DB.Model(&User{}).Where("id = ?", id).Update("is_active", isActive).Error
}

func DeleteUser(id string) error {
	// First natively tag the IsDeleted flag
	if err := config.DB.Model(&User{}).Where("id = ?", id).Update("is_deleted", true).Error; err != nil {
		return err
	}
	// Then process native GORM soft deletions seamlessly
	return config.DB.Delete(&User{}, id).Error
}

func CreateUserWithRole(user *User) error {
	return config.DB.Create(user).Error
}
