package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

var lastHeartbeat time.Time

// RecordHeartbeat updates the last seen time of the worker
func RecordHeartbeat(c *fiber.Ctx) error {
	lastHeartbeat = time.Now()
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Heartbeat acknowledged",
	})
}

// GetWorkerStatus checks if the worker is active (seen in last 15s)
func GetWorkerStatus(c *fiber.Ctx) error {
	isOnline := time.Since(lastHeartbeat) < 15*time.Second
	return c.JSON(fiber.Map{
		"online":   isOnline,
		"lastSeen": lastHeartbeat,
	})
}
