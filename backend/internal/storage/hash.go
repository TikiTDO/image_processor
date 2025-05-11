package storage

import (
   "crypto/sha256"
   "encoding/hex"
   "io"
   "os"
)

// HashFile computes the SHA-256 hex digest of the file at the given path.
func HashFile(path string) (string, error) {
   f, err := os.Open(path)
   if err != nil {
       return "", err
   }
   defer f.Close()
   hasher := sha256.New()
   if _, err := io.Copy(hasher, f); err != nil {
       return "", err
   }
   return hex.EncodeToString(hasher.Sum(nil)), nil
}

// isHex reports whether s is a valid hex string of even length.
func isHex(s string) bool {
   if len(s)%2 != 0 {
       return false
   }
   _, err := hex.DecodeString(s)
   return err == nil
}