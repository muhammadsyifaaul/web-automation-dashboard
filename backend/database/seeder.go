package database

import (
	"context"
	"log"
	"time"

	"web-automation-dashboard/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Seed() {
	// Check if any projects exist
	var project models.Project
	err := Collection.Database().Collection("projects").FindOne(context.Background(), bson.M{}).Decode(&project)
	if err == nil {
		// Projects exist, skip seeding
		return
	}

	// Create Default Project
	log.Println("Seeding database with default project...")
	defaultProject := models.Project{
		ID:        primitive.NewObjectID(),
		Name:      "Demo E-Commerce",
		BaseURL:   "https://www.saucedemo.com",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = Collection.Database().Collection("projects").InsertOne(context.Background(), defaultProject)
	if err != nil {
		log.Println("Failed to seed default project:", err)
	} else {
		log.Println("Default project created successfully")
	}
}
