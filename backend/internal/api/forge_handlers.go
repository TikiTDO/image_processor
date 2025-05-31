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