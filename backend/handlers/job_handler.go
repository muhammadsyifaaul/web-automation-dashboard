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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// QueueJob adds a new job to the queue
func QueueJob(c *fiber.Ctx) error {
	var body struct {
		ProjectID  string `json:"projectId"`
		Type       string `json:"type"`
		TestFilter string `json:"testFilter"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	// Default to generic if no project ID (for backward compatibility or global tasks)
	// But ideally we want a project ID.
	var projID primitive.ObjectID
	if body.ProjectID != "" {
		pid, err := primitive.ObjectIDFromHex(body.ProjectID)
		if err == nil {
			projID = pid
		}
	}

	jobType := body.Type
	if jobType == "" {
		jobType = "FullSuite"
	}

	job := models.Job{
		ProjectID:  projID,
		Type:       jobType,
		TestFilter: body.TestFilter,
		Status:     models.StatusPending,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := database.Collection.Database().Collection("jobs").InsertOne(context.Background(), job)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to queue job")
	}

	return utils.SendSuccess(c, "Job queued successfully")
}

// GetNextJob is called by the local runner poll
func GetNextJob(c *fiber.Ctx) error {
	var job models.Job

	// Find the oldest Pending job and update it to Processing atomically
	filter := bson.M{"status": models.StatusPending}
	update := bson.M{
		"$set": bson.M{
			"status":    models.StatusProcessing,
			"updatedAt": time.Now(),
		},
	}
	opts := options.FindOneAndUpdate().SetSort(bson.D{{Key: "createdAt", Value: 1}}).SetReturnDocument(options.After)

	err := database.Collection.Database().Collection("jobs").FindOneAndUpdate(context.Background(), filter, update, opts).Decode(&job)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			// No jobs available, not an error, just empty
			return c.Status(fiber.StatusNoContent).JSON(fiber.Map{"message": "No jobs pending"})
		}
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, job)
}

// UpdateJobStatus updates the status of a job (called by runner)
func UpdateJobStatus(c *fiber.Ctx) error {
	var body struct {
		ID     string           `json:"id"`
		Status models.JobStatus `json:"status"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request")
	}

	objID, _ := primitive.ObjectIDFromHex(body.ID)
	update := bson.M{
		"$set": bson.M{
			"status":    body.Status,
			"updatedAt": time.Now(),
		},
	}

	_, err := database.Collection.Database().Collection("jobs").UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to update job")
	}

	return utils.SendSuccess(c, "Job status updated")
}
