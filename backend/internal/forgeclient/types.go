package forgeclient

import (
   "context"
)

// Txt2ImgRequest defines parameters for a text-to-image generation request.
type Txt2ImgRequest struct {
   Prompt         string  `json:"prompt"`
   NegativePrompt string  `json:"negative_prompt,omitempty"`
   Steps          int     `json:"steps,omitempty"`
   CFGScale       float32 `json:"cfg_scale,omitempty"`
   Width          int     `json:"width,omitempty"`
   Height         int     `json:"height,omitempty"`
   Seed           *int    `json:"seed,omitempty"`
}

// Img2ImgRequest defines parameters for an image-to-image (inpainting) request.
type Img2ImgRequest struct {
   InitImages        []string `json:"init_images"`
   Mask              string   `json:"mask,omitempty"`
   Prompt            string   `json:"prompt"`
   NegativePrompt    string   `json:"negative_prompt,omitempty"`
   Steps             int      `json:"steps,omitempty"`
   CFGScale          float32  `json:"cfg_scale,omitempty"`
   DenoisingStrength float32  `json:"denoising_strength,omitempty"`
}

// ImageResponse represents a response from an image generation or editing call.
type ImageResponse struct {
   Images     []string               `json:"images"`
   Parameters map[string]interface{} `json:"parameters"`
   Info       string                 `json:"info"`
}

// ProgressResponse represents progress information from the server.
type ProgressResponse struct {
   CurrentImage string  `json:"current_image"`
   Progress     float32 `json:"progress"`
   ETA          float32 `json:"eta_relative"`
}

// Client defines the interface for communicating with an SD-Forge server.
type Client interface {
   Txt2Img(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error)
   Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error)
   Progress(ctx context.Context, skipCurrent bool) (*ProgressResponse, error)
}