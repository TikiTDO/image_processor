package storage

import (
   "os"
   "time"
)

// GetFileTimestamp returns file modification time as a fallback.
func GetFileTimestamp(path string) time.Time {
   info, err := os.Stat(path)
   if err != nil {
       return time.Now()
   }
   return info.ModTime()
}