package api

import (
   "encoding/json"
   "fmt"
   "io/ioutil"
   "log"
   "math/rand"
   "net/http"
   "net/url"
   "os"
   "path/filepath"
   "sort"
   "strings"
   "time"

   "github.com/gin-gonic/gin"
   "image-processor-backend/internal/storage"
)

// SpeakerMeta groups speaker colors and names.
type SpeakerMeta struct {
   SpeakerColors map[string]string `json:"speaker_colors"`
   SpeakerNames  map[string]string `json:"speaker_names"`
}

// handleGetAllDialogs retrieves dialogs for all images in the given path.
func handleGetAllDialogs(c *gin.Context) {
   sub := c.Query("path")
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // get list of images
   imgs := getImages(sub)
   // assemble dialogs map
   dialogs := make(map[string][]string, len(imgs))
   for _, im := range imgs {
       // resolve filename by hash
       filename, err := findFilenameByHash(baseDir, im.ID)
       if err != nil || filename == "" {
           dialogs[im.ID] = []string{}
           continue
       }
       entries, err := storage.LoadDialogFile(baseDir, filename)
       if err != nil {
           dialogs[im.ID] = []string{}
           continue
       }
       dialogs[im.ID] = entries
   }
   c.JSON(http.StatusOK, gin.H{"dialogs": dialogs})
}

// findFilenameByHash searches for a file in baseDir whose SHA-256 hex digest of its filename matches the given hash.
// Returns the original filename if found, or empty string if not.
func findFilenameByHash(baseDir, hash string) (string, error) {
   files, err := ioutil.ReadDir(baseDir)
   if err != nil {
       return "", err
   }
   for _, fi := range files {
       if fi.IsDir() {
           continue
       }
       full := filepath.Join(baseDir, fi.Name())
       h, err := storage.HashFile(full)
       if err != nil {
           continue
       }
       if h == hash {
           return fi.Name(), nil
       }
   }
   return "", nil
}

// ImageResponse is sent to the client for each image.
type ImageResponse struct {
   ID        string `json:"id"`
   URL       string `json:"url"`
   Timestamp string `json:"timestamp"`
}

// DirEntry describes a subdirectory and its content counts.
type DirEntry struct {
   Name       string `json:"name"`
   ImageCount int    `json:"image_count"`
   DirCount   int    `json:"dir_count"`
}

// ReorderRequest is the JSON payload for a reorder operation.
type ReorderRequest struct {
   PrevID string `json:"prev_id"`
   NextID string `json:"next_id"`
}

// ReorderResponse is returned after updating the timestamp.
type ReorderResponse struct {
   ID        string `json:"id"`
   Timestamp string `json:"timestamp"`
}

// handleGetSpeakers returns combined speaker colors and names.
func handleGetSpeakers(c *gin.Context) {
   path := getSpeakerMetaPath()
   defaults := SpeakerMeta{
       SpeakerColors: map[string]string{"0": "#000000"},
       SpeakerNames:  map[string]string{"0": "Narrator"},
   }
   data, err := ioutil.ReadFile(path)
   if err != nil {
       out, _ := json.MarshalIndent(defaults, "", "  ")
       ioutil.WriteFile(path, out, 0644)
       c.JSON(http.StatusOK, defaults)
       return
   }
   var meta SpeakerMeta
   if err := json.Unmarshal(data, &meta); err != nil {
       out, _ := json.MarshalIndent(defaults, "", "  ")
       ioutil.WriteFile(path, out, 0644)
       c.JSON(http.StatusOK, defaults)
       return
   }
   if meta.SpeakerColors == nil {
       meta.SpeakerColors = defaults.SpeakerColors
   }
   if meta.SpeakerNames == nil {
       meta.SpeakerNames = defaults.SpeakerNames
   }
   c.JSON(http.StatusOK, meta)
}

