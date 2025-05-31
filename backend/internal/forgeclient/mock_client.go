package forgeclient

import (
   "context"
)

// MockClient is a mock implementation of Client for unit tests.
// Users can assign functions to each field to simulate behavior.
type MockClient struct {
   Txt2ImgFunc   func(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error)
   Img2ImgFunc   func(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error)
   ProgressFunc  func(ctx context.Context, skipCurrent bool) (*ProgressResponse, error)
}

// Txt2Img calls the assigned Txt2ImgFunc or returns nil if unset.
func (m *MockClient) Txt2Img(ctx context.Context, req *Txt2ImgRequest) (*ImageResponse, error) {
   if m.Txt2ImgFunc != nil {
       return m.Txt2ImgFunc(ctx, req)
   }
   return nil, nil
}

// Img2Img calls the assigned Img2ImgFunc or returns nil if unset.
func (m *MockClient) Img2Img(ctx context.Context, req *Img2ImgRequest) (*ImageResponse, error) {
   if m.Img2ImgFunc != nil {
       return m.Img2ImgFunc(ctx, req)
   }
   return nil, nil
}

// Progress calls the assigned ProgressFunc or returns nil if unset.
func (m *MockClient) Progress(ctx context.Context, skipCurrent bool) (*ProgressResponse, error) {
   if m.ProgressFunc != nil {
       return m.ProgressFunc(ctx, skipCurrent)
   }
   return nil, nil
}