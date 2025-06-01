package api_test

import (
   "bytes"
   "context"
   "encoding/json"
   "net/http"
   "net/http/httptest"
   "testing"

   "image-processor-backend/internal/api"
   "image-processor-backend/internal/forgeclient"
)

func TestTxt2ImgHandler(t *testing.T) {
   // Arrange: mock service
   mock := &forgeclient.MockClient{
       Txt2ImgFunc: func(ctx context.Context, req *forgeclient.Txt2ImgRequest) (*forgeclient.ImageResponse, error) {
           return &forgeclient.ImageResponse{
               Images:     []string{"data:image/png;base64,AAA"},
               Parameters: map[string]interface{}{"steps": req.Steps},
               Info:       "info text",
           }, nil
       },
   }
   api.SetForgeClient(mock)
   router := api.SetupRouter()

   // Act: call handler
   reqBody := forgeclient.Txt2ImgRequest{Prompt: "hello", Steps: 10, CFGScale: 7.5}
   b, _ := json.Marshal(reqBody)
   w := httptest.NewRecorder()
   req := httptest.NewRequest(http.MethodPost, "/api/v1/txt2img", bytes.NewReader(b))
   req.Header.Set("Content-Type", "application/json")
   router.ServeHTTP(w, req)

   // Assert
   if w.Code != http.StatusOK {
       t.Fatalf("expected status 200, got %d", w.Code)
   }
   var resp forgeclient.ImageResponse
   if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
       t.Fatalf("unmarshal response: %v", err)
   }
   if len(resp.Images) != 1 || resp.Images[0] != "data:image/png;base64,AAA" {
       t.Errorf("unexpected images: %v", resp.Images)
   }
   if resp.Info != "info text" {
       t.Errorf("unexpected info: %s", resp.Info)
   }
}

func TestImg2ImgHandler(t *testing.T) {
   mock := &forgeclient.MockClient{
       Img2ImgFunc: func(ctx context.Context, req *forgeclient.Img2ImgRequest) (*forgeclient.ImageResponse, error) {
           return &forgeclient.ImageResponse{Images: []string{"img2img"}, Info: "img info"}, nil
       },
   }
   api.SetForgeClient(mock)
   router := api.SetupRouter()

   reqBody := forgeclient.Img2ImgRequest{InitImages: []string{"base64img"}, Prompt: "edit", Steps: 5}
   b, _ := json.Marshal(reqBody)
   w := httptest.NewRecorder()
   req := httptest.NewRequest(http.MethodPost, "/api/v1/img2img", bytes.NewReader(b))
   req.Header.Set("Content-Type", "application/json")
   router.ServeHTTP(w, req)

   if w.Code != http.StatusOK {
       t.Fatalf("expected status 200, got %d", w.Code)
   }
   var resp forgeclient.ImageResponse
   if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
       t.Fatalf("unmarshal response: %v", err)
   }
   if len(resp.Images) != 1 || resp.Images[0] != "img2img" {
       t.Errorf("unexpected images: %v", resp.Images)
   }
   if resp.Info != "img info" {
       t.Errorf("unexpected info: %s", resp.Info)
   }
}

func TestProgressHandler(t *testing.T) {
   mock := &forgeclient.MockClient{
       ProgressFunc: func(ctx context.Context, skip bool) (*forgeclient.ProgressResponse, error) {
           return &forgeclient.ProgressResponse{CurrentImage: "img", Progress: 0.5, ETA: 12.3}, nil
       },
   }
   api.SetForgeClient(mock)
   router := api.SetupRouter()

   w := httptest.NewRecorder()
   req := httptest.NewRequest(http.MethodGet, "/api/v1/progress?skip_current_image=true", nil)
   router.ServeHTTP(w, req)

   if w.Code != http.StatusOK {
       t.Fatalf("expected status 200, got %d", w.Code)
   }
   var resp forgeclient.ProgressResponse
   if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
       t.Fatalf("unmarshal response: %v", err)
   }
   if resp.Progress != 0.5 || resp.CurrentImage != "img" {
       t.Errorf("unexpected progress response: %+v", resp)
   }
}

func TestRegionsHandler(t *testing.T) {
   // No need to mock, stub returns 501
   api.SetForgeClient(&forgeclient.MockClient{})
   router := api.SetupRouter()

   w := httptest.NewRecorder()
   req := httptest.NewRequest(http.MethodPost, "/api/v1/regions", nil)
   router.ServeHTTP(w, req)

   if w.Code != http.StatusNotImplemented {
       t.Fatalf("expected status 501, got %d", w.Code)
   }
   var errResp map[string]string
   if err := json.Unmarshal(w.Body.Bytes(), &errResp); err != nil {
       t.Fatalf("unmarshal error response: %v", err)
   }
   if msg, ok := errResp["error"]; !ok || msg == "" {
       t.Errorf("unexpected error message: %v", errResp)
   }
}