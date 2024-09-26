package main

import (
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/redis"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/server"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/socket"
)

func main() {
	socket.Init()
	redis.Init()
	server.Init()
}
