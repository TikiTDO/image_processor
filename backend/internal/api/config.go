package api

import (
   "path/filepath"
)

// ImageDir is the root directory for images and metadata.
var ImageDir string

// SetImageDir sets the base directory for image operations.
func SetImageDir(dir string) {
   ImageDir = dir
}

// getSpeakerMetaPath returns the path to the speaker metadata file.
func getSpeakerMetaPath() string {
   return filepath.Join(ImageDir, "speaker_metadata.json")
}