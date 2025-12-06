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
	projects := []models.Project{
		{
			Name:    "Practice Test Login",
			BaseURL: "https://practicetestautomation.com/practice-test-login/",
		},
		{
			Name:    "The-Internet Login",
			BaseURL: "https://the-internet.herokuapp.com/login",
		},
	}

	for _, p := range projects {
		var existing models.Project
		err := Collection.Database().Collection("projects").FindOne(context.Background(), bson.M{"name": p.Name}).Decode(&existing)
		if err == nil {
			log.Printf("Project '%s' already exists\n", p.Name)
			continue
		}

		p.ID = primitive.NewObjectID()
		p.CreatedAt = time.Now()
		p.UpdatedAt = time.Now()

		_, err = Collection.Database().Collection("projects").InsertOne(context.Background(), p)
		if err != nil {
			log.Printf("Failed to seed project '%s': %v\n", p.Name, err)
		} else {
			log.Printf("Seeded project: %s\n", p.Name)
		}
	}
}
