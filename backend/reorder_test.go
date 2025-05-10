package main_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    app "image-processor-backend"
)

// TestReorderEnd moves the first image to after the last and checks timestamp.
func TestReorderEnd(t *testing.T) {
    prepareTestDir(t)
    router := app.SetupRouter()

    // Fetch initial list
    w0 := httptest.NewRecorder()
    r0 := httptest.NewRequest(http.MethodGet, "/api/images", nil)
    router.ServeHTTP(w0, r0)
    var imgs []app.ImageResponse
    if err := json.Unmarshal(w0.Body.Bytes(), &imgs); err != nil {
        t.Fatalf("unmarshal initial response: %v", err)
    }
    n := len(imgs)
    if n < 2 {
        t.Skip("not enough images to test reorder")
    }
    first := imgs[0]
    last := imgs[n-1]

    // Reorder first to after last
    reqBody := app.ReorderRequest{PrevID: last.ID, NextID: ""}
    bodyData, _ := json.Marshal(reqBody)
    w1 := httptest.NewRecorder()
    r1 := httptest.NewRequest(http.MethodPost, "/api/images/"+first.ID+"/reorder", bytes.NewReader(bodyData))
    r1.Header.Set("Content-Type", "application/json")
    router.ServeHTTP(w1, r1)
    if w1.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w1.Code)
    }
    var resp app.ReorderResponse
    if err := json.Unmarshal(w1.Body.Bytes(), &resp); err != nil {
        t.Fatalf("unmarshal reorder response: %v", err)
    }
    newT, err := time.Parse(time.RFC3339Nano, resp.Timestamp)
    if err != nil {
        t.Fatalf("parse new timestamp: %v", err)
    }
    lastT, _ := time.Parse(time.RFC3339Nano, last.Timestamp)
    if !newT.After(lastT) {
        t.Errorf("expected new timestamp %v to be after %v", newT, lastT)
    }
}

// TestReorderStart moves the last image to before the first and checks timestamp.
func TestReorderStart(t *testing.T) {
    prepareTestDir(t)
    router := app.SetupRouter()

    w0 := httptest.NewRecorder()
    r0 := httptest.NewRequest(http.MethodGet, "/api/images", nil)
    router.ServeHTTP(w0, r0)
    var imgs []app.ImageResponse
    if err := json.Unmarshal(w0.Body.Bytes(), &imgs); err != nil {
        t.Fatalf("unmarshal initial response: %v", err)
    }
    n := len(imgs)
    if n < 2 {
        t.Skip("not enough images to test reorder")
    }
    first := imgs[0]
    last := imgs[n-1]

    reqBody := app.ReorderRequest{PrevID: "", NextID: first.ID}
    bodyData, _ := json.Marshal(reqBody)
    w1 := httptest.NewRecorder()
    r1 := httptest.NewRequest(http.MethodPost, "/api/images/"+last.ID+"/reorder", bytes.NewReader(bodyData))
    r1.Header.Set("Content-Type", "application/json")
    router.ServeHTTP(w1, r1)
    if w1.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w1.Code)
    }
    var resp app.ReorderResponse
    if err := json.Unmarshal(w1.Body.Bytes(), &resp); err != nil {
        t.Fatalf("unmarshal reorder response: %v", err)
    }
    newT, err := time.Parse(time.RFC3339Nano, resp.Timestamp)
    if err != nil {
        t.Fatalf("parse new timestamp: %v", err)
    }
    firstT, _ := time.Parse(time.RFC3339Nano, first.Timestamp)
    if !newT.Before(firstT) {
        t.Errorf("expected new timestamp %v to be before %v", newT, firstT)
    }
}

// TestReorderMiddle moves a middle image between neighbors and checks midpoint.
func TestReorderMiddle(t *testing.T) {
    prepareTestDir(t)
    router := app.SetupRouter()

    w0 := httptest.NewRecorder()
    r0 := httptest.NewRequest(http.MethodGet, "/api/images", nil)
    router.ServeHTTP(w0, r0)
    var imgs []app.ImageResponse
    if err := json.Unmarshal(w0.Body.Bytes(), &imgs); err != nil {
        t.Fatalf("unmarshal initial response: %v", err)
    }
    if len(imgs) < 3 {
        t.Skip("not enough images to test middle reorder")
    }
    prev := imgs[0]
    mid := imgs[1]
    next := imgs[2]

    reqBody := app.ReorderRequest{PrevID: prev.ID, NextID: next.ID}
    bodyData, _ := json.Marshal(reqBody)
    w1 := httptest.NewRecorder()
    r1 := httptest.NewRequest(http.MethodPost, "/api/images/"+mid.ID+"/reorder", bytes.NewReader(bodyData))
    r1.Header.Set("Content-Type", "application/json")
    router.ServeHTTP(w1, r1)
    if w1.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w1.Code)
    }
    var resp app.ReorderResponse
    if err := json.Unmarshal(w1.Body.Bytes(), &resp); err != nil {
        t.Fatalf("unmarshal reorder response: %v", err)
    }
    newT, err := time.Parse(time.RFC3339Nano, resp.Timestamp)
    if err != nil {
        t.Fatalf("parse new timestamp: %v", err)
    }
    prevT, _ := time.Parse(time.RFC3339Nano, prev.Timestamp)
    nextT, _ := time.Parse(time.RFC3339Nano, next.Timestamp)
    expected := prevT.Add(nextT.Sub(prevT) / 2)
    if !newT.Equal(expected) {
        t.Errorf("expected new timestamp %v, got %v", expected, newT)
    }
}