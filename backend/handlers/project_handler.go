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

	// 2. Resolve Path
	// Priority: 1. Explicit Directory 2. Name Slug 3. URL Slug
	var potentialSlugs []string

	if project.Directory != "" {
		potentialSlugs = append(potentialSlugs, project.Directory)
	}

	// Name Slug
	nameSlug := strings.ToLower(project.Name)
	nameSlug = strings.ReplaceAll(nameSlug, " ", "_")
	nameSlug = strings.ReplaceAll(nameSlug, "-", "_")
	potentialSlugs = append(potentialSlugs, nameSlug)

	// URL Slug (e.g., https://cms-ams4u... -> ams4u_cms_...)
	// Simple heuristic: extract host, maybe first part of host
	// This is fuzzy but requested by user ("match parent url")
	if project.BaseURL != "" {
		// remove protocol
		urlClean := strings.TrimPrefix(project.BaseURL, "https://")
		urlClean = strings.TrimPrefix(urlClean, "http://")
		// remove trailing slash
		urlClean = strings.TrimSuffix(urlClean, "/")

		// If it's a subdomain like cms-ams4u-dev.qbit.co.id
		// We might want to try "cms_ams4u_dev"
		urlSlug := strings.ReplaceAll(urlClean, ".", "_")
		urlSlug = strings.ReplaceAll(urlSlug, "-", "_")
		potentialSlugs = append(potentialSlugs, urlSlug)

		// Also try just the first part if it's a subdomain
		parts := strings.Split(urlClean, ".")
		if len(parts) > 0 {
			potentialSlugs = append(potentialSlugs, strings.ReplaceAll(parts[0], "-", "_"))
		}
	}

	// Fallback hardcoding (keep existing)
	if strings.Contains(nameSlug, "ams4u") {
		potentialSlugs = append(potentialSlugs, "ams4u_cms_auto")
	}

	// 3. Find File
	cwd, _ := os.Getwd()
	rootPath := filepath.Dir(cwd)
	if filepath.Base(cwd) != "backend" {
		if _, err := os.Stat(filepath.Join(cwd, "automation")); err == nil {
			rootPath = cwd
		}
	} else {
		rootPath = filepath.Dir(cwd)
	}

	var testPath string
	found := false

	for _, slug := range potentialSlugs {
		path := filepath.Join(rootPath, "automation", "projects", slug, "tests.py")
		if _, err := os.Stat(path); err == nil {
			testPath = path
			found = true
			break
		}
	}

	if !found {
		return utils.SendError(c, fiber.StatusNotFound, "Test file not found. Checked: "+strings.Join(potentialSlugs, ", "))
	}

	content, err := os.ReadFile(testPath)
	if err != nil {
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
