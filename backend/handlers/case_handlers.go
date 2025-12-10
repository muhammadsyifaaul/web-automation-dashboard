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

func GetProjectCases(c *fiber.Ctx) error {
	projectIDParam := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDParam)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Project ID")
	}

	collection := database.DB.Collection("cases")
	cursor, err := collection.Find(context.Background(), bson.M{"projectId": projectID})
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Error fetching cases")
	}
	defer cursor.Close(context.Background())

	var cases []models.ProjectCase = []models.ProjectCase{}
	if err = cursor.All(context.Background(), &cases); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Error parsing cases")
	}

	return utils.SendSuccess(c, cases)
}

func CreateProjectCase(c *fiber.Ctx) error {
	projectIDParam := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDParam)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Project ID")
	}

	var req struct {
		Name        string `json:"name"`
		Identifier  string `json:"identifier"`
		Description string `json:"description"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid body")
	}

	newCase := models.ProjectCase{
		ID:          primitive.NewObjectID(),
		ProjectID:   projectID,
		Name:        req.Name,
		Identifier:  req.Identifier,
		Description: req.Description,
		CreatedAt:   time.Now(),
	}

	collection := database.DB.Collection("cases")
	_, err = collection.InsertOne(context.Background(), newCase)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Error creating case")
	}

	return utils.SendSuccess(c, newCase)
}

func DeleteProjectCase(c *fiber.Ctx) error {
	caseIDParam := c.Params("caseId")
	caseID, err := primitive.ObjectIDFromHex(caseIDParam)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Case ID")
	}

	collection := database.DB.Collection("cases")
	res, err := collection.DeleteOne(context.Background(), bson.M{"_id": caseID})
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Error deleting case")
	}

	if res.DeletedCount == 0 {
		return utils.SendError(c, fiber.StatusNotFound, "Case not found")
	}

	return utils.SendSuccess(c, fiber.Map{"deleted": true})
}
