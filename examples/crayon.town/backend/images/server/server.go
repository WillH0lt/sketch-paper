package server

import (
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/config"
)

func Init() {
	c := config.GetConfig()
	r := NewRouter()

	r.Run(":" + c.Port)
}
