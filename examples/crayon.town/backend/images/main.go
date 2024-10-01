package main

import (
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/chrome"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/server"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/storage"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/workerpool"
)

func main() {
	redis.Init()
	workerpool.Init()
	storage.Init()
	chrome.Init()
	server.Init()
}
