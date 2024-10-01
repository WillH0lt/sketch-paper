package main

import (
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/server"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/socket"
)

func main() {
	socket.Init()
	redis.Init()
	server.Init()
}
