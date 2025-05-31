 # Region-Based Editing Integration Plan
 
 This document outlines a pure-Go approach to integrate region-based inpainting/editing using a running Stable-Diffusion-WebUI-Forge server.
 
 ## 1. Configuration
 - Define an environment variable `FORGE_SERVER_URL`, e.g. in `docker-compose.yml`:
   ```yaml
   services:
     backend:
       environment:
         - FORGE_SERVER_URL=http://stable-diffusion:7860
   ```
 - In Go, read:
   ```go
   forgeURL := os.Getenv("FORGE_SERVER_URL")
   if forgeURL == "" {
       forgeURL = "http://localhost:7860"
   }
   ```
 
 ## 2. Go `forgeclient` Package
 Implement HTTP client wrappers for the existing SD-Forge JSON API:
 
 ```go
 type Txt2ImgRequest struct {
     Prompt         string  `json:"prompt"`
     NegativePrompt string  `json:"negative_prompt,omitempty"`
     Steps          int     `json:"steps,omitempty"`
     CFGScale       float32 `json:"cfg_scale,omitempty"`
     Width, Height  int     `json:"width,omitempty" json:"height,omitempty"`
     Seed           *int    `json:"seed,omitempty"`
 }
 
 type ImageResponse struct {
     Images     []string               `json:"images"`
     Parameters map[string]interface{} `json:"parameters"`
     Info       string                 `json:"info"`
 }
 
 func (c *Client) Txt2Img(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error) { /* POST /sdapi/v1/txt2img */ }
 func (c *Client) Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error) { /* POST /sdapi/v1/img2img */ }
 func (c *Client) Progress(ctx context.Context, skip bool) (*ProgressResponse, error) { /* GET /sdapi/v1/progress */ }
 ```
 
 ## 3. New `/api/v1/regions` Endpoint
 Add a Gin handler for region-based edits:
 
 ```go
 // Request carries the base64 image and list of rects+prompts
 type RegionEditRequest struct {
     Image             string     `json:"image"`
     Regions           []Region   `json:"regions"`
     Steps             int        `json:"steps"`
     CFGScale          float32    `json:"cfg_scale"`
     DenoisingStrength float32    `json:"denoising_strength,omitempty"`
 }
 
 // Handler pseudocode:
 func RegionEdit(c *gin.Context) {
     var req RegionEditRequest
     c.BindJSON(&req)
     canvas := decodeBase64PNG(req.Image)
     for _, r := range req.Regions {
         mask := makeBinaryMask(canvas.Bounds(), r)
         resp, err := fc.Img2Img(ctx, &forgeclient.Img2ImgRequest{
             InitImages:        []string{encodePNGToBase64(canvas)},
             Mask:              encodePNGToBase64(mask),
             Prompt:            r.Prompt,
             DenoisingStrength: req.DenoisingStrength,
             Steps:             req.Steps,
             CFGScale:          req.CFGScale,
         })
         if err != nil {
             c.AbortWithError(http.StatusBadGateway, err)
             return
         }
         canvas = decodeBase64PNG(resp.Images[0])
     }
     finalB64 := encodePNGToBase64(canvas)
     c.JSON(http.StatusOK, ImageResponse{Images: []string{finalB64}})
 }
 ```
 
 ## 4. Progress Polling
 - Expose `GET /api/v1/progress?skip_current_image=<bool>` in Go that forwards to SD-Forge’s `/sdapi/v1/progress`.
 - UI can poll once per second and display `current_image` base64 as a live preview.
 
 ## 5. UI Contract
 - **New Image**: `POST /api/v1/txt2img` with prompt fields.
 - **In-place Edit**: `POST /api/v1/img2img` with `init_images` and optional `mask`.
 - **Region Edit**: `POST /api/v1/regions` carrying simple `(x,y,w,h,prompt)` list.
 - **Progress**: `GET /api/v1/progress` returning JSON with `current_image`, `progress`, `eta_relative`, etc.
 
 ## 6. Implementation Steps
 1. Wire `FORGE_SERVER_URL` into Go service.
 2. Implement `forgeclient` methods and test against a running Forge container.
 3. Add Gin routes for txt2img, img2img, regions, progress.
 4. Write Go helpers for mask creation and image compositing.
 5. Update the React UI to call new endpoints and handle base64 images and progress polling.
 
 This plan allows a zero-Python solution, leveraging only the existing SD-Forge JSON API.