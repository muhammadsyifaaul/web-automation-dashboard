package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Result struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ProjectID        primitive.ObjectID `json:"projectId" bson:"projectId"` // Link to Project
	TestName         string             `json:"testName" bson:"testName"`
	Status           string             `json:"status" bson:"status"` // PASS, FAIL
	Message          string             `json:"message" bson:"message"`
	Duration         float64            `json:"duration" bson:"duration"` // Seconds
	Timestamp        time.Time          `json:"timestamp" bson:"timestamp"`
	ScreenshotBase64 string             `json:"screenshotBase64" bson:"screenshotBase64"`
	ErrorStack       string             `json:"errorStack" bson:"errorStack"`
	Browser          string             `json:"browser" bson:"browser"`
	Environment      string             `json:"environment" bson:"environment"` // local, production
}
