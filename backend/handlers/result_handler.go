package handlers

import (
	"context"
	"log"
	"os"
	"os/exec"
	"time"

	"web-automation-dashboard/database"
	"web-automation-dashboard/models"
	"web-automation-dashboard/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SaveResult(c *fiber.Ctx) error {
	var result models.Result
	if err := c.BodyParser(&result); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	result.Timestamp = time.Now()

	_, err := database.Collection.InsertOne(context.Background(), result)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to save result")
	}

	return utils.SendSuccess(c, "Result saved successfully")
}

func GetResults(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(50)
	cursor, err := database.Collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	var results []models.Result
	if err = cursor.All(ctx, &results); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, results)
}

func RunTest(c *fiber.Ctx) error {
	enableLocal := os.Getenv("ENABLE_LOCAL_RUN_TEST")
	appEnv := os.Getenv("APP_ENV")

	// Allow if explicitly enabled OR if we are in development mode
	if enableLocal != "true" && appEnv != "development" {
		return utils.SendError(c, fiber.StatusForbidden, "Local execution is disabled in this environment")
	}

	// Execute python script asynchronously
	go func() {
		cmd := exec.Command("python", "../automation/local_runner.py")
		// In a real app, you might want to capture output or manage the process better
		err := cmd.Run()
		if err != nil {
			log.Printf("Error running automation: %v", err)
		}
	}()

	return utils.SendSuccess(c, "Test execution triggered locally")
}
