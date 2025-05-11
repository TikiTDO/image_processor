package storage

import (
   "crypto/sha256"
   "encoding/hex"
   "encoding/json"
   "io/ioutil"
   "os"
   "path/filepath"
)

// hashString returns the SHA256 hex digest of the given string.
func hashString(s string) string {
   sum := sha256.Sum256([]byte(s))
   return hex.EncodeToString(sum[:])
}

// HashString returns the SHA256 hex digest of the given string.
// This exported wrapper allows other packages to compute the same hash used for dialog and metadata storage.
func HashString(s string) string {
   return hashString(s)
}

// LoadDialogFile reads dialog entries for the given id from a file-based store.
// Dialog files are organized under baseDir/dialogs/<first two hash chars>/<fullhash>.json.
func LoadDialogFile(baseDir, id string) ([]string, error) {
   // Compute content-based hash for new layout
   fullpath := filepath.Join(baseDir, id)
   contentHash, err := HashFile(fullpath)
   if err == nil {
       leafFile := filepath.Join(baseDir, "metadata", contentHash[:2], contentHash, "dialog.json")
       data, err := ioutil.ReadFile(leafFile)
       if err == nil {
           var entries []string
           if err := json.Unmarshal(data, &entries); err != nil {
               return nil, err
           }
           return entries, nil
       }
       if !os.IsNotExist(err) {
           return nil, err
       }
   } else {
       // If the image file is missing or unreadable, no dialog exists
       return []string{}, nil
   }
   // Fallback to legacy flat and nested dialogs directory (filename-based hashing)
   oldHash := hashString(id)
   flatDir := filepath.Join(baseDir, "dialogs")
   flatFile := filepath.Join(flatDir, oldHash+".json")
   data, err = ioutil.ReadFile(flatFile)
   if err == nil {
       var entries []string
       if err := json.Unmarshal(data, &entries); err != nil {
           return nil, err
       }
       return entries, nil
   }
   if !os.IsNotExist(err) {
       return nil, err
   }
   // Legacy nested format
   nestedFile := filepath.Join(baseDir, "dialogs", oldHash[:2], oldHash+".json")
   data, err = ioutil.ReadFile(nestedFile)
   if err == nil {
       var entries []string
       if err := json.Unmarshal(data, &entries); err != nil {
           return nil, err
       }
       return entries, nil
   }
   if os.IsNotExist(err) {
       return []string{}, nil
   }
   return nil, err
}

// SaveDialogFile writes dialog entries for the given id to a file-based store.
// It creates necessary subdirectories under baseDir/dialogs.
func SaveDialogFile(baseDir, id string, entries []string) error {
   // Compute content-based hash for this image
   fullpath := filepath.Join(baseDir, id)
   contentHash, err := HashFile(fullpath)
   if err != nil {
       return err
   }
   // Create leaf directory under metadata layout
   leafDir := filepath.Join(baseDir, "metadata", contentHash[:2], contentHash)
   if err := os.MkdirAll(leafDir, 0755); err != nil {
       return err
   }
   // Ensure symlink to image file
   imgPath := filepath.Join(baseDir, id)
   rel, err := filepath.Rel(leafDir, imgPath)
   if err != nil {
       rel = imgPath
   }
   link := filepath.Join(leafDir, "image")
   _ = os.Remove(link)
   _ = os.Symlink(rel, link)
   // Write dialog entries to dialog.json
   file := filepath.Join(leafDir, "dialog.json")
   data, err := json.MarshalIndent(entries, "", "  ")
   if err != nil {
       return err
   }
   return ioutil.WriteFile(file, data, 0644)
}
// DeleteDialogEntry removes the dialog file for a given image ID or hash.
func DeleteDialogEntry(baseDir, id string) error {
   var h string
   // If id is a full hash, use directly; otherwise compute hash from file content
   if len(id) == 64 && isHex(id) {
       h = id
   } else {
       fullpath := filepath.Join(baseDir, id)
       var err error
       h, err = HashFile(fullpath)
       if err != nil {
           // Nothing to delete if file absent
           if os.IsNotExist(err) {
               return nil
           }
           return err
       }
   }
   // Remove new layout dialog.json
   leafFile := filepath.Join(baseDir, "metadata", h[:2], h, "dialog.json")
   _ = os.Remove(leafFile)
   return nil
}

// MoveDialogEntry is a no-op under content-based hashing (dialog IDs stable).
func MoveDialogEntry(baseDir, oldID, newID string) error {
   return nil
}