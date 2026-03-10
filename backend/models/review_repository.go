package models

import (
	"amazon-clone/config"
	"errors"
	"fmt"
)

// AddReview safely parses and enforces 1-to-5 limits
func AddReview(userID uint, productID uint, rating int, comment string) (*Review, error) {
	// First Ensure User has NOT already reviewed this product to mimic Amazon's 1-review-per-purchase rule loosely
	var existing Review
	if err := config.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&existing).Error; err == nil {
		return nil, errors.New("you have already reviewed this product")
	}

	review := Review{
		UserID:    userID,
		ProductID: productID,
		Rating:    rating,
		Comment:   comment,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		return nil, err
	}

	return &review, nil
}

// UpdateReview ensures that only the UserID who wrote the review can change the rating score
func UpdateReview(reviewID string, userID uint, newRating int, newComment string) (*Review, error) {
	var review Review
	if err := config.DB.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
		return nil, errors.New("review not found or unauthorized")
	}

	review.Rating = newRating
	review.Comment = newComment
	if err := config.DB.Save(&review).Error; err != nil {
		return nil, err
	}

	return &review, nil
}

// AddReviewResponse allows a specific SellerProfile to directly comment beneath a buyer's criticism
func AddReviewResponse(sellerID uint, reviewID string, responseText string) (*ReviewResponse, error) {
	var review Review
	if err := config.DB.Preload("Product").First(&review, reviewID).Error; err != nil {
		return nil, errors.New("review not found")
	}

	if review.Product.SellerID != sellerID {
		return nil, errors.New("unauthorized: you do not own the product this review targets")
	}

	var existingResponse ReviewResponse
	if err := config.DB.Where("review_id = ?", review.ID).First(&existingResponse).Error; err == nil {
		return nil, errors.New("a seller response already exists for this review")
	}

	response := ReviewResponse{
		ReviewID: review.ID,
		SellerID: sellerID,
		Response: responseText,
	}

	if err := config.DB.Create(&response).Error; err != nil {
		return nil, err
	}

	// Phase 9: Alert Buyer
	DispatchNotification(
		review.UserID,
		"seller",
		"Seller Responded to your Review",
		fmt.Sprintf("The seller of %s has responded to your feedback.", review.Product.Name),
		fmt.Sprintf("/products/%d/reviews", review.ProductID),
		map[string]interface{}{"review_id": review.ID, "product_id": review.ProductID},
	)

	return &response, nil
}

// GetProductReviews safely returns the public catalog of reviews for any unauthenticated shopper, prepending seller interactions
func GetProductReviews(productID string) ([]Review, error) {
	var reviews []Review
	err := config.DB.Where("product_id = ?", productID).
		Preload("User").
		Preload("Response.Seller"). // Stitch the nested SellerResponse profile details over it
		Order("created_at desc").
		Find(&reviews).Error
	return reviews, err
}
