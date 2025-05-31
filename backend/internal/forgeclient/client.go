package forgeclient

import (
   "context"
)

// RealClient is the production implementation of Client that calls an SD-Forge server.
type RealClient struct {
   baseURL string
}

// NewClient returns a new RealClient targeting the given baseURL.
func NewClient(baseURL string) Client {
   return &RealClient{baseURL: baseURL}
}

// Txt2Img sends a text-to-image request to the SD-Forge server.
func (c *RealClient) Txt2Img(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error) {
   // TODO: implement HTTP POST to /sdapi/v1/txt2img
   panic("forgeclient: Txt2Img not implemented")
}

// Img2Img sends an image-to-image (inpainting) request to the SD-Forge server.
func (c *RealClient) Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error) {
   // TODO: implement HTTP POST to /sdapi/v1/img2img
   panic("forgeclient: Img2Img not implemented")
}

// Progress retrieves the current queue progress from the SD-Forge server.
func (c *RealClient) Progress(ctx context.Context, skipCurrent bool) (*ProgressResponse, error) {
   // TODO: implement HTTP GET to /sdapi/v1/progress
   panic("forgeclient: Progress not implemented")
}