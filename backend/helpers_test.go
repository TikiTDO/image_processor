package main_test

import (
    "io"
    "os"
    "path/filepath"
    "testing"

    app "image-processor-backend"
)

// copyDir recursively copies files from src to dst.
func copyDir(t *testing.T, src, dst string) {
    entries, err := os.ReadDir(src)
    if err != nil {
        t.Fatalf("read dir %s: %v", src, err)
    }
    if err := os.MkdirAll(dst, 0755); err != nil {
        t.Fatalf("mkdir %s: %v", dst, err)
    }
    for _, e := range entries {
        if e.IsDir() {
            continue
        }
        infile := filepath.Join(src, e.Name())
        outfile := filepath.Join(dst, e.Name())
        in, err := os.Open(infile)
        if err != nil {
            t.Fatalf("open src file %s: %v", infile, err)
        }
        defer in.Close()
        out, err := os.Create(outfile)
        if err != nil {
            t.Fatalf("create dst file %s: %v", outfile, err)
        }
        defer out.Close()
        if _, err := io.Copy(out, in); err != nil {
            t.Fatalf("copy %s to %s: %v", infile, outfile, err)
        }
    }
}

// prepareTestDir copies the backend/images directory to a temp dir and configures the app.
func prepareTestDir(t *testing.T) string {
    tmp := t.TempDir()
    srcDir := filepath.Join("images")
    dstDir := filepath.Join(tmp, "images")
    copyDir(t, srcDir, dstDir)
    // Configure the application to use the temp images directory.
    app.SetImageDir(dstDir)
    return dstDir
}