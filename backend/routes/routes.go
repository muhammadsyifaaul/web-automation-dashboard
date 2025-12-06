package routes

import (
	"web-automation-dashboard/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/save-result", handlers.SaveResult)
	api.Get("/results", handlers.GetResults)
	api.Get("/stats", handlers.GetStats)

	// Job Queue
	api.Post("/queue-job", handlers.QueueJob)
	api.Get("/jobs/next", handlers.GetNextJob)
	api.Post("/jobs/update-status", handlers.UpdateJobStatus)

	// Legacy endpoint (now queues job)
	api.Post("/run-test", handlers.QueueJob)
}
