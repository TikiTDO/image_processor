package api

import "image-processor-backend/internal/forgeclient"

// ForgeSvc is the client used to communicate with the SD-Forge server.
// It can be overridden in tests with a mock implementation.
var ForgeSvc forgeclient.Client

// SetForgeClient replaces the default ForgeSvc with the provided implementation.
func SetForgeClient(c forgeclient.Client) {
   ForgeSvc = c
}