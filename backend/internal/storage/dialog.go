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
   h := hashString(id)
   dir := filepath.Join(baseDir, "dialogs")
   file := filepath.Join(dir, h+".json")
   data, err := ioutil.ReadFile(file)
   if err != nil {
       if os.IsNotExist(err) {
           // try legacy nested directory format
           legacyFile := filepath.Join(baseDir, "dialogs", h[:2], h+".json")
           data, err = ioutil.ReadFile(legacyFile)
           if err != nil {
               if os.IsNotExist(err) {
                   return []string{}, nil
               }
               return nil, err
           }
       } else {
           return nil, err
       }
   }
   var entries []string
   if err := json.Unmarshal(data, &entries); err != nil {
       return nil, err
   }
   return entries, nil
}

// SaveDialogFile writes dialog entries for the given id to a file-based store.
// It creates necessary subdirectories under baseDir/dialogs.
func SaveDialogFile(baseDir, id string, entries []string) error {
   h := hashString(id)
   dir := filepath.Join(baseDir, "dialogs")
   if err := os.MkdirAll(dir, 0755); err != nil {
       return err
   }
   file := filepath.Join(dir, h+".json")
   data, err := json.MarshalIndent(entries, "", "  ")
   if err != nil {
       return err
   }
   return ioutil.WriteFile(file, data, 0644)
}
// DeleteDialogEntry removes the dialog file for a given image ID.
// It deletes the JSON file stored under baseDir/dialogs.
func DeleteDialogEntry(baseDir, id string) error {
   h := hashString(id)
   // Flat layout: dialogs/<hash>.json
   file := filepath.Join(baseDir, "dialogs", h+".json")
   if err := os.Remove(file); err != nil && !os.IsNotExist(err) {
       return err
   }
   return nil
}

// MoveDialogEntry renames a dialog file from oldID to newID in hashed storage.
// It also attempts to move from legacy nested layout.
func MoveDialogEntry(baseDir, oldID, newID string) error {
   hOld := hashString(oldID)
   hNew := hashString(newID)
   // Determine old file path (flat or legacy nested)
   flatDir := filepath.Join(baseDir, "dialogs")
   oldFlat := filepath.Join(flatDir, hOld+".json")
   oldNested := filepath.Join(flatDir, hOld[:2], hOld+".json")
   src := oldFlat
   if _, err := os.Stat(src); os.IsNotExist(err) {
       src = oldNested
   }
   // Ensure destination directory exists
   if err := os.MkdirAll(flatDir, 0755); err != nil {
       return err
   }
   dst := filepath.Join(flatDir, hNew+".json")
   if err := os.Rename(src, dst); err != nil {
       if os.IsNotExist(err) {
           return nil
       }
       return err
   }
   return nil
}