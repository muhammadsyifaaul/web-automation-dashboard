package routes

import (
	"web-automation-dashboard/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/save-result", handlers.SaveResult)
	api.Get("/results", handlers.GetResults)
	api.Get("/results/daily", handlers.GetDailyResults)
	api.Get("/stats", handlers.GetStats)

	// Projects
	api.Get("/projects", handlers.GetProjects)
	api.Get("/projects/:id", handlers.GetProject)
	api.Get("/projects/:id/results", handlers.GetProjectResults)
	api.Get("/projects/:id/tests", handlers.GetProjectTests)

	// Case Management
	api.Get("/projects/:id/cases", handlers.GetProjectCases)
	api.Post("/projects/:id/cases", handlers.CreateProjectCase)
	api.Put("/cases/:caseId", handlers.UpdateProjectCase)
	api.Delete("/cases/:caseId", handlers.DeleteProjectCase) // Can also be /projects/:id/cases/:caseId if we want stricter path

	api.Post("/projects", handlers.CreateProject)

	// Job Queue
	api.Post("/queue-job", handlers.QueueJob)
	api.Get("/jobs/next", handlers.GetNextJob)
	api.Post("/jobs/update-status", handlers.UpdateJobStatus)
	api.Delete("/jobs/queue", handlers.ClearQueue)

	// Worker Heartbeat
	api.Post("/worker-heartbeat", handlers.RecordHeartbeat)
	api.Get("/worker-status", handlers.GetWorkerStatus)

	// Legacy endpoint (now queues job)
	api.Post("/run-test", handlers.QueueJob)
}
