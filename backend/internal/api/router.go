package api

import (
   "fmt"
   "net/http"
   "os"
   "path/filepath"

   "image-processor-backend/internal/storage"

   "github.com/gin-contrib/cors"
   "github.com/gin-gonic/gin"
)

// SetupRouter configures routes and returns a Gin engine.
func SetupRouter() *gin.Engine {
   // Migrate any legacy metadata.json in the root images directory
   if err := storage.MigrateMetadata(ImageDir); err != nil {
       fmt.Printf("Error migrating metadata for root: %v\n", err)
   }
   r := gin.Default()
   r.Use(cors.Default())
   // Default path endpoint
   r.GET("/api/path", func(c *gin.Context) {
       def := os.Getenv("DEFAULT_PATH")
       c.JSON(http.StatusOK, gin.H{"path": def})
   })
   // SSE endpoint
   r.GET("/api/updates", func(c *gin.Context) {
       c.Writer.Header().Set("Cache-Control", "no-cache")
       c.Writer.Header().Set("Connection", "keep-alive")
       c.Writer.Header().Set("Content-Type", "text/event-stream")
       ch := subscribe()
       defer unsubscribe(ch)
       c.Writer.Flush()
       for path := range ch {
           c.SSEvent("update", path)
           c.Writer.Flush()
       }
   })
   // Image upload and listing
   r.POST("/api/images", handleUpload)
   r.GET("/api/images", handleGetImages)
   // Serve image bytes by hash ID
   r.GET("/api/images/:id", handleGetImage)
   r.GET("/api/dirs", handleGetDirs)
  
   // Directory management: reinitialize filenames evenly
   r.POST("/api/dirs/reinit", handleReinit)
   r.POST("/api/images/:id/reorder", handleReorder)
  
   // Delete image endpoint
   r.DELETE("/api/images/:id", handleDeleteImage)
   // Static file serving with ETag
   r.GET("/images/*filepath", func(c *gin.Context) {
       fp := c.Param("filepath")
       fullPath := filepath.Join(ImageDir, fp)
       info, err := os.Stat(fullPath)
       if err != nil {
           c.Status(http.StatusNotFound)
           return
       }
       etag := fmt.Sprintf("\"%x-%x\"", info.ModTime().UnixNano(), info.Size())
       c.Header("ETag", etag)
       c.Header("Cache-Control", "no-cache, must-revalidate")
       if match := c.GetHeader("If-None-Match"); match != "" && match == etag {
           c.Status(http.StatusNotModified)
           return
       }
       c.File(fullPath)
   })
   // Speaker configuration endpoints
   r.GET("/api/speakers", handleGetSpeakers)
   r.POST("/api/speakers", handleSetSpeakers)
   // Dialog endpoints
   r.GET("/api/images/:id/dialog", handleGetDialog)
   r.POST("/api/images/:id/dialog", handleSetDialog)
  
   // Bulk dialog retrieval
   r.GET("/api/dialogs", handleGetAllDialogs)

   // SD-Forge integration endpoints (v1)
   v1 := r.Group("/api/v1")
   {
       v1.POST("/txt2img", handleTxt2Img)
       v1.POST("/img2img", handleImg2Img)
       v1.GET("/progress", handleProgress)
       v1.POST("/regions", handleRegions)
   }
   return r
}