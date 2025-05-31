package main

import (
   "crypto/tls"
   "embed"
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
   "image-processor-backend/internal/forgeclient"

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
// Type aliases re-exported for tests.
type ImageResponse = api.ImageResponse
type ReorderRequest = api.ReorderRequest
type ReorderResponse = api.ReorderResponse

// Config holds server configuration loaded from environment.
type Config struct {
   Mode           string // dev or prod
   DevServerURL   string // when in dev mode
   ImageDir       string
   ServerHost     string
   ServerPort     string
   ForgeServerURL string // SD-Forge server URL
}

// loadConfig reads configuration from environment variables with sensible defaults.
func loadConfig() Config {
   cfg := Config{}
   // Server mode
   if m := os.Getenv("MODE"); m != "" {
       cfg.Mode = m
   } else {
       cfg.Mode = "prod"
   }
   // Dev server URL
   if dev := os.Getenv("DEV_SERVER_URL"); dev != "" {
       cfg.DevServerURL = dev
   } else {
       cfg.DevServerURL = "https://localhost:5800"
   }
   // Image directory
   if img := os.Getenv("IMAGE_DIR"); img != "" {
       cfg.ImageDir = img
   } else {
       cfg.ImageDir = "images"
   }
   // Host for HTTP server
   if h := os.Getenv("SERVER_HOST"); h != "" {
       cfg.ServerHost = h
   } else {
       cfg.ServerHost = "127.0.0.1"
   }
   // Port for HTTP server
   if p := os.Getenv("SERVER_PORT"); p != "" {
       cfg.ServerPort = p
   } else {
       cfg.ServerPort = "5700"
   }
   // SD-Forge server URL
   if f := os.Getenv("FORGE_SERVER_URL"); f != "" {
       cfg.ForgeServerURL = f
   } else {
       cfg.ForgeServerURL = "http://localhost:7860"
   }
   return cfg
}

func main() {
	// configure logging and randomness
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.LUTC)
	rand.Seed(time.Now().UnixNano())
	// load server configuration from flags and environment
	cfg := loadConfig()
	mode := cfg.Mode
	imageDir := cfg.ImageDir
	if err := os.MkdirAll(imageDir, 0755); err != nil {
		log.Fatalf("Could not create image dir: %v", err)
	}
	api.SetImageDir(imageDir)
	// Initialize forgeclient for SD-Forge integration
	api.SetForgeClient(forgeclient.NewClient(cfg.ForgeServerURL))
	if err := api.StartWatcher(imageDir); err != nil {
		log.Println("Warning: file watcher not started:", err)
	}
	r := api.SetupRouter()

	// Frontend: in dev, reverse-proxy to Vite; in prod, serve embedded SPA
	if mode == "dev" {
		// dev proxy to frontend
		devURL := cfg.DevServerURL
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
	// determine host:port from config
	addr := cfg.ServerHost + ":" + cfg.ServerPort
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
