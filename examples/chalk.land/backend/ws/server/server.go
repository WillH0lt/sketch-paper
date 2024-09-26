package server

import "github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/config"

func Init() {
	config := config.GetConfig()
	r := NewRouter()
	r.Run(":" + config.Port)
}
