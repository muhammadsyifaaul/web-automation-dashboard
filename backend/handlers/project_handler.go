package handlers

import (
	"context"
	"os"
	"path/filepath"
	"regexp"
	"strings"
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

// GetProjectTests lists available tests for a project by parsing the python file
func GetProjectTests(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Invalid Project ID")
	}

	// 1. Get Project Name
	var project models.Project
	err = database.Collection.Database().Collection("projects").FindOne(context.Background(), bson.M{"_id": objID}).Decode(&project)
	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, "Project not found")
	}

	// 2. Resolve Slug
	slug := strings.ToLower(project.Name)
	slug = strings.ReplaceAll(slug, " ", "_")
	slug = strings.ReplaceAll(slug, "-", "_")

	// 3. Find File
	// Assumption: Backend is running from /backend directory, so automation is at ../automation
	// Or use an env var for automation path. Using relative path for now.
	cwd, _ := os.Getwd()
	// Navigate up if we are in backend dir
	rootPath := filepath.Dir(cwd)
	if filepath.Base(cwd) != "backend" {
		// Fallback if not running from backend dir directly (e.g. running from root)
		if _, err := os.Stat(filepath.Join(cwd, "automation")); err == nil {
			rootPath = cwd
		}
	} else {
		// If in backend, root is parent
		rootPath = filepath.Dir(cwd)
	}

	testPath := filepath.Join(rootPath, "automation", "projects", slug, "tests.py")

	content, err := os.ReadFile(testPath)
	if err != nil {
		// Try fallback names if simple slug mapping fails, or return empty
		// For now return empty list usually means file not found or no tests
		return utils.SendError(c, fiber.StatusNotFound, "Test file not found: "+testPath)
	}

	// 4. Parse Regex
	// Search for `def run_...`
	re := regexp.MustCompile(`def\s+(run_\w+)\s*\(`)
	matches := re.FindAllStringSubmatch(string(content), -1)

	var tests []string
	for _, match := range matches {
		if len(match) > 1 {
			tests = append(tests, match[1])
		}
	}

	return utils.SendSuccess(c, tests)
}
