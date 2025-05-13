package main

import (
	"crypto/tls"
	"embed"
	"flag"
	"io/fs"
	"log"
	"math/rand"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"image-processor-backend/internal/api"

	"github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go/http3"
)

//go:embed static
var staticFS embed.FS

// SetImageDir configures the base directory for images (used in tests).
func SetImageDir(dir string) {
	api.SetImageDir(dir)
}

// SetupRouter returns the HTTP router with all routes configured.
func SetupRouter() *gin.Engine {
	return api.SetupRouter()
}

// Type aliases re-exported for tests.
type ImageResponse = api.ImageResponse
type ReorderRequest = api.ReorderRequest
type ReorderResponse = api.ReorderResponse

func main() {
	// Parse server mode: dev for proxying to frontend dev server, prod for serving static files
	var mode string
	flag.StringVar(&mode, "mode", "", "server mode: dev or prod (default: prod)")
	flag.Parse()
	if mode == "" {
		mode = os.Getenv("MODE")
	}
	if mode == "" {
		mode = "prod"
	}
	rand.Seed(time.Now().UnixNano())
	imageDir := os.Getenv("IMAGE_DIR")
	if imageDir == "" {
		imageDir = "images"
	}
	if err := os.MkdirAll(imageDir, 0755); err != nil {
		log.Fatalf("Could not create image dir: %v", err)
	}
	api.SetImageDir(imageDir)
	if err := api.StartWatcher(imageDir); err != nil {
		log.Println("Warning: file watcher not started:", err)
	}
	r := api.SetupRouter()

	// Frontend: in dev, reverse-proxy to Vite; in prod, serve embedded SPA
	if mode == "dev" {
		devURL := os.Getenv("DEV_SERVER_URL")
		if devURL == "" {
			devURL = "https://localhost:5800"
		}
		target, err := url.Parse(devURL)
		if err != nil {
			log.Fatalf("Invalid DEV_SERVER_URL %q: %v", devURL, err)
		}
		proxy := httputil.NewSingleHostReverseProxy(target)
		proxy.Transport = &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}
		r.NoRoute(func(c *gin.Context) {
			proxy.ServeHTTP(c.Writer, c.Request)
		})
	} else {
		// Prod: serve embedded SPA from backend/static
		embedded, err := fs.Sub(staticFS, "static")
		if err != nil {
			log.Fatalf("Failed to load embedded assets: %v", err)
		}
		fileSystem := http.FS(embedded)
		r.NoRoute(func(c *gin.Context) {
			reqPath := c.Request.URL.Path
			// Serve index.html at root
			if reqPath == "/" {
				c.FileFromFS("index.html", fileSystem)
				return
			}
			// Trim leading slash and check for static file
			p := strings.TrimPrefix(reqPath, "/")
			if f, err := embedded.Open(p); err == nil {
				if info, err2 := f.Stat(); err2 == nil && !info.IsDir() {
					c.FileFromFS(p, fileSystem)
					return
				}
			}
			// Fallback to index.html for SPA routing
			c.FileFromFS("index.html", fileSystem)
		})
	}
	// Determine host and port for the HTTP server
	host := os.Getenv("SERVER_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "5700"
	}
	addr := host + ":" + port
	log.Printf("Server running on %s (HTTPS & HTTP/3)", addr)
	// Paths to TLS certificate and key
	certFile := filepath.Join(".", "certs", "cert.pem")
	keyFile := filepath.Join(".", "certs", "key.pem")
	// TLS configuration with HTTP/3 support
	tlsConfig := &tls.Config{
		NextProtos: []string{"h3", "http/1.1"},
	}
	// HTTP server for HTTP/1.1 and HTTP/2
	server := &http.Server{
		Addr:      addr,
		Handler:   r,
		TLSConfig: tlsConfig,
	}
	// Start HTTP/3 (QUIC) server
	go func() {
		log.Printf("Starting HTTP/3 server on %s", addr)
		if err := http3.ListenAndServeQUIC(addr, certFile, keyFile, r); err != nil {
			log.Fatalf("HTTP/3 server error: %v", err)
		}
	}()
	// Start HTTPS server (HTTP/1.1 & HTTP/2)
	log.Printf("Starting HTTPS server on %s", addr)
	if err := server.ListenAndServeTLS(certFile, keyFile); err != nil {
		log.Fatalf("HTTPS server error: %v", err)
	}
}
