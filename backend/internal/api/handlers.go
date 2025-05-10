package api

import (
   "encoding/json"
   "fmt"
   "io/ioutil"
   "log"
   "math/rand"
   "net/http"
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
   id := c.Param("id")
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // load dialog entries from file-based storage
   entries, err := storage.LoadDialogFile(baseDir, id)
   if err != nil {
       c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load dialog"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"dialog": entries})
}

// handleSetDialog updates per-image dialog in metadata.
func handleSetDialog(c *gin.Context) {
   sub := c.Query("path")
   id := c.Param("id")
   var req struct { Dialog []string `json:"dialog"` }
   if err := c.ShouldBindJSON(&req); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   baseDir := ImageDir
   if sub != "" {
       baseDir = filepath.Join(ImageDir, sub)
   }
   // save dialog entries to file-based storage
   if err := storage.SaveDialogFile(baseDir, id, req.Dialog); err != nil {
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
   id := c.Param("id")
   images := getImages(sub)
   idToTs := make(map[string]time.Time)
   for _, im := range images {
       t, _ := time.Parse(time.RFC3339Nano, im.Timestamp)
       idToTs[im.ID] = t
   }
   var prevT, nextT *time.Time
   if req.PrevID != "" {
       if t, ok := idToTs[req.PrevID]; ok {
           prevT = &t
       }
   }
   if req.NextID != "" {
       if t, ok := idToTs[req.NextID]; ok {
           nextT = &t
       }
   }
   var newT time.Time
   if prevT != nil && nextT != nil {
       diff := nextT.Sub(*prevT)
       newT = prevT.Add(diff / 2)
   } else if prevT != nil {
       newT = prevT.Add(time.Second)
   } else if nextT != nil {
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
   c.JSON(http.StatusOK, ReorderResponse{ID: movedNewName, Timestamp: movedTSStr})
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
   baseURL := "/images"
   if sub != "" {
       baseURL += "/" + sub
   }
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
       imgs = append(imgs, img{id: fi.Name(), ts: t, url: baseURL + "/" + fi.Name()})
   }
   sort.Slice(imgs, func(i, j int) bool { return imgs[i].id < imgs[j].id })
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