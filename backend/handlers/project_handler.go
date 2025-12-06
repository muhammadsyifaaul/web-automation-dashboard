package handlers

import (
	"context"
	"time"

	"web-automation-dashboard/database"
	"web-automation-dashboard/models"
	"web-automation-dashboard/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetProjects returns all projects
func GetProjects(c *fiber.Ctx) error {
	var projects []models.Project
	cursor, err := database.Collection.Database().Collection("projects").Find(context.Background(), bson.M{})
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer cursor.Close(context.Background())
	if err = cursor.All(context.Background(), &projects); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	return utils.SendSuccess(c, projects)
}

// GetProject returns a single project by ID
func GetProject(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Project ID")
	}

	var project models.Project
	err = database.Collection.Database().Collection("projects").FindOne(context.Background(), bson.M{"_id": objID}).Decode(&project)
	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, "Project not found")
	}
	return utils.SendSuccess(c, project)
}

// GetProjectResults returns results for a specific project
func GetProjectResults(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Project ID")
	}

	var results = []models.Result{} // Initialize empty slice
	// Find results where projectId == id
	cursor, err := database.Collection.Database().Collection("results").Find(context.Background(), bson.M{"projectId": objID})
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer cursor.Close(context.Background())
	if err = cursor.All(context.Background(), &results); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	return utils.SendSuccess(c, results)
}

// CreateProject adds a new project
func CreateProject(c *fiber.Ctx) error {
	var project models.Project
	if err := c.BodyParser(&project); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid input")
	}

	project.ID = primitive.NewObjectID()
	project.CreatedAt = time.Now()
	project.UpdatedAt = time.Now()

	_, err := database.Collection.Database().Collection("projects").InsertOne(context.Background(), project)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to create project")
	}

	return utils.SendSuccess(c, project)
}
