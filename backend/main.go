package main

import (
	"image-processor-backend/internal/api"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// SetImageDir configures the base directory for images (used in tests).
func SetImageDir(dir string) {
	api.SetImageDir(dir)
}

// SetupRouter returns the HTTP router with all routes configured.
func SetupRouter() *gin.Engine {
	return api.SetupRouter()
}

// Type aliases re-exported for tests.
type ImageResponse = api.ImageResponse
type ReorderRequest = api.ReorderRequest
type ReorderResponse = api.ReorderResponse

func main() {
	rand.Seed(time.Now().UnixNano())
	imageDir := os.Getenv("IMAGE_DIR")
	if imageDir == "" {
		imageDir = "images"
	}
	if err := os.MkdirAll(imageDir, 0755); err != nil {
		log.Fatalf("Could not create image dir: %v", err)
	}
	api.SetImageDir(imageDir)
	if err := api.StartWatcher(imageDir); err != nil {
		log.Println("Warning: file watcher not started:", err)
	}
	r := api.SetupRouter()
	// Determine host and port for the HTTP server
	host := os.Getenv("SERVER_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "5700"
	}
	addr := host + ":" + port
	log.Printf("Server running on %s", addr)
	// Start the server on the configured address
	r.Run(addr)
}