// handleSetSpeakers saves combined speaker colors and names.
func handleSetSpeakers(c *gin.Context) {
   var meta SpeakerMeta
   if err := c.ShouldBindJSON(&meta); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   out, err := json.MarshalIndent(meta, "", "  ")
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not serialize speaker data"})
       return
   }
   if err := ioutil.WriteFile(getSpeakerMetaPath(), out, 0644); err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save speaker data"})
       return
   }
   c.JSON(http.StatusOK, meta)
}



// handleGetDialog retrieves per-image dialog from metadata.
func handleGetDialog(c *gin.Context) {
   sub := c.Query("path")
   idHash := c.Param("id")
   // map hash ID to current filename
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   filename, err := findFilenameByHash(baseDir, idHash)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve image ID"})
       return
   }
   if filename == "" {
       c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
       return
   }
   // load dialog entries from file-based storage
   entries, err := storage.LoadDialogFile(baseDir, filename)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load dialog"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"dialog": entries})
}

// handleSetDialog updates per-image dialog in metadata.
func handleSetDialog(c *gin.Context) {
   sub := c.Query("path")
   idHash := c.Param("id")
   // map hash ID to current filename
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   filename, err := findFilenameByHash(baseDir, idHash)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve image ID"})
       return
   }
   if filename == "" {
       c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
       return
   }
   var req struct { Dialog []string `json:"dialog"` }
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   // save dialog entries to file-based storage
   if err := storage.SaveDialogFile(baseDir, filename, req.Dialog); err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save dialog"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"dialog": req.Dialog})
}

// handleUpload processes file uploads via multipart/form-data.
func handleUpload(c *gin.Context) {
   sub := c.Query("path")
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // Migrate legacy metadata.json to hashed entries
   if err := storage.MigrateMetadata(baseDir); err != nil {
       log.Printf("Error migrating metadata for %s: %v", baseDir, err)
   }
   form, err := c.MultipartForm()
   if err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   files := form.File["files"]
   if len(files) == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "no files to upload"})
       return
   }
   now := time.Now().Truncate(time.Second)
   n := len(files)
   for idx, fh := range files {
       frac := int64(idx+1) * int64(time.Second) / int64(n+1)
       ts := now.Add(time.Duration(frac))
       prefix := now.Format("20060102150405")
       suffix := fmt.Sprintf("%09d", frac)
       ext := filepath.Ext(fh.Filename)
       newName := prefix + "-" + suffix + ext
       dst := filepath.Join(baseDir, newName)
       if err := c.SaveUploadedFile(fh, dst); err != nil {
           log.Printf("Error saving upload %s: %v", fh.Filename, err)
           continue
       }
       tsStr := ts.Format(time.RFC3339Nano)
       if err := storage.SaveMetaEntry(baseDir, newName, tsStr); err != nil {
           log.Printf("Error saving metadata for %s: %v", newName, err)
       }
   }
   c.JSON(http.StatusOK, gin.H{"uploaded": len(files)})
}

// handleGetImages sends the list of images as JSON.
func handleGetImages(c *gin.Context) {
   sub := c.Query("path")
   imgs := getImages(sub)
   c.JSON(http.StatusOK, imgs)
}

// handleGetImage serves the binary image data for a given hash ID.
func handleGetImage(c *gin.Context) {
   sub := c.Query("path")
   idHash := c.Param("id")
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // map hash ID to current filename
   filename, err := findFilenameByHash(baseDir, idHash)
   if err != nil {
       c.Status(http.StatusInternalServerError)
       return
   }
   if filename == "" {
       c.Status(http.StatusNotFound)
       return
   }
   fullPath := filepath.Join(baseDir, filename)
   info, err := os.Stat(fullPath)
   if err != nil {
       c.Status(http.StatusNotFound)
       return
   }
   etag := fmt.Sprintf("\"%x-%x\"", info.ModTime().UnixNano(), info.Size())
   c.Header("ETag", etag)
   c.Header("Cache-Control", "no-cache, must-revalidate")
   if match := c.GetHeader("If-None-Match"); match != "" && match == etag {
       c.Status(http.StatusNotModified)
       return
   }
   c.File(fullPath)
}
// handleDeleteImage deletes the image file and associated metadata and dialogs.
func handleDeleteImage(c *gin.Context) {
   sub := c.Query("path")
   idHash := c.Param("id")
   // Determine base directory
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // Resolve hash ID to filename
   filename, err := findFilenameByHash(baseDir, idHash)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve image ID"})
       return
   }
   if filename == "" {
       c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
       return
   }
   // Delete image file
   fullPath := filepath.Join(baseDir, filename)
   if err := os.Remove(fullPath); err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete image file"})
       return
   }
   // Delete metadata and dialog entries (ignore errors), using content hash
   _ = storage.DeleteMetaEntry(baseDir, idHash)
   _ = storage.DeleteDialogEntry(baseDir, idHash)
   c.Status(http.StatusNoContent)
}

