package storage

import (
   "encoding/json"
   "io/ioutil"
   "os"
   "path/filepath"
)

// LoadMetadataFile reads JSON metadata from the given path.
// Returns an empty map on error.
func LoadMetadataFile(path string) map[string]string {
   m := make(map[string]string)
   data, err := ioutil.ReadFile(path)
   if err != nil {
       return m
   }
   _ = json.Unmarshal(data, &m)
   return m
}

// SaveMetadataFile writes the metadata map as JSON to the given path.
func SaveMetadataFile(path string, m map[string]string) error {
   data, err := json.MarshalIndent(m, "", "  ")
   if err != nil {
       return err
   }
   return ioutil.WriteFile(path, data, 0644)
}

// SaveMetaEntry writes the timestamp for a single image ID to hashed file storage.
func SaveMetaEntry(baseDir, id, ts string) error {
   h := hashString(id)
   dir := filepath.Join(baseDir, "metadata", h[:2])
   if err := os.MkdirAll(dir, 0755); err != nil {
       return err
   }
   file := filepath.Join(dir, h+".json")
   data, err := json.Marshal(ts)
   if err != nil {
       return err
   }
   return ioutil.WriteFile(file, data, 0644)
}

// LoadMetaEntry reads the timestamp for a single image ID from hashed file storage.
// Returns empty string if not found.
func LoadMetaEntry(baseDir, id string) (string, error) {
   h := hashString(id)
   file := filepath.Join(baseDir, "metadata", h[:2], h+".json")
   data, err := ioutil.ReadFile(file)
   if err != nil {
       if os.IsNotExist(err) {
           return "", nil
       }
       return "", err
   }
   var ts string
   if err := json.Unmarshal(data, &ts); err != nil {
       return "", err
   }
   return ts, nil
}

// DeleteMetaEntry removes the metadata file for a given image ID.
func DeleteMetaEntry(baseDir, id string) error {
   h := hashString(id)
   file := filepath.Join(baseDir, "metadata", h[:2], h+".json")
   if err := os.Remove(file); err != nil && !os.IsNotExist(err) {
       return err
   }
   return nil
}

// MigrateMetadata converts an existing metadata.json file into hashed metadata files.
// It writes per-ID metadata entries and removes the old file.
func MigrateMetadata(baseDir string) error {
   oldPath := filepath.Join(baseDir, "metadata.json")
   data, err := ioutil.ReadFile(oldPath)
   if err != nil {
       if os.IsNotExist(err) {
           return nil
       }
       return err
   }
   var m map[string]string
   if err := json.Unmarshal(data, &m); err != nil {
       return err
   }
   for id, ts := range m {
       if err := SaveMetaEntry(baseDir, id, ts); err != nil {
           return err
       }
   }
   return os.Remove(oldPath)
}