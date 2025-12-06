package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type JobStatus string

const (
	StatusPending    JobStatus = "Pending"
	StatusProcessing JobStatus = "Processing"
	StatusCompleted  JobStatus = "Completed"
	StatusFailed     JobStatus = "Failed"
)

type Job struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Type      string             `json:"type" bson:"type"` // e.g., "FullSuite", "LoginTest"
	Status    JobStatus          `json:"status" bson:"status"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
	ResultID  primitive.ObjectID `json:"resultId,omitempty" bson:"resultId,omitempty"` // Link to Result if completed
}
