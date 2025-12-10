package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectCase struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ProjectID   primitive.ObjectID `json:"projectId" bson:"projectId"`
	Name        string             `json:"name" bson:"name"`
	Identifier  string             `json:"identifier" bson:"identifier"` // e.g. "/add", "/login"
	Description string             `json:"description" bson:"description"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
}