// handleGetDirs lists subdirectories under a given path.
func handleGetDirs(c *gin.Context) {
   sub := c.Query("path")
   // Determine which directory to list
   dir := ImageDir
   if sub != "" {
       dir = filepath.Join(ImageDir, sub)
   }
   files, err := ioutil.ReadDir(dir)
   if err != nil {
       log.Printf("handleGetDirs: failed to read directory %q: %v", dir, err)
       c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
       return
   }
   var entries []DirEntry
   for _, fi := range files {
       // Only consider directories
       if !fi.IsDir() {
           continue
       }
       subdir := filepath.Join(dir, fi.Name())
       // At root level, include only directories that contain image files
       if sub == "" {
           childrenRoot, err := ioutil.ReadDir(subdir)
           if err != nil {
               continue
           }
           found := false
           for _, child := range childrenRoot {
               if !child.IsDir() {
                   lname := strings.ToLower(child.Name())
                   if strings.HasSuffix(lname, ".jpg") || strings.HasSuffix(lname, ".jpeg") || strings.HasSuffix(lname, ".png") {
                       found = true
                       break
                   }
               }
           }
           if !found {
               continue
           }
       }
       // Read directory entries for counts
       children, err := ioutil.ReadDir(subdir)
       if err != nil {
           continue
       }
       imgCount, dirCount := 0, 0
       for _, child := range children {
           if child.IsDir() {
               dirCount++
           } else {
               lname := strings.ToLower(child.Name())
               if strings.HasSuffix(lname, ".jpg") || strings.HasSuffix(lname, ".jpeg") || strings.HasSuffix(lname, ".png") {
                   imgCount++
               }
           }
       }
       entries = append(entries, DirEntry{Name: fi.Name(), ImageCount: imgCount, DirCount: dirCount})
   }
   sort.Slice(entries, func(i, j int) bool { return entries[i].Name < entries[j].Name })
   log.Printf("handleGetDirs: sub=%q resolvedDir=%q entries=%d", sub, dir, len(entries))
   c.JSON(http.StatusOK, entries)
}

