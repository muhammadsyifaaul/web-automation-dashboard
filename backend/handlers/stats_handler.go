package handlers

import (
	"context"
	"time"

	"web-automation-dashboard/database"
	"web-automation-dashboard/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

type Stats struct {
	Total  int64 `json:"total"`
	Passed int64 `json:"passed"`
	Failed int64 `json:"failed"`
}

func GetStats(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	total, _ := database.Collection.CountDocuments(ctx, bson.M{})
	passed, _ := database.Collection.CountDocuments(ctx, bson.M{"status": "PASS"})
	failed, _ := database.Collection.CountDocuments(ctx, bson.M{"status": "FAIL"})

	return utils.SendSuccess(c, Stats{
		Total:  total,
		Passed: passed,
		Failed: failed,
	})
}
