package main

import (
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/redis"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/server"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/storage"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/workerpool"
)

func main() {
	redis.Init()
	workerpool.Init()
	storage.Init()
	server.Init()
}
