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
// Extras calls single-image extra operations on SD-Forge.
func (c *RealClient) Extras(ctx context.Context, operation, image string) (*ImageResponse, error) {
   // TODO: implement HTTP POST to /sdapi/v1/extra-single-image
   panic("forgeclient: Extras not implemented")
}

// ExtrasBatch calls batch extra operations on SD-Forge.
func (c *RealClient) ExtrasBatch(ctx context.Context, operations []string, images []string) ([]ImageResponse, error) {
   // TODO: implement HTTP POST to /sdapi/v1/extra-batch-images
   panic("forgeclient: ExtrasBatch not implemented")
}

// Models retrieves available models from SD-Forge.
func (c *RealClient) Models(ctx context.Context) ([]ModelInfo, error) {
   // TODO: implement GET /sdapi/v1/sd-models
   panic("forgeclient: Models not implemented")
}

// SwitchModel instructs SD-Forge to switch to a checkpoint.
func (c *RealClient) SwitchModel(ctx context.Context, model string) error {
   // TODO: implement POST /sdapi/v1/unload-checkpoint + /sdapi/v1/reload-checkpoint
   panic("forgeclient: SwitchModel not implemented")
}

// Loras retrieves available hypernetworks from SD-Forge.
func (c *RealClient) Loras(ctx context.Context) ([]LoraInfo, error) {
   // TODO: implement GET /sdapi/v1/hypernetworks
   panic("forgeclient: Loras not implemented")
}

// Ping checks health of SD-Forge.
func (c *RealClient) Ping(ctx context.Context) error {
   // TODO: implement GET /internal/ping
   panic("forgeclient: Ping not implemented")
}

// History retrieves history entries for an image.
func (c *RealClient) History(ctx context.Context, imageID string) ([]HistoryEntry, error) {
   // TODO: implement or proxy to storage
   panic("forgeclient: History not implemented")
}