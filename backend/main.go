package main

import (
   "crypto/tls"
   "log"
   "math/rand"
   "net/http"
   "os"
   "path/filepath"
   "time"

   "github.com/gin-gonic/gin"
	"github.com/quic-go/quic-go/http3"
   "image-processor-backend/internal/api"
)

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
