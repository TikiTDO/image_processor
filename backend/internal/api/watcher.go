package api

import (
   "log"
   "os"
   "path/filepath"
   "sync"

   "github.com/fsnotify/fsnotify"
)

var (
   subsMu           sync.Mutex
   eventSubscribers = make(map[chan string]struct{})
)

// subscribe registers a new channel to receive file change events.
func subscribe() chan string {
   ch := make(chan string)
   subsMu.Lock()
   eventSubscribers[ch] = struct{}{}
   subsMu.Unlock()
   return ch
}

// unsubscribe removes a channel from subscribers and closes it.
func unsubscribe(ch chan string) {
   subsMu.Lock()
   delete(eventSubscribers, ch)
   subsMu.Unlock()
   close(ch)
}

// broadcastEvent sends a path string to all subscribers.
func broadcastEvent(path string) {
   subsMu.Lock()
   defer subsMu.Unlock()
   for ch := range eventSubscribers {
       select {
       case ch <- path:
       default:
       }
   }
}

// StartWatcher begins watching the directory tree rooted at root for changes.
func StartWatcher(root string) error {
   watcher, err := fsnotify.NewWatcher()
   if err != nil {
       return err
   }
   // Walk initial directories
   filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
       if err == nil && info.IsDir() {
           watcher.Add(path)
       }
       return nil
   })
   // Process events
   go func() {
       for {
           select {
           case event, ok := <-watcher.Events:
               if !ok {
                   return
               }
               if event.Op&(fsnotify.Create|fsnotify.Write|fsnotify.Remove|fsnotify.Rename|fsnotify.Chmod) != 0 {
                   broadcastEvent(event.Name)
                   if event.Op&fsnotify.Create != 0 {
                       if fi, err := os.Stat(event.Name); err == nil && fi.IsDir() {
                           watcher.Add(event.Name)
                       }
                   }
               }
           case err, ok := <-watcher.Errors:
               if !ok {
                   return
               }
               log.Println("Watcher error:", err)
           }
       }
   }()
   return nil
}