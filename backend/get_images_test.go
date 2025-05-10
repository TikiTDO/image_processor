package main_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    app "image-processor-backend"
)

// TestGetImagesSorted ensures that GET /api/images returns images sorted by timestamp.
func TestGetImagesSorted(t *testing.T) {
    // Prepare temporary images directory and configure app.
    prepareTestDir(t)

    router := app.SetupRouter()
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/api/images", nil)
    router.ServeHTTP(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w.Code)
    }
    var imgs []app.ImageResponse
    if err := json.Unmarshal(w.Body.Bytes(), &imgs); err != nil {
        t.Fatalf("unmarshal response: %v", err)
    }
    if len(imgs) < 2 {
        t.Skip("not enough images to test sorting")
    }
    // Ensure images are sorted by timestamp ascending
    for i := 1; i < len(imgs); i++ {
        prevT, err1 := time.Parse(time.RFC3339Nano, imgs[i-1].Timestamp)
        if err1 != nil {
            t.Fatalf("parse previous timestamp: %v", err1)
        }
        currT, err2 := time.Parse(time.RFC3339Nano, imgs[i].Timestamp)
        if err2 != nil {
            t.Fatalf("parse current timestamp: %v", err2)
        }
        if currT.Before(prevT) {
            t.Errorf("images not sorted by timestamp: %s coming before %s", imgs[i].Timestamp, imgs[i-1].Timestamp)
        }
    }
}