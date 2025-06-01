package forgeclient

import (
   "context"
)

// MockClient is a mock implementation of Client for unit tests.
// Users can assign functions to each field to simulate behavior.
type MockClient struct {
   Txt2ImgFunc    func(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error)
   Img2ImgFunc    func(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error)
   ProgressFunc   func(ctx context.Context, skipCurrent bool) (*ProgressResponse, error)
   ExtrasFunc     func(ctx context.Context, operation, image string) (*ImageResponse, error)
   ExtrasBatchFunc func(ctx context.Context, operations []string, images []string) ([]ImageResponse, error)
   ModelsFunc     func(ctx context.Context) ([]ModelInfo, error)
   SwitchModelFunc func(ctx context.Context, model string) error
   LorasFunc      func(ctx context.Context) ([]LoraInfo, error)
   PingFunc       func(ctx context.Context) error
   HistoryFunc    func(ctx context.Context, imageID string) ([]HistoryEntry, error)
}

// Txt2Img calls the assigned Txt2ImgFunc or returns nil.
func (m *MockClient) Txt2Img(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error) {
   if m.Txt2ImgFunc != nil {
       return m.Txt2ImgFunc(ctx, req)
   }
   return nil, nil
}

// Img2Img calls the assigned Img2ImgFunc or returns nil.
func (m *MockClient) Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error) {
   if m.Img2ImgFunc != nil {
       return m.Img2ImgFunc(ctx, req)
   }
   return nil, nil
}

// Progress calls the assigned ProgressFunc or returns nil.
func (m *MockClient) Progress(ctx context.Context, skipCurrent bool) (*ProgressResponse, error) {
   if m.ProgressFunc != nil {
       return m.ProgressFunc(ctx, skipCurrent)
   }
   return nil, nil
}
// Extras calls ExtrasFunc or returns nil.
func (m *MockClient) Extras(ctx context.Context, operation, image string) (*ImageResponse, error) {
   if m.ExtrasFunc != nil {
       return m.ExtrasFunc(ctx, operation, image)
   }
   return nil, nil
}
// ExtrasBatch calls ExtrasBatchFunc or returns nil.
func (m *MockClient) ExtrasBatch(ctx context.Context, operations []string, images []string) ([]ImageResponse, error) {
   if m.ExtrasBatchFunc != nil {
       return m.ExtrasBatchFunc(ctx, operations, images)
   }
   return nil, nil
}
// Models calls ModelsFunc or returns nil.
func (m *MockClient) Models(ctx context.Context) ([]ModelInfo, error) {
   if m.ModelsFunc != nil {
       return m.ModelsFunc(ctx)
   }
   return nil, nil
}
// SwitchModel calls SwitchModelFunc or returns nil.
func (m *MockClient) SwitchModel(ctx context.Context, model string) error {
   if m.SwitchModelFunc != nil {
       return m.SwitchModelFunc(ctx, model)
   }
   return nil
}
// Loras calls LorasFunc or returns nil.
func (m *MockClient) Loras(ctx context.Context) ([]LoraInfo, error) {
   if m.LorasFunc != nil {
       return m.LorasFunc(ctx)
   }
   return nil, nil
}
// Ping calls PingFunc or returns nil.
func (m *MockClient) Ping(ctx context.Context) error {
   if m.PingFunc != nil {
       return m.PingFunc(ctx)
   }
   return nil
}
// History calls HistoryFunc or returns nil.
func (m *MockClient) History(ctx context.Context, imageID string) ([]HistoryEntry, error) {
   if m.HistoryFunc != nil {
       return m.HistoryFunc(ctx, imageID)
   }
   return nil, nil
}