// handleReorder processes an image reorder request.
func handleReorder(c *gin.Context) {
   var req ReorderRequest
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   sub := c.Query("path")
   // map hash ID to current filename before reordering
   idHash := c.Param("id")
   dirPath := ImageDir
   if sub != "" {
       dirPath = filepath.Join(ImageDir, sub)
   }
   filename, err := findFilenameByHash(dirPath, idHash)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not resolve image ID"})
       return
   }
   if filename == "" {
       c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
       return
   }
   // use resolved filename as ID for reordering
   id := filename
   images := getImages(sub)
   // Build mapping from image ID to timestamp
   idToTs := make(map[string]time.Time, len(images))
   for _, im := range images {
       t, _ := time.Parse(time.RFC3339Nano, im.Timestamp)
       // For images with identical content (same hash), preserve first timestamp
       if _, exists := idToTs[im.ID]; !exists {
           idToTs[im.ID] = t
       }
   }
   // Determine previous and next timestamps if provided
   var prevT, nextT time.Time
   var havePrev, haveNext bool
   if req.PrevID != "" {
       if t, ok := idToTs[req.PrevID]; ok {
           prevT = t
           havePrev = true
       }
   }
   if req.NextID != "" {
       if t, ok := idToTs[req.NextID]; ok {
           nextT = t
           haveNext = true
       }
   }
   // Compute new timestamp based on neighbors
   var newT time.Time
   if havePrev && haveNext {
       diff := nextT.Sub(prevT)
       newT = prevT.Add(diff / 2)
   } else if havePrev {
       newT = prevT.Add(time.Second)
   } else if haveNext {
       newT = nextT.Add(-time.Second)
   } else {
       newT = time.Now()
   }
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // Migrate legacy metadata.json to hashed entries
   if err := storage.MigrateMetadata(baseDir); err != nil {
       log.Printf("Error migrating metadata for %s: %v", baseDir, err)
   }
   // Load existing timestamp for the moved file
   rawOldTS, err := storage.LoadMetaEntry(baseDir, id)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load metadata"})
       return
   }
   // Group rename logic
   prefix := newT.Format("20060102150405")
   var groupNames []string
   files, err := ioutil.ReadDir(baseDir)
   if err == nil {
       for _, fi := range files {
           if fi.IsDir() {
               continue
           }
           name := fi.Name()
           if strings.HasPrefix(name, prefix+"-") {
               groupNames = append(groupNames, name)
           }
       }
   }
   if !contains(groupNames, id) {
       groupNames = append(groupNames, id)
   }
   type gf struct { name, ext string; ts time.Time }
   var groupFiles []gf
   prefixTime := newT.Truncate(time.Second)
   for _, name := range groupNames {
       ext := filepath.Ext(name)
       tsVal := prefixTime
       if name == id {
           tsVal = newT
       } else {
           // Attempt to load hashed metadata entry
           raw, err := storage.LoadMetaEntry(baseDir, name)
           if err == nil && raw != "" {
               if t2, err2 := time.Parse(time.RFC3339Nano, raw); err2 == nil {
                   tsVal = t2
               }
           }
       }
       groupFiles = append(groupFiles, gf{name: name, ext: ext, ts: tsVal})
   }
   sort.Slice(groupFiles, func(i, j int) bool { return groupFiles[i].ts.Before(groupFiles[j].ts) })
   total := len(groupFiles)
   movedNewName := ""
   var movedTS time.Time
   for idx, g := range groupFiles {
       frac := int64(idx+1) * int64(time.Second) / int64(total+1)
       suffix := fmt.Sprintf("%09d", frac)
       newName := prefix + "-" + suffix + g.ext
       oldPath := filepath.Join(baseDir, g.name)
       newPath := filepath.Join(baseDir, newName)
       if g.name != newName {
           if _, err := os.Stat(newPath); err == nil {
               randSuffix := rand.Int63n(1e9)
               suffix = fmt.Sprintf("%09d", randSuffix)
               newName = prefix + "-" + suffix + g.ext
               newPath = filepath.Join(baseDir, newName)
           }
           if err := os.Rename(oldPath, newPath); err != nil {
               log.Printf("Error renaming file %s to %s: %v", g.name, newName, err)
           } else {
               // Move any dialog for the old ID to the new ID
               if err2 := storage.MoveDialogEntry(baseDir, g.name, newName); err2 != nil {
                   log.Printf("Error moving dialog for %s to %s: %v", g.name, newName, err2)
               }
           }
       }
       // Remove the old metadata entry
       if err := storage.DeleteMetaEntry(baseDir, g.name); err != nil {
           log.Printf("Error deleting metadata for %s: %v", g.name, err)
       }
       // Determine new timestamp for this file
       var tsStr string
       if g.name == id {
           tsStr = newT.Format(time.RFC3339Nano)
           movedNewName = newName
           movedTS = newT
       } else {
           tsStr = prefixTime.Add(time.Duration(frac)).Format(time.RFC3339Nano)
       }
       // Save new metadata entry
       if err := storage.SaveMetaEntry(baseDir, newName, tsStr); err != nil {
           log.Printf("Error saving metadata for %s: %v", newName, err)
       }
   }
   // Update any other entries sharing the old timestamp
   movedTSStr := movedTS.Format(time.RFC3339Nano)
   if files2, err2 := ioutil.ReadDir(baseDir); err2 == nil {
       for _, fi2 := range files2 {
           if fi2.IsDir() {
               continue
           }
           name2 := fi2.Name()
           if name2 == movedNewName {
               continue
           }
           ts2, err3 := storage.LoadMetaEntry(baseDir, name2)
           if err3 != nil || ts2 == "" {
               continue
           }
           if ts2 == rawOldTS {
               if err := storage.SaveMetaEntry(baseDir, name2, movedTSStr); err != nil {
                   log.Printf("Error updating metadata for %s: %v", name2, err)
               }
           }
       }
   }
   // Return the new hash ID for the moved file (content hash unchanged)
   fullNewPath := filepath.Join(baseDir, movedNewName)
   newID, err := storage.HashFile(fullNewPath)
   if err != nil {
       // Fallback to original ID if unable to hash
       newID = idHash
   }
   c.JSON(http.StatusOK, ReorderResponse{ID: newID, Timestamp: movedTSStr})
}

