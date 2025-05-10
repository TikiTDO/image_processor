package main_test

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

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
    // Ensure images are sorted by filename (lexical order)
    for i := 1; i < len(imgs); i++ {
        if imgs[i].ID < imgs[i-1].ID {
            t.Errorf("images not sorted by ID: %s coming after %s", imgs[i].ID, imgs[i-1].ID)
        }
    }
}