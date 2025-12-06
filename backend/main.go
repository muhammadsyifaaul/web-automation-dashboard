package main

import (
	"log"
	"os"

	"web-automation-dashboard/database"
	"web-automation-dashboard/routes"
	"web-automation-dashboard/scheduler"
	"web-automation-dashboard/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Env
	if err := godotenv.Load(); err != nil {
		log.Println("Info: No .env file found, relying on system env vars")
	}

	// 2. Connect Database
	database.Connect()

	// 2.1 Start Scheduler
	scheduler.StartCron()

	// 3. Setup Fiber
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		},
	})

	// 4. Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// Dynamic CORS
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*" // Default for local dev
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigin,
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// 5. Routes
	routes.SetupRoutes(app)

	// 6. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.Listen(":" + port))
}
