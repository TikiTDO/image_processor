package forgeclient

import (
   "bytes"
   "context"
   "encoding/json"
   "fmt"
   "io"
   "net/http"
   "strings"
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
   // prepare request JSON
   data, err := json.Marshal(req)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: marshal Txt2ImgRequest: %w", err)
   }
   // build HTTP request
   url := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/txt2img"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
   if err != nil {
       return nil, fmt.Errorf("forgeclient: new request txt2img: %w", err)
   }
   httpReq.Header.Set("Content-Type", "application/json")
   // execute
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: txt2img request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return nil, fmt.Errorf("forgeclient: txt2img status %d: %s", resp.StatusCode, string(body))
   }
   // decode response
   var out ImageResponse
   if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
       return nil, fmt.Errorf("forgeclient: decode Txt2Img response: %w", err)
   }
   return &out, nil
}

// Img2Img sends an image-to-image (inpainting) request to the SD-Forge server.
func (c *RealClient) Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error) {
   data, err := json.Marshal(req)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: marshal Img2ImgRequest: %w", err)
   }
   url := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/img2img"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
   if err != nil {
       return nil, fmt.Errorf("forgeclient: new request img2img: %w", err)
   }
   httpReq.Header.Set("Content-Type", "application/json")
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: img2img request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return nil, fmt.Errorf("forgeclient: img2img status %d: %s", resp.StatusCode, string(body))
   }
   var out ImageResponse
   if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
       return nil, fmt.Errorf("forgeclient: decode Img2Img response: %w", err)
   }
   return &out, nil
}

// Progress retrieves the current queue progress from the SD-Forge server.
func (c *RealClient) Progress(ctx context.Context, skipCurrent bool) (*ProgressResponse, error) {
   // build URL with optional skip_current_image flag
   base := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/progress"
   if skipCurrent {
       base += "?skip_current_image=true"
   }
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, base, nil)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: new request progress: %w", err)
   }
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: progress request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return nil, fmt.Errorf("forgeclient: progress status %d: %s", resp.StatusCode, string(body))
   }
   var out ProgressResponse
   if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
       return nil, fmt.Errorf("forgeclient: decode Progress response: %w", err)
   }
   return &out, nil
}
// Extras calls single-image extra operations on SD-Forge.
func (c *RealClient) Extras(ctx context.Context, operation, image string) (*ImageResponse, error) {
   return nil, fmt.Errorf("forgeclient: Extras operation not implemented")
}

// ExtrasBatch calls batch extra operations on SD-Forge.
func (c *RealClient) ExtrasBatch(ctx context.Context, operations []string, images []string) ([]ImageResponse, error) {
   return nil, fmt.Errorf("forgeclient: ExtrasBatch operation not implemented")
}

// Models retrieves available models from SD-Forge.
func (c *RealClient) Models(ctx context.Context) ([]ModelInfo, error) {
   url := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/sd-models"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: new request models: %w", err)
   }
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: models request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return nil, fmt.Errorf("forgeclient: models status %d: %s", resp.StatusCode, string(body))
   }
   var out []ModelInfo
   if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
       return nil, fmt.Errorf("forgeclient: decode Models response: %w", err)
   }
   return out, nil
}

// SwitchModel instructs SD-Forge to switch to a checkpoint via options API.
func (c *RealClient) SwitchModel(ctx context.Context, model string) error {
   // send option to change checkpoint
   payload := map[string]string{"sd_model_checkpoint": model}
   data, err := json.Marshal(payload)
   if err != nil {
       return fmt.Errorf("forgeclient: marshal SwitchModel payload: %w", err)
   }
   url := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/options"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
   if err != nil {
       return fmt.Errorf("forgeclient: new request SwitchModel: %w", err)
   }
   httpReq.Header.Set("Content-Type", "application/json")
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return fmt.Errorf("forgeclient: SwitchModel request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return fmt.Errorf("forgeclient: SwitchModel status %d: %s", resp.StatusCode, string(body))
   }
   return nil
}

// Loras retrieves available hypernetworks from SD-Forge.
func (c *RealClient) Loras(ctx context.Context) ([]LoraInfo, error) {
   url := strings.TrimRight(c.baseURL, "/") + "/sdapi/v1/hypernetworks"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: new request Loras: %w", err)
   }
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return nil, fmt.Errorf("forgeclient: Loras request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return nil, fmt.Errorf("forgeclient: Loras status %d: %s", resp.StatusCode, string(body))
   }
   var out []LoraInfo
   if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
       return nil, fmt.Errorf("forgeclient: decode Loras response: %w", err)
   }
   return out, nil
}

// Ping checks health of SD-Forge.
func (c *RealClient) Ping(ctx context.Context) error {
   url := strings.TrimRight(c.baseURL, "/") + "/internal/ping"
   httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
   if err != nil {
       return fmt.Errorf("forgeclient: new request Ping: %w", err)
   }
   resp, err := http.DefaultClient.Do(httpReq)
   if err != nil {
       return fmt.Errorf("forgeclient: Ping request failed: %w", err)
   }
   defer resp.Body.Close()
   if resp.StatusCode < 200 || resp.StatusCode >= 300 {
       body, _ := io.ReadAll(resp.Body)
       return fmt.Errorf("forgeclient: Ping status %d: %s", resp.StatusCode, string(body))
   }
   return nil
}

// History retrieves history entries for an image.
func (c *RealClient) History(ctx context.Context, imageID string) ([]HistoryEntry, error) {
   // not implemented: history via SD-Forge API unsupported
   return nil, fmt.Errorf("forgeclient: History not implemented")
}