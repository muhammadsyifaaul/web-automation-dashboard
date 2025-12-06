package scheduler

import (
	"context"
	"log"
	"time"

	"web-automation-dashboard/database"
	"web-automation-dashboard/models"

	"github.com/robfig/cron/v3"
)

func StartCron() {
	c := cron.New()

	// Schedule: Every day at 18:00
	_, err := c.AddFunc("0 18 * * *", func() {
		log.Println("Scheduler: Queueing daily automation job...")
		queueJob()
	})

	if err != nil {
		log.Fatalf("Error adding cron job: %v", err)
	}

	c.Start()
	log.Println("Scheduler initialized. Jobs will be queued daily at 18:00.")
}

func queueJob() {
	job := models.Job{
		Type:      "FullSuite",
		Status:    models.StatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := database.Collection.Database().Collection("jobs").InsertOne(context.Background(), job)
	if err != nil {
		log.Printf("Scheduler Error: Failed to queue job: %v", err)
	} else {
		log.Printf("Scheduler: Job queued successfully.")
	}
}
