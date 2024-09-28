package server

import (
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/config"
)

func Init() {
	c := config.GetConfig()
	r := NewRouter()

	r.Run(":" + c.Port)
}