// getImages scans the given subdirectory and returns sorted images.
func getImages(sub string) []ImageResponse {
   dir := ImageDir
   if sub != "" {
       dir = filepath.Join(ImageDir, sub)
   }
   // Migrate legacy metadata.json to hashed storage
   _ = storage.MigrateMetadata(dir)
   files, err := ioutil.ReadDir(dir)
   if err != nil {
       return nil
   }
   type img struct { id string; ts time.Time; url string }
   var imgs []img
   // Build base API URL for fetching images by hash ID
   baseAPI := "/api/images"
   // Track seen content hashes to avoid duplicate entries
   seen := make(map[string]bool)
   for _, fi := range files {
       if fi.IsDir() {
           continue
       }
       lname := strings.ToLower(fi.Name())
       if !(strings.HasSuffix(lname, ".jpg") || strings.HasSuffix(lname, ".jpeg") || strings.HasSuffix(lname, ".png")) {
           continue
       }
       full := filepath.Join(dir, fi.Name())
       var t time.Time
       // Attempt to load hashed metadata entry
       tsStr, err := storage.LoadMetaEntry(dir, fi.Name())
       if err != nil {
           t = storage.GetFileTimestamp(full)
       } else if tsStr != "" {
           if parsed, err2 := time.Parse(time.RFC3339Nano, tsStr); err2 == nil {
               t = parsed
           } else {
               t = storage.GetFileTimestamp(full)
           }
       } else if p, err := time.Parse("20060102150405", strings.SplitN(fi.Name(), "-", 2)[0]); err == nil {
           t = p
       } else if exifT, err := storage.ParseExifTimestamp(full); err == nil {
           t = *exifT
       } else {
           t = storage.GetFileTimestamp(full)
       }
       // compute hash ID based on image content
       fullPath := filepath.Join(dir, fi.Name())
       hash, err := storage.HashFile(fullPath)
       if err != nil {
           continue
       }
       // Skip duplicate images with identical content hash
       if seen[hash] {
           continue
       }
       seen[hash] = true
       // construct URL endpoint for this image
       var imgURL string
       if sub != "" {
           imgURL = fmt.Sprintf("%s/%s?path=%s", baseAPI, hash, url.QueryEscape(sub))
       } else {
           imgURL = fmt.Sprintf("%s/%s", baseAPI, hash)
       }
       imgs = append(imgs, img{id: hash, ts: t, url: imgURL})
   }
   // sort images by timestamp ascending
   sort.Slice(imgs, func(i, j int) bool { return imgs[i].ts.Before(imgs[j].ts) })
   resp := make([]ImageResponse, len(imgs))
   for i, im := range imgs {
       resp[i] = ImageResponse{ID: im.id, URL: im.url, Timestamp: im.ts.Format(time.RFC3339Nano)}
   }
   return resp
}

// contains checks if a slice contains a string.
func contains(a []string, s string) bool {
   for _, v := range a {
       if v == s {
           return true
       }
   }
   return false
}