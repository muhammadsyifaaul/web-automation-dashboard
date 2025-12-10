package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var DB *mongo.Database
var Collection *mongo.Collection

func Connect() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("MONGO_URI is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	// Ping
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal(err)
	}

	Client = client
	DB = client.Database("automation_dashboard")
	Collection = DB.Collection("results")
	log.Println("Connected to MongoDB Atlas")
}
