package api

import (
   "net/http"

   "image-processor-backend/internal/forgeclient"
   "github.com/gin-gonic/gin"
)

// handleTxt2Img handles text-to-image generation via SD-Forge.
func handleTxt2Img(c *gin.Context) {
   var req forgeclient.Txt2ImgRequest
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   resp, err := ForgeSvc.Txt2Img(c.Request.Context(), &req)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, resp)
}

// handleImg2Img handles image-to-image (inpainting) requests via SD-Forge.
func handleImg2Img(c *gin.Context) {
   var req forgeclient.Img2ImgRequest
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   resp, err := ForgeSvc.Img2Img(c.Request.Context(), &req)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, resp)
}

// handleProgress retrieves the queue progress from SD-Forge.
func handleProgress(c *gin.Context) {
   skip := false
   if c.Query("skip_current_image") == "true" {
       skip = true
   }
   resp, err := ForgeSvc.Progress(c.Request.Context(), skip)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, resp)
}

// handleRegions is a stub for region-based editing via SD-Forge.
// TODO: implement region-based editing logic.
func handleRegions(c *gin.Context) {
   c.JSON(http.StatusNotImplemented, gin.H{"error": "region editing not implemented"})
}
// handleExtras applies a single-image extra operation via SD-Forge.
func handleExtras(c *gin.Context) {
   var req struct {
       Operation string `json:"operation"`
       Image     string `json:"image"`
   }
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   resp, err := ForgeSvc.Extras(c.Request.Context(), req.Operation, req.Image)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, resp)
}

// handleExtrasBatch applies batch extra operations via SD-Forge.
func handleExtrasBatch(c *gin.Context) {
   var req struct { Operations []string `json:"operations"`; Images []string `json:"images"` }
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   resp, err := ForgeSvc.ExtrasBatch(c.Request.Context(), req.Operations, req.Images)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, resp)
}

// handleGetModels returns list of available SD models.
func handleGetModels(c *gin.Context) {
   models, err := ForgeSvc.Models(c.Request.Context())
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, models)
}

// handleSwitchModel switches the SD model.
func handleSwitchModel(c *gin.Context) {
   var req struct { Model string `json:"model"` }
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   if err := ForgeSvc.SwitchModel(c.Request.Context(), req.Model); err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.Status(http.StatusNoContent)
}

// handleGetLoras returns list of available LoRAs.
func handleGetLoras(c *gin.Context) {
   loras, err := ForgeSvc.Loras(c.Request.Context())
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, loras)
}

// handlePing checks health of SD-Forge and returns 200 if reachable.
func handlePing(c *gin.Context) {
   if err := ForgeSvc.Ping(c.Request.Context()); err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// handleGetHistory retrieves previous versions for an image.
func handleGetHistory(c *gin.Context) {
   imageID := c.Query("imageID")
   if imageID == "" {
       c.JSON(http.StatusBadRequest, gin.H{"error": "missing imageID"})
       return
   }
   entries, err := ForgeSvc.History(c.Request.Context(), imageID)
   if err != nil {
       c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusOK, entries)
}