package server

import "github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/config"

func Init() {
	config := config.GetConfig()
	r := NewRouter()
	r.Run(":" + config.Port)
}
