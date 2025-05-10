package storage

import (
   "os"
   "strings"
   "time"

   "github.com/rwcarlsen/goexif/exif"
)

// ParseExifTimestamp extracts DateTimeOriginal from EXIF metadata.
func ParseExifTimestamp(path string) (*time.Time, error) {
   f, err := os.Open(path)
   if err != nil {
       return nil, err
   }
   defer f.Close()
   x, err := exif.Decode(f)
   if err != nil {
       return nil, err
   }
   tag, err := x.Get(exif.DateTimeOriginal)
   if err != nil {
       return nil, err
   }
   str := strings.Trim(tag.String(), "\"")
   t, err := time.Parse("2006:01:02 15:04:05", str)
   if err != nil {
       return nil, err
   }
   return &t, nil
}