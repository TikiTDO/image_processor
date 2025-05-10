package main

import (
   "log"
   "math/rand"
   "os"
   "time"
   "image-processor-backend/internal/api"
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
   log.Println("Server running on :5700")
   r.Run(":5700")
}